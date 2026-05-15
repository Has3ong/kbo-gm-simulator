package com.kbo.gm.domain.season.service;

import com.kbo.gm.common.dto.PageResult;
import com.kbo.gm.common.util.GameUtil;
import com.kbo.gm.domain.season.dao.SsntDao;
import com.kbo.gm.domain.season.dto.*;
import com.kbo.gm.domain.season.mapper.SsntMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class SsntService {

    private final SsntMapper ssntMapper;
    private final JdbcTemplate jdbcTemplate;
    @Lazy
    private final FrgnPlrService frgnPlrService;

    public List<SsntResponse> findAll() {
        return ssntMapper.findAll().stream().map(SsntResponse::from).toList();
    }

    public SsntResponse findByYear(Integer ssntYr) {
        SsntDao dao = ssntMapper.findByYear(ssntYr);
        if (dao == null) throw new IllegalArgumentException("시즌을 찾을 수 없습니다: " + ssntYr);
        return SsntResponse.from(dao);
    }

    public List<StndResponse> findStandings(Integer ssntYr) {
        return ssntMapper.findStandings(ssntYr).stream().map(StndResponse::from).toList();
    }

    public PageResult<SsntEvntResponse> findEvents(Integer ssntYr, Long tmId, String evntTypeCd, int page, int size) {
        int offset = page * size;
        List<SsntEvntResponse> content = ssntMapper.findEvents(ssntYr, tmId, evntTypeCd, offset, size)
                .stream().map(SsntEvntResponse::from).toList();
        int total = ssntMapper.countEvents(ssntYr, tmId, evntTypeCd);
        return new PageResult<>(content, page, size, total);
    }

    public void markEventRead(Long evntId) {
        ssntMapper.markEventRead(evntId);
    }

    public Map<String, Object> checkAdvance(Integer ssntYr) {
        SsntDao dao = ssntMapper.findByYear(ssntYr);
        if (dao == null) throw new IllegalArgumentException("시즌을 찾을 수 없습니다: " + ssntYr);

        String curDt = dao.getCurDt() != null ? dao.getCurDt().toString() : null;
        boolean broadcasterSelected = ssntMapper.findCfgVal("BRDCST_SPNSR") != null;

        int incompleteGames = curDt != null
                ? ssntMapper.countIncompleteGamesOnDate(ssntYr, curDt)
                : 0;

        Long userTmId = GameUtil.getUserTmId(jdbcTemplate);
        boolean stffHired       = "1".equals(ssntMapper.findCfgVal("STFF_HIRED"));
        boolean springCampDone  = "1".equals(ssntMapper.findCfgVal("SPRING_CAMP_DONE"));
        boolean rosterConfirmed = "1".equals(ssntMapper.findCfgVal("ROSTER_CONFIRMED"));

        // 스프링 캠프는 2/15 이후부터 필수
        LocalDate curDate = dao.getCurDt();
        LocalDate feb15 = curDate != null ? LocalDate.of(ssntYr, 2, 15) : null;
        boolean springCampRequired = curDate != null && !curDate.isBefore(feb15);

        // PRE 시즌: 방송국 선택 + 스태프 계약 + (2/15 이후) 스프링캠프 + (캠프 완료 후) 로스터 확정
        // REG/POST: 미완료 경기만 없으면 됨
        boolean canAdvance;
        if ("PRE".equals(dao.getSsntSttsCd())) {
            canAdvance = broadcasterSelected && stffHired
                    && (!springCampRequired || springCampDone)
                    && (!springCampDone || rosterConfirmed)
                    && incompleteGames == 0;
        } else {
            canAdvance = broadcasterSelected && incompleteGames == 0;
        }

        // 외국인 선수 초과 여부 (1군에 외국인 3명 초과)
        int frgnPlrCount = 0;
        boolean frgnPlrExceeded = false;
        if (userTmId != null) {
            frgnPlrCount = countFrgnPlrIn1Gun(userTmId, ssntYr);
            frgnPlrExceeded = frgnPlrCount > 3;
            if (frgnPlrExceeded) {
                ensureFrgnPlrExceededEvent(ssntYr, userTmId, curDt, frgnPlrCount);
            }
        }
        if (frgnPlrExceeded) canAdvance = false;  // 외국인 초과 시 무조건 차단 (REG/POST 포함)

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("canAdvance", canAdvance);
        result.put("broadcasterSelected", broadcasterSelected);
        result.put("stffHired", stffHired);
        result.put("springCampDone", springCampDone);
        result.put("springCampRequired", springCampRequired);
        result.put("rosterConfirmed", rosterConfirmed);
        result.put("frgnPlrExceeded", frgnPlrExceeded);
        result.put("incompleteGamesCount", incompleteGames);
        result.put("currentDate", curDt);
        return result;
    }

    public SsntResponse advanceDate(Integer ssntYr) {
        Map<String, Object> check = checkAdvance(ssntYr);
        if (!(Boolean) check.get("canAdvance")) {
            throw new IllegalStateException("날짜를 진행할 수 없습니다. 필수 이벤트를 완료해주세요.");
        }
        ssntMapper.advanceDate(ssntYr);

        // PRE 시즌 2/1~2/10: 외국인 선수 오퍼 일별 처리
        SsntDao updated = ssntMapper.findByYear(ssntYr);
        if (updated != null && "PRE".equals(updated.getSsntSttsCd()) && updated.getCurDt() != null) {
            try {
                frgnPlrService.processDailyOffers(ssntYr, updated.getCurDt().toString());
            } catch (Exception e) {
                log.warn("외국인 오퍼 처리 실패 (무시): {}", e.getMessage());
            }
        }

        applyStatusTransition(ssntYr);
        return findByYear(ssntYr);
    }

    /** 스태프 계약 완료 후 스프링캠프 날짜(3월 15일)로 날짜를 이동한다. */
    public SsntResponse advanceToSpring(Integer ssntYr) {
        SsntDao dao = ssntMapper.findByYear(ssntYr);
        if (dao == null) throw new IllegalArgumentException("시즌을 찾을 수 없습니다: " + ssntYr);
        LocalDate springDate = LocalDate.of(ssntYr, 3, 15);
        jdbcTemplate.update("UPDATE SSNT SET CUR_DT = ? WHERE SSNT_YR = ?", springDate.toString(), ssntYr);
        return findByYear(ssntYr);
    }

    /**
     * 날짜 진행 후 CUR_DT 기준으로 시즌 상태를 전이한다.
     * PRE → REG : CUR_DT >= REG_SSNT_BGNG_DT (4월 1일)
     * REG → POST: CUR_DT >= PSTSSNT_BGNG_DT  (10월 7일)
     * POST → OFF: CUR_DT >= SSNT_END_DT       (11월 1일)
     */
    private void applyStatusTransition(Integer ssntYr) {
        SsntDao dao = ssntMapper.findByYear(ssntYr);
        if (dao == null || dao.getCurDt() == null) return;

        java.time.LocalDate cur    = dao.getCurDt();
        String status              = dao.getSsntSttsCd();

        if ("PRE".equals(status)) {
            LocalDate feb15 = LocalDate.of(ssntYr, 2, 15);
            if (!cur.isBefore(feb15)) {
                Long userTmId = GameUtil.getUserTmId(jdbcTemplate);
                ensureSpringCampEvent(ssntYr, userTmId, cur.toString());
            }
            if (dao.getRegSsntBgngDt() != null && !cur.isBefore(dao.getRegSsntBgngDt())) {
                ssntMapper.updateSsntStatus(ssntYr, "REG");
                createRankingPredictionEvent(ssntYr);
            }
        } else if ("REG".equals(status) && dao.getPstssntBgngDt() != null
                && !cur.isBefore(dao.getPstssntBgngDt())) {
            ssntMapper.updateSsntStatus(ssntYr, "POST");

        } else if ("POST".equals(status) && dao.getSsntEndDt() != null
                && !cur.isBefore(dao.getSsntEndDt())) {
            ssntMapper.updateSsntStatus(ssntYr, "OFF");
        }
    }

    private void ensureSpringCampEvent(Integer ssntYr, Long userTmId, String curDt) {
        if (userTmId == null) return;
        try {
            Integer existing = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM SSNT_EVNT WHERE SSNT_YR = ? AND TM_ID = ? AND EVNT_TYPE_CD = 'SPRNG'",
                Integer.class, ssntYr, userTmId);
            if (existing != null && existing > 0) return;
        } catch (Exception e) { return; }

        jdbcTemplate.update(
            "INSERT INTO SSNT_EVNT (SSNT_YR, EVNT_DT, TM_ID, EVNT_TYPE_CD, EVNT_TTLT, EVNT_CNTS, RD_YN) " +
            "VALUES (?,?,?,'SPRNG',?,?,'0')",
            ssntYr, curDt, userTmId,
            ssntYr + "년 스프링 캠프 참가 신청",
            "스프링 캠프 시즌이 시작되었습니다.\n\n" +
            "스프링 캠프는 선수들의 능력치 성장과 컨디션 향상에 중요한 역할을 합니다.\n" +
            "아래 '스프링 캠프 선택하기' 버튼을 눌러 참가할 캠프를 선택해주세요.\n\n" +
            "※ 스프링 캠프 선택 완료 후 날짜가 3월 15일로 이동됩니다.");
    }

    /** REG 시즌 시작 시 전문가 순위 예상 이벤트를 생성한다. */
    private void createRankingPredictionEvent(Integer ssntYr) {
        // 유저 팀 ID 조회
        Long userTmId;
        try {
            userTmId = jdbcTemplate.queryForObject(
                "SELECT CFG_VAL FROM GAME_CFG WHERE CFG_KEY='USER_TM_ID'", Long.class);
        } catch (Exception e) {
            return;
        }
        if (userTmId == null) return;

        // 팀별 평균 능력치 조회 (현역 선수 기준)
        List<Map<String, Object>> tmStats = jdbcTemplate.queryForList(
            "SELECT p.TM_ID, t.TM_NM, AVG(p.PLR_OVRL_ABLT) AS avg_ovrl, COUNT(*) AS plr_cnt " +
            "FROM PLR p JOIN TM t ON p.TM_ID = t.TM_ID " +
            "WHERE p.PLR_STTS_CD='AT' " +
            "GROUP BY p.TM_ID, t.TM_NM " +
            "ORDER BY avg_ovrl DESC");

        // 이벤트 내용 포맷
        StringBuilder sb = new StringBuilder();
        sb.append(ssntYr).append("시즌 전문가 순위 예상\n\n");
        sb.append(String.format("%-4s %-14s %-10s %s%n", "순위", "팀명", "평균 능력치", "총 선수"));

        int rank = 1;
        for (Map<String, Object> row : tmStats) {
            String tmNm   = (String) row.get("TM_NM");
            double avgOvrl = row.get("avg_ovrl") instanceof Number n ? n.doubleValue() : 0.0;
            int    plrCnt  = row.get("plr_cnt")  instanceof Number n ? n.intValue()    : 0;
            sb.append(String.format("%-4s %-14s %-10.1f %d명%n",
                rank + "위", tmNm != null ? tmNm : "알수없음", avgOvrl, plrCnt));
            rank++;
        }

        sb.append("\n※ 각 팀의 현재 선수 능력치를 분석한 예상 순위입니다.");

        String evntDt = jdbcTemplate.queryForObject(
            "SELECT CUR_DT FROM SSNT WHERE SSNT_YR=?", String.class, ssntYr);

        jdbcTemplate.update(
            "INSERT INTO SSNT_EVNT (SSNT_YR, EVNT_DT, TM_ID, EVNT_TYPE_CD, EVNT_TTLT, EVNT_CNTS) " +
            "VALUES (?,?,?,'NEWS',?,?)",
            ssntYr, evntDt, userTmId,
            ssntYr + "시즌 개막 전문가 순위 예상",
            sb.toString());
    }

    private int countFrgnPlrIn1Gun(Long tmId, Integer ssntYr) {
        try {
            Integer cnt = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM PLR_ENTY E " +
                "JOIN PLR_TM_CNTRCT C ON C.PLR_ID = E.PLR_ID AND C.TM_ID = E.TM_ID " +
                "WHERE E.TM_ID = ? AND E.SSNT_YR = ? AND E.ENTY_LVL_CD = '1' AND C.CNTRCT_TYPE_CD = 'FR'",
                Integer.class, tmId, ssntYr);
            return cnt != null ? cnt : 0;
        } catch (Exception e) { return 0; }
    }

    private void ensureFrgnPlrExceededEvent(Integer ssntYr, Long tmId, String curDt, int count) {
        // 이미 미읽음 FRGN_OVER 이벤트가 있으면 생성 안 함
        try {
            Integer existing = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM SSNT_EVNT WHERE SSNT_YR = ? AND TM_ID = ? AND EVNT_TYPE_CD = 'FRGN_OVER' AND RD_YN = '0'",
                Integer.class, ssntYr, tmId);
            if (existing != null && existing > 0) return;
        } catch (Exception e) { /* ignore */ }

        String dt = curDt != null ? curDt : java.time.LocalDate.now().toString();
        jdbcTemplate.update(
            "INSERT INTO SSNT_EVNT (SSNT_YR, EVNT_DT, TM_ID, EVNT_TYPE_CD, EVNT_TTLT, EVNT_CNTS, RD_YN) " +
            "VALUES (?,?,?,'FRGN_OVER',?,?,'0')",
            ssntYr, dt, tmId,
            "외국인 용병 보유 초과 알림",
            String.format(
                "현재 1군에 외국인 선수가 %d명 등록되어 있습니다. (최대 3명)\n\n" +
                "날짜를 진행하려면 외국인 선수 1명 이상을 방출하거나 2군으로 이동해야 합니다.\n" +
                "로스터 확정 화면에서 외국인 선수를 선택하여 방출 처리해주세요.", count));
    }

    /** 스프링 캠프 성장 내역 조회 */
    public List<Map<String, Object>> findSpringCampGrowth(Integer ssntYr) {
        return jdbcTemplate.queryForList(
            "SELECT l.PLR_ID AS plrId, p.PLR_NM AS plrNm, l.GRWTH_DT AS grwthDt, " +
            "       l.ABLT_CD AS abltCd, l.ABLT_VAL_BFR AS abltValBfr, l.ABLT_VAL_AFT AS abltValAft, " +
            "       (l.ABLT_VAL_AFT - l.ABLT_VAL_BFR) AS delta " +
            "FROM PLR_GRWTH_LOG l " +
            "JOIN PLR p ON l.PLR_ID = p.PLR_ID " +
            "WHERE l.SSNT_YR = ? AND l.GRWTH_TYPE = 'SPRING_CAMP' " +
            "ORDER BY p.PLR_NM, l.ABLT_CD",
            ssntYr);
    }
}
