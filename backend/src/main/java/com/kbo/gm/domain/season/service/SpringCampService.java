package com.kbo.gm.domain.season.service;

import com.kbo.gm.common.util.GameUtil;
import com.kbo.gm.domain.season.dao.SpringCampCfgDao;
import com.kbo.gm.domain.season.mapper.SsntMapper;
import com.kbo.gm.domain.team.mapper.TmMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class SpringCampService {

    /** 투수 구속(VEL) 능력치 상한 (163km/h 기준) */
    public static final int PITCHER_VEL_CAP = 77;

    /** 성장 확률이 절반이 되는 능력치 임계값 */
    private static final int GROWTH_HALF_THRESHOLD = 65;

    private final SsntMapper ssntMapper;
    private final JdbcTemplate jdbcTemplate;
    private final TmMapper tmMapper;
    private final SpringCampCfgService springCampCfgService;

    // ============================================================
    // 공개 API
    // ============================================================

    /** 모든 스프링 캠프 위치 목록 반환 */
    public List<Map<String, Object>> getLocations() {
        List<Map<String, Object>> result = new ArrayList<>();
        for (SpringCampCfgDao cfg : springCampCfgService.findAll()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("code",             cfg.getCampCd());
            m.put("name",             cfg.getCampNm());
            m.put("cost",             cfg.getCost());
            m.put("tier",             cfg.getTier());
            m.put("growthAbltCount",  cfg.getGrowthAbltCnt());
            m.put("maxGrowthPerAblt", cfg.getMaxGrowthPerAblt());
            result.add(m);
        }
        return result;
    }

    /** 유저 팀 스프링 캠프 실행 */
    @Transactional
    public void selectCamp(String locationCode) {
        SpringCampCfgDao loc = springCampCfgService.findByCampCd(locationCode);

        Long    userTmId = GameUtil.getUserTmId(jdbcTemplate);
        Integer ssntYr   = GameUtil.getCurrentSsntYr(jdbcTemplate);
        String  curDt    = findCurrentDate();
        if (userTmId == null || ssntYr == null) throw new IllegalStateException("유저 팀 정보 없음");

        // 캠프 비용 차감
        jdbcTemplate.update(
            "INSERT INTO TM_FNC_SSNT (TM_ID, SSNT_YR, STFF_COST) VALUES (?,?,?) " +
            "ON DUPLICATE KEY UPDATE STFF_COST=COALESCE(STFF_COST,0)+VALUES(STFF_COST), " +
            "CUR_CASH=COALESCE(CUR_CASH,0)-VALUES(STFF_COST)",
            userTmId, ssntYr, loc.getCost());

        // 재정 이력 기록
        tmMapper.insertFinanceLog(userTmId, ssntYr, curDt != null ? curDt : LocalDate.of(ssntYr, 2, 1).toString(),
            "EXPENSE", "SPRING_CAMP",
            loc.getCost(),
            loc.getCampNm() + " 스프링 캠프 선택 (Tier " + loc.getTier() + ")");

        // 유저 팀 선수 성장 적용 (성장 로그 포함)
        List<Map<String, Object>> players = findTeamPlayers(userTmId);
        int[] growthStats = applyGrowthWithLog(players, loc, ssntYr, curDt, true);
        int grownPlayerCount = growthStats[0];
        int totalGrowthCount = growthStats[1];

        // SPRING_CAMP_DONE 플래그
        GameUtil.upsertCfg(jdbcTemplate, "SPRING_CAMP_DONE", "1");
        GameUtil.upsertCfg(jdbcTemplate, "SPRING_CAMP_LOC", locationCode);

        // CUR_DT를 3월 15일로 이동
        LocalDate march15 = LocalDate.of(ssntYr, 3, 15);
        jdbcTemplate.update("UPDATE SSNT SET CUR_DT=? WHERE SSNT_YR=?", march15.toString(), ssntYr);

        // 유저 팀: GRWTH 이벤트 + RCNF 이벤트 생성
        createGrwthEvnt(ssntYr, march15.toString(), userTmId, loc, grownPlayerCount, totalGrowthCount);
        createRcnfEvnt(ssntYr, march15.toString(), userTmId);

        // AI 팀 스프링 캠프 자동 선택
        runAiCamps(ssntYr, curDt, userTmId);

        log.info("스프링 캠프 완료: tmId={} loc={} 선수={}명 성장선수={}명 총성장={}회",
                userTmId, loc.getCampNm(), players.size(), grownPlayerCount, totalGrowthCount);
    }

    // ============================================================
    // Private helpers
    // ============================================================

    /**
     * 선수 성장 적용 + (조건부) PLR_GRWTH_LOG 기록.
     * @param writeLog true면 PLR_GRWTH_LOG 기록, false면 생략
     * @return int[2] = { 성장한 선수 수, 총 성장 횟수 }
     */
    private int[] applyGrowthWithLog(List<Map<String, Object>> players, SpringCampCfgDao loc,
                                      int ssntYr, String curDt, boolean writeLog) {
        Random rnd = new Random();
        Set<Long> grownPlayers = new HashSet<>();
        int totalGrowthCount = 0;

        for (Map<String, Object> plr : players) {
            long plrId = toLong(plr.get("PLR_ID"));
            int  ovrl  = toInt(plr.get("PLR_OVRL_ABLT"));
            int  pot   = toInt(plr.get("PLR_POT_ABLT"));

            // 종합 능력치 성장
            int ovrlDelta = calcGrowthDelta(ovrl, pot, loc.getMaxOvrlGrowth(), rnd);
            if (ovrlDelta > 0) {
                int newOvrl = Math.min(pot, Math.min(80, ovrl + ovrlDelta));
                jdbcTemplate.update("UPDATE PLR SET PLR_OVRL_ABLT=? WHERE PLR_ID=?", newOvrl, plrId);
                grownPlayers.add(plrId);
                totalGrowthCount++;
            }

            // 개별 능력치 성장
            List<Map<String, Object>> ablts = findPlrAblts(plrId);
            if (ablts.isEmpty()) continue;

            Collections.shuffle(ablts, rnd);
            int growCount = Math.min(loc.getGrowthAbltCnt(), ablts.size());
            for (int i = 0; i < growCount; i++) {
                Map<String, Object> ablt = ablts.get(i);
                String abltCd  = (String) ablt.get("ABLT_CD");
                int    curVal  = toInt(ablt.get("ABLT_VAL"));
                int    maxDelt = loc.getMaxGrowthPerAblt();

                // 투수 구속 상한 적용
                int cap = (abltCd != null && abltCd.equals("VEL")) ? Math.min(PITCHER_VEL_CAP, pot) : Math.min(pot, 80);

                int delta = calcGrowthDelta(curVal, cap, maxDelt, rnd);
                if (delta > 0) {
                    int newVal = Math.min(cap, curVal + delta);
                    jdbcTemplate.update(
                        "UPDATE PLR_ABLT SET ABLT_VAL=? WHERE PLR_ID=? AND ABLT_CD=?",
                        newVal, plrId, abltCd);

                    if (writeLog) {
                        // PLR_GRWTH_LOG 기록
                        jdbcTemplate.update(
                            "INSERT INTO PLR_GRWTH_LOG (PLR_ID,SSNT_YR,GRWTH_DT,GRWTH_TYPE,ABLT_CD,ABLT_VAL_BFR,ABLT_VAL_AFT) " +
                            "VALUES (?,?,?,?,?,?,?)",
                            plrId, ssntYr, curDt, "SPRING_CAMP", abltCd, curVal, newVal);
                    }

                    grownPlayers.add(plrId);
                    totalGrowthCount++;
                }
            }
        }

        return new int[]{ grownPlayers.size(), totalGrowthCount };
    }

    /**
     * 20-80 스케일 성장 계산.
     * 현재값이 높을수록 성장 확률이 낮아진다.
     * GROWTH_HALF_THRESHOLD(65) 이상부터 확률이 급격히 감소.
     */
    private int calcGrowthDelta(int curVal, int cap, int maxDelta, Random rnd) {
        if (curVal >= cap) return 0;

        // 성장 확률: curVal이 낮을수록 높음
        // 40 이하: 100% | 65: 50% | 75: 20% | 80: 0%
        double prob;
        if (curVal <= 40) prob = 1.0;
        else if (curVal <= GROWTH_HALF_THRESHOLD) prob = 1.0 - (curVal - 40.0) / ((GROWTH_HALF_THRESHOLD - 40.0) * 2.0);
        else prob = Math.max(0, 0.5 - (curVal - GROWTH_HALF_THRESHOLD) * 0.06);

        if (rnd.nextDouble() > prob) return 0;

        // 실제 성장값: 1 ~ maxDelta (최대에 근접할수록 작은 값 더 높은 확률)
        int maxAllowed = Math.min(maxDelta, cap - curVal);
        if (maxAllowed <= 0) return 0;
        return rnd.nextInt(maxAllowed) + 1;
    }

    private void runAiCamps(int ssntYr, String curDt, Long userTmId) {
        List<Map<String, Object>> allTms = jdbcTemplate.queryForList("SELECT TM_ID FROM TM ORDER BY TM_ID");
        List<SpringCampCfgDao> locs = springCampCfgService.findAll(); // TIER 순 정렬

        for (Map<String, Object> tm : allTms) {
            long tmId = toLong(tm.get("TM_ID"));
            if (userTmId != null && tmId == userTmId) continue;

            // AI 팀 재정 기반 tier 선택
            Long curCash = 0L;
            try {
                curCash = jdbcTemplate.queryForObject(
                    "SELECT COALESCE(CUR_CASH, 0) FROM TM_FNC_SSNT WHERE TM_ID=? AND SSNT_YR=?",
                    Long.class, tmId, ssntYr);
            } catch (Exception ignored) {}
            if (curCash == null) curCash = 0L;

            int tier;
            if      (curCash >= 5000) tier = 5;
            else if (curCash >= 3000) tier = 4;
            else if (curCash >= 1000) tier = 3;
            else if (curCash >= 500)  tier = 2;
            else                      tier = 1;

            SpringCampCfgDao aiLoc = locs.get(tier - 1); // 0-based (TIER 순 정렬)

            // 캠프 비용 차감
            jdbcTemplate.update(
                "INSERT INTO TM_FNC_SSNT (TM_ID, SSNT_YR, STFF_COST) VALUES (?,?,?) " +
                "ON DUPLICATE KEY UPDATE STFF_COST=COALESCE(STFF_COST,0)+VALUES(STFF_COST), " +
                "CUR_CASH=COALESCE(CUR_CASH,0)-VALUES(STFF_COST)",
                tmId, ssntYr, aiLoc.getCost());

            // 재정 이력 기록
            tmMapper.insertFinanceLog(tmId, ssntYr, curDt != null ? curDt : LocalDate.of(ssntYr, 2, 1).toString(),
                "EXPENSE", "SPRING_CAMP", aiLoc.getCost(),
                aiLoc.getCampNm() + " 스프링 캠프 선택 (Tier " + aiLoc.getTier() + ")");

            // 선수 성장 적용 (AI도 로그 기록)
            List<Map<String, Object>> players = findTeamPlayers(tmId);
            int[] growthStats = applyGrowthWithLog(players, aiLoc, ssntYr, curDt, true);

            // 뉴스 이벤트 생성
            createCampEvnt(ssntYr, curDt, tmId, aiLoc, players.size(), growthStats[0], growthStats[1]);
        }
    }

    /** AI 팀용 NEWS 이벤트 생성 */
    private void createCampEvnt(int ssntYr, String curDt, Long tmId, SpringCampCfgDao loc,
                                 int plrCnt, int grownPlayerCount, int totalGrowthCount) {
        jdbcTemplate.update(
            "INSERT INTO SSNT_EVNT (SSNT_YR, EVNT_DT, TM_ID, EVNT_TYPE_CD, EVNT_TTLT, EVNT_CNTS) " +
            "VALUES (?,?,?,'NEWS',?,?)",
            ssntYr, curDt, tmId,
            loc.getCampNm() + " 스프링 캠프 선택",
            String.format("%s 스프링 캠프를 선택했습니다.\n비용: %,d만원 | 참가 선수: %d명\n" +
                "성장 선수: %d명 | 총 성장 횟수: %d회",
                loc.getCampNm(), loc.getCost(), plrCnt, grownPlayerCount, totalGrowthCount));
    }

    /** 유저 팀 성장 완료 이벤트 (GRWTH) */
    private void createGrwthEvnt(int ssntYr, String evntDt, Long tmId, SpringCampCfgDao loc,
                                  int grownPlayerCount, int totalGrowthCount) {
        String cnts = String.format(
            "스프링 캠프 성장 결과 요약\n캠프: %s (Tier %d)\n성장 선수: %d명 / 총 성장 횟수: %d",
            loc.getCampNm(), loc.getTier(), grownPlayerCount, totalGrowthCount);

        jdbcTemplate.update(
            "INSERT INTO SSNT_EVNT (SSNT_YR, EVNT_DT, TM_ID, EVNT_TYPE_CD, EVNT_TTLT, EVNT_CNTS) " +
            "VALUES (?,?,?,'GRWTH',?,?)",
            ssntYr, evntDt, tmId,
            "스프링 캠프 선수 성장 완료",
            cnts);
    }

    /** 1군 로스터 확정 요청 이벤트 (RCNF) */
    private void createRcnfEvnt(int ssntYr, String evntDt, Long tmId) {
        jdbcTemplate.update(
            "INSERT INTO SSNT_EVNT (SSNT_YR, EVNT_DT, TM_ID, EVNT_TYPE_CD, EVNT_TTLT, EVNT_CNTS) " +
            "VALUES (?,?,?,'RCNF',?,?)",
            ssntYr, evntDt, tmId,
            "1군 로스터 확정 필요",
            "3월 15일이 되었습니다. 정규시즌 시작 전 1군 로스터를 확정해주세요.");
    }

    private List<Map<String, Object>> findTeamPlayers(long tmId) {
        return jdbcTemplate.queryForList(
            "SELECT PLR_ID, PLR_OVRL_ABLT, PLR_POT_ABLT FROM PLR WHERE TM_ID=? AND PLR_STTS_CD='AT'", tmId);
    }

    private List<Map<String, Object>> findPlrAblts(long plrId) {
        return jdbcTemplate.queryForList(
            "SELECT ABLT_CD, ABLT_VAL FROM PLR_ABLT WHERE PLR_ID=?", plrId);
    }

    private String findCurrentDate() {
        try {
            return jdbcTemplate.queryForObject(
                "SELECT CUR_DT FROM SSNT ORDER BY SSNT_YR DESC LIMIT 1", String.class);
        } catch (Exception e) { return null; }
    }

    private int toInt(Object v) {
        if (v == null) return 0;
        if (v instanceof Number n) return n.intValue();
        try { return Integer.parseInt(v.toString()); } catch (Exception e) { return 0; }
    }

    private long toLong(Object v) {
        if (v == null) return 0L;
        if (v instanceof Number n) return n.longValue();
        try { return Long.parseLong(v.toString()); } catch (Exception e) { return 0L; }
    }
}
