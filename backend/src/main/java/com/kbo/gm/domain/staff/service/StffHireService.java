package com.kbo.gm.domain.staff.service;

import com.kbo.gm.domain.season.service.FrgnPlrService;
import com.kbo.gm.domain.staff.dto.StffCandidateDto;
import com.kbo.gm.domain.staff.dto.StffHireRequestDto;
import com.kbo.gm.domain.staff.mapper.StffHireMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Statement;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class StffHireService {

    // 감독 능력치 코드 목록
    private static final List<String> MGR_ABLT_CODES  = List.of("TAC","MOT","MAN","DISC","DET","ADP");
    // 코치 능력치 코드 목록
    private static final List<String> COACH_ABLT_CODES = List.of("TCNT","TTCH","TPWR","TCTL","TSTM","TVEL","TBRK","TRUN","TSTL","MOT","MAN");

    // 랜덤 이름 풀
    private static final String[] LAST  = {"김","이","박","최","정","강","조","윤","장","임","신","한","오","류","허"};
    private static final String[] FIRST = {
        "성준","민준","서준","도윤","시우","주원","하준","지후","지호","준서",
        "재현","승현","병철","태양","형준","동수","상민","병호","우진","성민",
        "태현","준혁","동혁","성호","재원","민호","현우","지훈","동현","상현"
    };

    private final StffHireMapper mapper;
    private final JdbcTemplate jdbcTemplate;
    @Lazy
    private final FrgnPlrService frgnPlrService;

    // ============================================================
    // 공개 API
    // ============================================================

    /** 방송국 계약 직후: 유저 팀 감독/코치 후보 생성 및 STFF_HIRED 초기화 */
    @Transactional
    public void onBrdcstSelected() {
        Integer ssntYr = mapper.findCurrentSsntYr();
        String  curDt  = mapper.findCurrentDate();
        Long    userTmId = mapper.findUserTmId();
        if (ssntYr == null || curDt == null) return;

        // STFF_HIRED 초기화: 방송국 선택 시 선임 상태 리셋 (새 시즌 방송국 재계약 시에도 대응)
        mapper.upsertCfg("STFF_HIRED", "0");

        // 기존 후보 초기화 후 새 후보 생성 (유저 팀용)
        mapper.clearCandidates();
        generateAndStoreCandidates();
        // AI 팀 선임은 유저 선임 완료 시 함께 처리

        // 감독·코치 선임 안내 뉴스 (REQUIRED_EVENT: STFF 필수 이벤트)
        if (userTmId != null) {
            createStffHireOpenEvnt(ssntYr, curDt, userTmId);
        }
    }

    /** 방송국 선택 직후 감독·코치 선임을 유도하는 STFF 안내 이벤트 생성 (중복 방지) */
    private void createStffHireOpenEvnt(int ssntYr, String curDt, Long userTmId) {
        try {
            Integer existing = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM SSNT_EVNT " +
                "WHERE SSNT_YR = ? AND TM_ID = ? AND EVNT_TYPE_CD = 'STFF' AND EVNT_DT = ?",
                Integer.class, ssntYr, userTmId, curDt);
            if (existing != null && existing > 0) return;
        } catch (Exception ex) { /* ignore */ }

        String html =
            "<div style='font-family:inherit;'>" +
            "<p style='margin:0 0 12px;'>방송국 계약이 체결되었습니다. 이제 새 시즌을 함께할 <b>감독 1명</b>과 <b>코치 최대 2명</b>을 선임해야 합니다.</p>" +
            "<ul style='margin:0 0 12px 18px;padding:0;color:#555;line-height:1.7;'>" +
            "<li>감독 후보 <b>6명</b>, 코치 후보 <b>10명</b>이 준비되었습니다.</li>" +
            "<li>각 후보는 경력·능력치·계약금·연봉이 모두 다릅니다.</li>" +
            "<li>기존 감독·코치가 있다면 재계약도 가능합니다.</li>" +
            "<li>선임 완료 전까지는 진행하기가 비활성화됩니다.</li>" +
            "</ul>" +
            "<p style='margin:0;color:#555;'>아래 버튼을 눌러 감독·코치 선임을 진행하세요.</p>" +
            "</div>";

        Map<String, Object> e = buildEvnt(ssntYr, curDt, userTmId, "STFF",
                ssntYr + "년 감독·코치 선임", html);
        mapper.insertEvnt(e);
    }

    /** 유저 팀 현재 감독/코치 조회 */
    public Map<String, List<Map<String, Object>>> getCurrentStff() {
        Long userTmId = mapper.findUserTmId();
        if (userTmId == null) return Map.of("mgr", List.of(), "coach", List.of());
        return Map.of(
            "mgr",   mapper.findCurrentStff(userTmId, "MGR"),
            "coach", mapper.findCurrentStff(userTmId, "COACH")
        );
    }

    /** 유저 팀 후보 목록 반환 (abilities 포함). 후보가 없고 스태프 미고용 상태면 자동 재생성. */
    @Transactional
    public Map<String, List<StffCandidateDto>> getCandidates() {
        List<Map<String, Object>> mgrRows   = mapper.findCandidates("MGR");
        List<Map<String, Object>> coachRows = mapper.findCandidates("COACH");

        if (mgrRows.isEmpty() && coachRows.isEmpty()) {
            Long userTmId = mapper.findUserTmId();
            boolean stffHired = checkStffHired(userTmId);
            if (!stffHired) {
                log.info("후보 없음 + 스태프 미고용 → 후보 자동 재생성");
                generateAndStoreCandidates();
                mgrRows   = mapper.findCandidates("MGR");
                coachRows = mapper.findCandidates("COACH");
            }
        }

        return Map.of(
            "mgr",   toCandDtoList(mgrRows),
            "coach", toCandDtoList(coachRows)
        );
    }

    private boolean checkStffHired(Long userTmId) {
        if (userTmId == null) return false;
        String sql =
            "SELECT COUNT(*) FROM STFF s " +
            "JOIN STFF_TM_CNTRCT c ON c.STFF_ID = s.STFF_ID AND c.TM_ID = ? " +
            "WHERE s.STFF_STTS_CD = 'AT' AND s.STFF_TYPE_CD = ? " +
            "AND c.CNTRCT_END_DT >= CURRENT_DATE";
        Integer mgrCnt   = jdbcTemplate.queryForObject(sql, Integer.class, userTmId, "MGR");
        Integer coachCnt = jdbcTemplate.queryForObject(sql, Integer.class, userTmId, "COACH");
        return (mgrCnt != null && mgrCnt > 0) && (coachCnt != null && coachCnt > 0);
    }

    /** 유저 팀 선임 처리 */
    @Transactional
    public void hire(StffHireRequestDto req) {
        Long    userTmId = mapper.findUserTmId();
        Integer ssntYr   = mapper.findCurrentSsntYr();
        String  curDt    = mapper.findCurrentDate();
        if (userTmId == null || ssntYr == null) throw new IllegalStateException("유저 팀 정보 없음");

        // 1. 유저 팀 선임
        if (req.isRenewMgr() && req.isRenewCoach()) {
            renewAll(userTmId, ssntYr, curDt);
        } else {
            if (!req.isRenewMgr()) {
                if (req.getMgrCandId() == null) throw new IllegalArgumentException("감독 후보를 선택해주세요");
                releaseAndHire(userTmId, ssntYr, curDt, req.getMgrCandId(), "MGR");
            }
            if (!req.isRenewCoach()) {
                if (req.getCoachCandIds() == null || req.getCoachCandIds().isEmpty())
                    throw new IllegalArgumentException("코치 후보를 선택해주세요");
                if (req.getCoachCandIds().size() > 2)
                    throw new IllegalArgumentException("코치는 최대 2명까지 선임 가능합니다");
                mapper.releaseStff(userTmId, "COACH", curDt);
                for (Long candId : req.getCoachCandIds()) {
                    releaseAndHire(userTmId, ssntYr, curDt, candId, "COACH");
                }
            }
        }

        // 2. STFF_HIRED 플래그 + 후보 초기화
        mapper.upsertCfg("STFF_HIRED", "1");
        mapper.clearCandidates();

        // 3. AI 팀 자동 선임 (유저 선임과 동시에 처리)
        List<Map<String, Object>> allTms = mapper.findAllTmIds();
        for (Map<String, Object> tm : allTms) {
            long tmId = toLong(tm.get("TM_ID"));
            if (tmId == userTmId) continue;
            String tmNm = (String) tm.get("TM_NM");
            autoHireForAi(tmId, tmNm, ssntYr, curDt);
        }

        // 4. 유저+AI 통합 선임 완료 이벤트 (두 테이블 모두 최신 데이터 반영)
        createHireCompletionEvnt(ssntYr, curDt, userTmId);

        // 5. 외국인 선수 후보 사전 생성
        frgnPlrService.generateCandidatesIfAbsent(ssntYr);

        // 6. 날짜를 2월 1일로 이동 (외국인 용병 계약 기간 시작)
        String feb1 = ssntYr + "-02-01";
        jdbcTemplate.update("UPDATE SSNT SET CUR_DT = ? WHERE SSNT_YR = ?", feb1, ssntYr);

        // 7. 외국인 용병 계약 기간 안내 뉴스 생성
        createFrgnOpenEvnt(ssntYr, feb1, userTmId);

        log.info("유저 팀 감독/코치 선임 완료, AI 팀 선임, 날짜 {} 이동, 외국인 계약 기간 시작 (tmId={})", feb1, userTmId);
    }

    // ============================================================
    // Private helpers
    // ============================================================

    private void generateAndStoreCandidates() {
        List<Map<String, Object>> candRows = new ArrayList<>();
        generateCandRows(candRows, "MGR",   6);
        generateCandRows(candRows, "COACH", 10);

        // insertCandidates does not return generated keys easily in batch, so insert one by one
        List<Long> ids = new ArrayList<>();
        for (Map<String, Object> row : candRows) {
            var keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(conn -> {
                var ps = conn.prepareStatement(
                    "INSERT INTO STFF_CAND (STFF_TYPE_CD, STFF_NM, STFF_EXP_YR, OVRL_RTG, SIGN_BONUS, ANSL_SAL) VALUES (?,?,?,?,?,?)",
                    Statement.RETURN_GENERATED_KEYS);
                ps.setString(1, (String) row.get("stffTypeCd"));
                ps.setString(2, (String) row.get("stffNm"));
                ps.setObject(3, row.get("stffExpYr"));
                ps.setObject(4, row.get("ovrlRtg"));
                ps.setObject(5, row.get("signBonus"));
                ps.setObject(6, row.get("anslSal"));
                return ps;
            }, keyHolder);
            Number key = keyHolder.getKey();
            if (key != null) {
                ids.add(key.longValue());
                row.put("_candId", key.longValue());
            }
        }

        // Ability rows
        List<Map<String, Object>> abltRows = new ArrayList<>();
        for (Map<String, Object> row : candRows) {
            Long candId = (Long) row.get("_candId");
            if (candId == null) continue;
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> ablts = (List<Map<String, Object>>) row.get("_ablts");
            if (ablts == null) continue;
            for (Map<String, Object> a : ablts) {
                Map<String, Object> ar = new HashMap<>(a);
                ar.put("candId", candId);
                abltRows.add(ar);
            }
        }
        if (!abltRows.isEmpty()) mapper.insertCandAbltBatch(abltRows);
    }

    private void generateCandRows(List<Map<String, Object>> out, String typeCd, int count) {
        Random rnd = new Random();
        List<String> abltCodes = typeCd.equals("MGR") ? MGR_ABLT_CODES : COACH_ABLT_CODES;
        for (int i = 0; i < count; i++) {
            String nm = LAST[rnd.nextInt(LAST.length)] + FIRST[rnd.nextInt(FIRST.length)];
            int expYr = rnd.nextInt(20) + 1;
            int ovrl  = rnd.nextInt(16) + 5; // 5~20
            // 같은 능력이라도 계약금/연봉이 다르도록 랜덤 편차 추가
            long signBonus = ovrl * (500L + rnd.nextInt(400) - 200);   // ±200 편차
            long anslSal   = ovrl * (300L + rnd.nextInt(200) - 100);   // ±100 편차

            Map<String, Object> row = new HashMap<>();
            row.put("stffTypeCd", typeCd);
            row.put("stffNm", nm);
            row.put("stffExpYr", expYr);
            row.put("ovrlRtg", ovrl);
            row.put("signBonus", signBonus);
            row.put("anslSal", anslSal);

            List<Map<String, Object>> ablts = new ArrayList<>();
            for (String code : abltCodes) {
                Map<String, Object> a = new HashMap<>();
                a.put("stffAbltCd", code);
                a.put("stffAbltVal", rnd.nextInt(16) + 5); // 5~20
                ablts.add(a);
            }
            row.put("_ablts", ablts);
            out.add(row);
        }
    }

    private void releaseAndHire(Long tmId, int ssntYr, String curDt, Long candId, String typeCd) {
        mapper.releaseStff(tmId, typeCd, curDt);
        Map<String, Object> cand = mapper.findCandById(candId);
        if (cand == null) throw new IllegalArgumentException("후보를 찾을 수 없습니다: " + candId);

        String nm        = (String) cand.get("STFF_NM");
        int    expYr     = toInt(cand.get("STFF_EXP_YR"));
        long   anslSal   = toLong(cand.get("ANSL_SAL"));
        long   signBonus = toLong(cand.get("SIGN_BONUS"));

        // 스태프 생성 (PK 획득)
        var keyHolder = new GeneratedKeyHolder();
        jdbcTemplate.update(conn -> {
            var ps = conn.prepareStatement(
                "INSERT INTO STFF (STFF_NM, STFF_TYPE_CD, STFF_EXP_YR, STFF_ANSL_SAL, STFF_STTS_CD, TM_ID) VALUES (?,?,?,?,'AT',?)",
                Statement.RETURN_GENERATED_KEYS);
            ps.setString(1, nm);
            ps.setString(2, typeCd);
            ps.setInt(3, expYr);
            ps.setLong(4, anslSal);
            ps.setLong(5, tmId);
            return ps;
        }, keyHolder);
        Number key = keyHolder.getKey();
        if (key == null) throw new IllegalStateException("스태프 ID 생성 실패");
        long stffId = key.longValue();

        mapper.insertStffTm(stffId, tmId, curDt);
        mapper.insertStffCntrct(stffId, tmId, curDt, anslSal, signBonus);

        // 능력치 삽입
        List<Map<String, Object>> ablts = mapper.findCandAblt(candId);
        List<Map<String, Object>> abltRows = ablts.stream().map(a -> {
            Map<String, Object> r = new HashMap<>();
            r.put("stffId", stffId);
            r.put("stffAbltCd", a.get("STFF_ABLT_CD"));
            r.put("stffAbltVal", a.get("STFF_ABLT_VAL"));
            return r;
        }).collect(Collectors.toList());
        if (!abltRows.isEmpty()) mapper.insertStffAbltBatch(abltRows);

        // 계약금 차감 (유저 팀만)
        mapper.deductSignBonus(tmId, ssntYr, signBonus);
    }

    private void renewAll(Long tmId, int ssntYr, String curDt) {
        // 재계약: STFF_TM_CNTRCT 종료일 연장 (1년)
        jdbcTemplate.update(
            "UPDATE STFF_TM_CNTRCT SET CNTRCT_END_DT = DATE_ADD(CNTRCT_END_DT, INTERVAL 1 YEAR) " +
            "WHERE TM_ID = ? AND STFF_ID IN (SELECT STFF_ID FROM STFF WHERE TM_ID = ? AND STFF_STTS_CD='AT')",
            tmId, tmId);
    }

    /** 선임 완료 후 유저팀 + AI팀 현황을 하나의 STFF 이벤트로 생성 */
    private void createHireCompletionEvnt(int ssntYr, String curDt, Long userTmId) {
        // 유저팀 현재 스태프 조회
        List<Map<String, Object>> mgrs   = mapper.findCurrentStff(userTmId, "MGR");
        List<Map<String, Object>> coaches = mapper.findCurrentStff(userTmId, "COACH");

        // 모든 팀의 현재 감독/코치 조회 (유저팀 제외)
        List<Map<String, Object>> allTms = mapper.findAllTmIds();

        StringBuilder html = new StringBuilder();
        html.append("<div style='font-family:inherit;'>");

        // 우리 팀 선임 현황
        html.append("<h4 style='margin:0 0 8px;color:#1565c0;'>우리 팀 선임 현황</h4>");
        html.append("<table style='width:100%;border-collapse:collapse;margin-bottom:20px;'>");
        html.append("<thead><tr style='background:#e3f2fd;'>");
        html.append("<th style='padding:6px 10px;text-align:left;border-bottom:2px solid #90caf9;'>역할</th>");
        html.append("<th style='padding:6px 10px;text-align:left;border-bottom:2px solid #90caf9;'>이름</th>");
        html.append("<th style='padding:6px 10px;text-align:center;border-bottom:2px solid #90caf9;'>경력</th>");
        html.append("<th style='padding:6px 10px;text-align:right;border-bottom:2px solid #90caf9;'>연봉</th>");
        html.append("</tr></thead><tbody>");
        for (Map<String, Object> s : mgrs) {
            html.append("<tr><td style='padding:5px 10px;border-bottom:1px solid #e0e0e0;'>감독</td>");
            html.append("<td style='padding:5px 10px;border-bottom:1px solid #e0e0e0;font-weight:bold;'>").append(s.get("STFF_NM")).append("</td>");
            html.append("<td style='padding:5px 10px;border-bottom:1px solid #e0e0e0;text-align:center;'>").append(toInt(s.get("STFF_EXP_YR"))).append("년</td>");
            html.append("<td style='padding:5px 10px;border-bottom:1px solid #e0e0e0;text-align:right;'>").append(String.format("%,d만원", toLong(s.get("STFF_ANSL_SAL")))).append("</td></tr>");
        }
        for (Map<String, Object> s : coaches) {
            html.append("<tr><td style='padding:5px 10px;border-bottom:1px solid #e0e0e0;'>코치</td>");
            html.append("<td style='padding:5px 10px;border-bottom:1px solid #e0e0e0;font-weight:bold;'>").append(s.get("STFF_NM")).append("</td>");
            html.append("<td style='padding:5px 10px;border-bottom:1px solid #e0e0e0;text-align:center;'>").append(toInt(s.get("STFF_EXP_YR"))).append("년</td>");
            html.append("<td style='padding:5px 10px;border-bottom:1px solid #e0e0e0;text-align:right;'>").append(String.format("%,d만원", toLong(s.get("STFF_ANSL_SAL")))).append("</td></tr>");
        }
        html.append("</tbody></table>");

        // 타 구단 선임 현황
        html.append("<h4 style='margin:0 0 8px;color:#555;'>타 구단 선임 현황</h4>");
        html.append("<table style='width:100%;border-collapse:collapse;'>");
        html.append("<thead><tr style='background:#f5f5f5;'>");
        html.append("<th style='padding:6px 10px;text-align:left;border-bottom:2px solid #ccc;'>구단</th>");
        html.append("<th style='padding:6px 10px;text-align:left;border-bottom:2px solid #ccc;'>감독</th>");
        html.append("<th style='padding:6px 10px;text-align:left;border-bottom:2px solid #ccc;'>코치</th>");
        html.append("</tr></thead><tbody>");
        for (Map<String, Object> tm : allTms) {
            long tmId = toLong(tm.get("TM_ID"));
            if (tmId == userTmId) continue;
            String tmNm = (String) tm.get("TM_NM");
            List<Map<String, Object>> aiMgrs   = mapper.findCurrentStff(tmId, "MGR");
            List<Map<String, Object>> aiCoaches = mapper.findCurrentStff(tmId, "COACH");
            String mgrInfo = aiMgrs.isEmpty() ? "-" : (String) aiMgrs.get(0).get("STFF_NM");
            String coachInfo = aiCoaches.stream()
                    .map(c -> (String) c.get("STFF_NM"))
                    .collect(Collectors.joining(", "));
            if (coachInfo.isEmpty()) coachInfo = "-";
            html.append("<tr>");
            html.append("<td style='padding:5px 10px;border-bottom:1px solid #eee;font-weight:bold;'>").append(tmNm != null ? tmNm : "-").append("</td>");
            html.append("<td style='padding:5px 10px;border-bottom:1px solid #eee;'>").append(mgrInfo).append("</td>");
            html.append("<td style='padding:5px 10px;border-bottom:1px solid #eee;'>").append(coachInfo).append("</td>");
            html.append("</tr>");
        }
        html.append("</tbody></table></div>");

        Map<String, Object> e = buildEvnt(ssntYr, curDt, userTmId, "STFF",
                ssntYr + "년 감독·코치 선임 완료",
                html.toString());
        mapper.insertEvnt(e);
    }

    /** AI 팀 자동 감독/코치 선임. 선임 요약 Map 반환 (뉴스는 호출자가 일괄 생성). */
    private Map<String, Object> autoHireForAi(long tmId, String tmNm, int ssntYr, String curDt) {
        Random rnd = new Random();
        List<String> mgrInfo   = autoHireRole(tmId, ssntYr, curDt, "MGR",   1, rnd);
        List<String> coachInfo = autoHireRole(tmId, ssntYr, curDt, "COACH", 2, rnd);

        Map<String, Object> summary = new HashMap<>();
        summary.put("tmNm",     tmNm != null ? tmNm : String.valueOf(tmId));
        summary.put("mgrInfo",   mgrInfo.isEmpty()   ? "-" : mgrInfo.get(0));
        summary.put("coachInfo", coachInfo);
        return summary;
    }

    /**
     * AI 팀 역할 선임. 선임된 인원 요약 문자열 목록 반환 (뉴스 생성 없음).
     * 반환 형식: "이름 (경력 N년, 능력 M/20)"
     */
    private List<String> autoHireRole(long tmId, int ssntYr, String curDt,
                                      String typeCd, int maxCount, Random rnd) {
        List<String> abltCodes = typeCd.equals("MGR") ? MGR_ABLT_CODES : COACH_ABLT_CODES;
        mapper.releaseStff(tmId, typeCd, curDt);

        List<String> hired = new ArrayList<>();
        for (int i = 0; i < maxCount; i++) {
            String nm      = LAST[rnd.nextInt(LAST.length)] + FIRST[rnd.nextInt(FIRST.length)];
            int    expYr   = rnd.nextInt(20) + 1;
            int    ovrl    = rnd.nextInt(16) + 5;
            long   anslSal = ovrl * (300L + rnd.nextInt(200));

            var keyHolder = new GeneratedKeyHolder();
            jdbcTemplate.update(conn -> {
                var ps = conn.prepareStatement(
                    "INSERT INTO STFF (STFF_NM, STFF_TYPE_CD, STFF_EXP_YR, STFF_ANSL_SAL, STFF_STTS_CD, TM_ID) VALUES (?,?,?,?,'AT',?)",
                    Statement.RETURN_GENERATED_KEYS);
                ps.setString(1, nm);
                ps.setString(2, typeCd);
                ps.setInt(3, expYr);
                ps.setLong(4, anslSal);
                ps.setLong(5, tmId);
                return ps;
            }, keyHolder);
            Number key = keyHolder.getKey();
            if (key == null) continue;
            long stffId = key.longValue();

            mapper.insertStffTm(stffId, tmId, curDt);
            mapper.insertStffCntrct(stffId, tmId, curDt, anslSal, 0L);

            List<Map<String, Object>> abltRows = new ArrayList<>();
            for (String code : abltCodes) {
                Map<String, Object> a = new HashMap<>();
                a.put("stffId", stffId);
                a.put("stffAbltCd", code);
                a.put("stffAbltVal", rnd.nextInt(16) + 5);
                abltRows.add(a);
            }
            if (!abltRows.isEmpty()) mapper.insertStffAbltBatch(abltRows);

            hired.add(String.format("%s (경력 %d년, 능력 %d/20)", nm, expYr, ovrl));
        }
        return hired;
    }

    /** 외국인 용병 계약 기간 시작 뉴스 생성 (중복 방지) */
    private void createFrgnOpenEvnt(int ssntYr, String curDt, Long userTmId) {
        try {
            Integer existing = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM SSNT_EVNT WHERE SSNT_YR = ? AND TM_ID = ? AND EVNT_TYPE_CD = 'FRGN_OPEN'",
                Integer.class, ssntYr, userTmId);
            if (existing != null && existing > 0) return;
        } catch (Exception ex) { /* ignore */ }

        String contents =
            "외국인 용병 계약 기간이 시작되었습니다.\n\n" +
            "현재부터 " + ssntYr + "년 2월 10일까지 외국인 선수 영입이 가능합니다.\n" +
            "총 40명의 외국인 선수 후보가 준비되었습니다. (투수 25명, 타자 15명)\n\n" +
            "■ 계약 규칙\n" +
            "- 팀당 최대 3명까지 외국인 선수 영입 가능\n" +
            "- 희망 연봉 이상 제시 시 계약 성사 확률 높음\n" +
            "- AI 구단과 동일 선수 경쟁 — 빠른 결정이 중요합니다\n" +
            "- 오퍼 제출 후 다음 날 결과가 반영됩니다\n\n" +
            "아래 버튼을 눌러 외국인 선수 계약을 시작하세요.";

        Map<String, Object> e = buildEvnt(ssntYr, curDt, userTmId, "FRGN_OPEN",
                ssntYr + "년 외국인 용병 계약 기간 시작", contents);
        mapper.insertEvnt(e);
    }

    private List<StffCandidateDto> toCandDtoList(List<Map<String, Object>> rows) {
        return rows.stream().map(row -> {
            long candId = toLong(row.get("CAND_ID"));
            List<Map<String, Object>> abltRaws = mapper.findCandAblt(candId);
            List<StffCandidateDto.AbltItem> ablts = abltRaws.stream()
                    .map(a -> StffCandidateDto.AbltItem.builder()
                            .stffAbltCd((String) a.get("STFF_ABLT_CD"))
                            .stffAbltNm((String) a.get("STFF_ABLT_NM"))
                            .stffAbltVal(toInt(a.get("STFF_ABLT_VAL")))
                            .build())
                    .collect(Collectors.toList());
            return StffCandidateDto.builder()
                    .candId(candId)
                    .stffTypeCd((String) row.get("STFF_TYPE_CD"))
                    .stffNm((String) row.get("STFF_NM"))
                    .stffExpYr(toInt(row.get("STFF_EXP_YR")))
                    .ovrlRtg(toInt(row.get("OVRL_RTG")))
                    .signBonus(toLong(row.get("SIGN_BONUS")))
                    .anslSal(toLong(row.get("ANSL_SAL")))
                    .abilities(ablts)
                    .build();
        }).collect(Collectors.toList());
    }

    private Map<String, Object> buildEvnt(int ssntYr, String evntDt, Long tmId,
                                           String typeCd, String ttlt, String cnts) {
        Map<String, Object> e = new HashMap<>();
        e.put("ssntYr", ssntYr);
        e.put("evntDt", evntDt);
        e.put("tmId", tmId);
        e.put("evntTypeCd", typeCd);
        e.put("evntTtlt", ttlt);
        e.put("evntCnts", cnts);
        return e;
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
