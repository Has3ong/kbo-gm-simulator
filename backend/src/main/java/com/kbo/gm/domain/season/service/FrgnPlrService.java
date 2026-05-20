package com.kbo.gm.domain.season.service;

import com.kbo.gm.common.util.GameUtil;
import com.kbo.gm.domain.season.dto.FrgnPlrReleaseResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class FrgnPlrService {

    private final JdbcTemplate jdbcTemplate;

    // ── 국적 풀 ───────────────────────────────────────────────────────────────
    private static final String[] NTLY_POOL  = {"US", "DR", "VZ", "JP", "KR", "AU", "MX"};
    private static final int[]    NTLY_WGHTS = { 30,   25,   20,   10,    7,    5,    3};

    // ── 전전 리그 풀 ──────────────────────────────────────────────────────────
    private static final String[] PRV_LG_POOL = {"MLB", "NPB", "MiLB", "CBA", "CPBL", "LMP"};

    // ── 투수 이름 풀 ──────────────────────────────────────────────────────────
    private static final String[] PITCHER_NAMES = {
        "Jake Morrison",   "Carlos Vega",     "Tyler Brooks",    "Miguel Santos",
        "Dylan Hartley",   "Jose Romero",     "Ryan Kelley",     "Luis Mendez",
        "Brandon Scott",   "Pedro Castillo",  "Kevin Walsh",     "Rafael Diaz",
        "Aaron Chambers",  "Eduardo Torres",  "Nathan Simmons",  "Andres Lopez",
        "Cole Fischer",    "Juan Herrera",    "Trevor Banks",    "Daniel Reyes",
        "Hunter Grant",    "Tomoki Hayashi",  "Kenji Matsuda",   "Ryota Yamamoto",
        "Daisuke Fujii",   "Marcus Webb",     "Drew Holloway",   "Roberto Nunez",
        "Shane Coleman",   "Alejandro Cruz"
    };

    // ── 타자 이름 풀 ──────────────────────────────────────────────────────────
    private static final String[] BATTER_NAMES = {
        "Cody Warren",     "Jose Delgado",    "Zach Thornton",   "Ramon Alvarez",
        "Blake Rivers",    "Victor Pena",     "Garrett Mills",   "Ernesto Ruiz",
        "Colin Parker",    "Hideo Tanaka",    "Logan Griffith",  "Yuki Nakamura",
        "Derek Stone",     "Francisco Mora",  "Austin Walker",   "Trent Hammond",
        "Chris Larson",    "Gabriel Suarez",  "Kyle Whitman",    "Arturo Mejia"
    };

    // ── 타자 포지션 풀 (10=투수 제외) ────────────────────────────────────────
    private static final String[] BATTER_POSNS = {"1","2","3","4","5","6","7","8","9"};

    // ── 상수 ──────────────────────────────────────────────────────────────────
    public static final int MAX_FRGN_PLR = 3;

    // ==========================================================================
    // 공개 API
    // ==========================================================================

    /**
     * 외국인 선수 후보 목록 조회 (없으면 먼저 생성)
     */
    public List<Map<String, Object>> getCandidates(int ssntYr) {
        generateCandidatesIfAbsent(ssntYr);
        Long userTmId = GameUtil.getUserTmId(jdbcTemplate);

        // 후보 + 팀명 조인
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
            "SELECT c.CAND_ID, c.PLR_NM, c.NTLY_CD, c.AGE, c.PLR_TYPE_CD, c.REPR_POSN_CD," +
            "       c.PRV_LG_NM, c.WANT_SAL, c.CNTRCT_STTS_CD, c.SGND_TM_ID," +
            "       t.TM_KR_NM AS SGND_TM_NM" +
            " FROM FRGN_PLR_CAND c" +
            " LEFT JOIN TM t ON t.TM_ID = c.SGND_TM_ID" +
            " WHERE c.SSNT_YR = ?" +
            " ORDER BY c.PLR_TYPE_CD, c.CAND_ID",
            ssntYr);

        List<Map<String, Object>> result = new ArrayList<>();

        for (Map<String, Object> row : rows) {
            long candId = toLong(row.get("CAND_ID"));
            String plrType = str(row.get("PLR_TYPE_CD"));

            // 스탯 조회
            List<Map<String, Object>> statRows = jdbcTemplate.queryForList(
                "SELECT STAT_CD, STAT_VAL FROM FRGN_PLR_CAND_STAT WHERE CAND_ID = ?", candId);
            Map<String, Object> stats = new LinkedHashMap<>();
            for (Map<String, Object> s : statRows) {
                stats.put(str(s.get("STAT_CD")), s.get("STAT_VAL"));
            }

            // 유저 오퍼 조회
            Map<String, Object> offerStatus = null;
            if (userTmId != null) {
                List<Map<String, Object>> offers = jdbcTemplate.queryForList(
                    "SELECT OFFER_ID, OFFER_SAL, OFFER_STTS_CD, OFFER_DT" +
                    " FROM FRGN_PLR_OFFER" +
                    " WHERE CAND_ID = ? AND TM_ID = ? AND SSNT_YR = ?" +
                    " ORDER BY OFFER_ID DESC LIMIT 1",
                    candId, userTmId, ssntYr);
                if (!offers.isEmpty()) {
                    offerStatus = new LinkedHashMap<>(offers.get(0));
                }
            }

            // 능력치 조회 및 OVRL 계산
            List<Map<String, Object>> abltRows = jdbcTemplate.queryForList(
                "SELECT ABLT_CD, ABLT_VAL FROM FRGN_PLR_CAND_ABLT WHERE CAND_ID = ?", candId);
            int abltSum = 0;
            for (Map<String, Object> a : abltRows) abltSum += toInt(a.get("ABLT_VAL"));
            int abltCnt = abltRows.isEmpty() ? 1 : abltRows.size();
            int ovrl = clamp(abltSum / abltCnt, 20, 80);
            int pot  = clamp(ovrl + 5, 20, 80);

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("candId",         candId);
            item.put("plrNm",          row.get("PLR_NM"));
            item.put("ntlyCd",         row.get("NTLY_CD"));
            item.put("age",            row.get("AGE"));
            item.put("plrTypeCd",      plrType);
            item.put("reprPosnCd",     row.get("REPR_POSN_CD"));
            item.put("prvLgNm",        row.get("PRV_LG_NM"));
            item.put("wantSal",        row.get("WANT_SAL"));
            item.put("ovrl",           ovrl);
            item.put("potAblt",        pot);
            item.put("cntrctSttsCd",   row.get("CNTRCT_STTS_CD"));
            item.put("sgndTmId",       row.get("SGND_TM_ID"));
            item.put("sgndTmNm",       row.get("SGND_TM_NM"));
            item.put("stats",          stats);
            item.put("offerStatus",    offerStatus);
            result.add(item);
        }
        return result;
    }

    /**
     * 유저가 오퍼 제출
     */
    @Transactional
    public void makeOffer(long candId, int ssntYr, long offerSal) {
        Long userTmId = GameUtil.getUserTmId(jdbcTemplate);
        if (userTmId == null) throw new IllegalStateException("유저 팀 정보가 없습니다.");

        // 계약 기간 검사 (2/1 ~ 2/10)
        String curDt = getCurrentDate();
        if (curDt != null) {
            String yearPrefix = String.valueOf(ssntYr);
            String start = yearPrefix + "-02-01";
            String end   = yearPrefix + "-02-10";
            if (curDt.compareTo(start) < 0 || curDt.compareTo(end) > 0) {
                throw new IllegalStateException("외국인 선수 영입은 " + ssntYr + "년 2월 1일~10일에만 가능합니다.");
            }
        }

        // 후보 존재 및 상태 검사
        List<Map<String, Object>> cands = jdbcTemplate.queryForList(
            "SELECT CAND_ID, CNTRCT_STTS_CD, WANT_SAL FROM FRGN_PLR_CAND WHERE CAND_ID=? AND SSNT_YR=?",
            candId, ssntYr);
        if (cands.isEmpty()) throw new IllegalArgumentException("존재하지 않는 후보입니다.");
        Map<String, Object> cand = cands.get(0);
        String stts = str(cand.get("CNTRCT_STTS_CD"));
        if (!"AVAIL".equals(stts)) throw new IllegalStateException("이미 계약이 완료된 선수입니다.");

        // 최대 외국인 3명 검사 (현재 로스터 기준)
        int signedCnt = countActiveFrgnPlrs(userTmId);
        if (signedCnt >= MAX_FRGN_PLR) {
            throw new IllegalStateException("외국인 선수는 최대 3명까지만 영입할 수 있습니다.");
        }

        // 같은 후보에 대해 이미 PENDING 오퍼가 있으면 거절
        Integer pendingCnt = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM FRGN_PLR_OFFER" +
            " WHERE CAND_ID=? AND TM_ID=? AND SSNT_YR=? AND OFFER_STTS_CD='PENDING'",
            Integer.class, candId, userTmId, ssntYr);
        if (pendingCnt != null && pendingCnt > 0) {
            throw new IllegalStateException("이미 해당 후보에게 오퍼를 제출했습니다.");
        }

        // 오퍼 등록
        jdbcTemplate.update(
            "INSERT INTO FRGN_PLR_OFFER (CAND_ID, TM_ID, SSNT_YR, OFFER_DT, OFFER_SAL, OFFER_STTS_CD)" +
            " VALUES (?,?,?,?,?,'PENDING')",
            candId, userTmId, ssntYr, curDt, offerSal);

        log.info("외국인 오퍼 제출: candId={} tmId={} sal={}", candId, userTmId, offerSal);
    }

    /**
     * 유저 팀의 외국인 선수 계약 현황 조회 (현재 로스터 기준)
     */
    public Map<String, Object> getSignedInfo(int ssntYr) {
        Long userTmId = GameUtil.getUserTmId(jdbcTemplate);
        int signedCnt = userTmId != null ? countActiveFrgnPlrs(userTmId) : 0;

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("signedCnt", signedCnt);
        result.put("maxFrgnPlr", MAX_FRGN_PLR);
        return result;
    }

    /** 팀의 현재 로스터에 있는 외국인 선수 수 (AT 상태만) */
    private int countActiveFrgnPlrs(long tmId) {
        Integer cnt = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM PLR WHERE TM_ID=? AND PLR_FRGN_YN='1' AND PLR_STTS_CD='AT'",
            Integer.class, tmId);
        return cnt != null ? cnt : 0;
    }

    /**
     * 유저 팀 외국인 선수 계약 해지 (방출)
     * - PLR.TM_ID=NULL, PLR_STTS_CD='REL'
     * - PLR_TM, PLR_TM_CNTRCT 종료 처리
     * - 현 시즌 PLR_ENTY 삭제, PLR_LINEUP/PLR_ROTATION/PLR_BULLPEN에서 제거
     * - FRGN_PLR_CAND.SGND_TM_ID 정리 → 같은 시즌에 다른 외국인 영입 가능
     */
    @Transactional
    public FrgnPlrReleaseResponse releaseForeignPlayer(long plrId) {
        Long userTmId = GameUtil.getUserTmId(jdbcTemplate);
        if (userTmId == null) throw new IllegalStateException("유저 팀 정보가 없습니다.");

        Map<String, Object> plr;
        try {
            plr = jdbcTemplate.queryForMap(
                "SELECT PLR_NM, TM_ID, PLR_FRGN_YN, PLR_STTS_CD, PLR_ANSL_SAL FROM PLR WHERE PLR_ID=?", plrId);
        } catch (Exception e) {
            throw new IllegalArgumentException("선수를 찾을 수 없습니다: " + plrId);
        }
        long tmId = toLong(plr.get("TM_ID"));
        String frgnYn = str(plr.get("PLR_FRGN_YN"));
        String sttsCd = str(plr.get("PLR_STTS_CD"));
        String plrNm  = str(plr.get("PLR_NM"));
        long plrAnslSal = toLong(plr.get("PLR_ANSL_SAL"));

        if (!"1".equals(frgnYn)) throw new IllegalStateException("외국인 선수만 계약 해지할 수 있습니다.");
        if (tmId != userTmId) throw new IllegalStateException("자신의 팀 선수만 계약 해지할 수 있습니다.");
        if (!"AT".equals(sttsCd)) throw new IllegalStateException("이미 방출된 선수입니다.");

        Integer ssntYr = jdbcTemplate.queryForObject(
            "SELECT SSNT_YR FROM SSNT ORDER BY SSNT_YR DESC LIMIT 1", Integer.class);
        String curDt = getCurrentDate();
        if (ssntYr == null || curDt == null) throw new IllegalStateException("시즌 정보가 없습니다.");

        // 1. PLR 방출 처리
        jdbcTemplate.update(
            "UPDATE PLR SET PLR_STTS_CD='REL', TM_ID=NULL WHERE PLR_ID=?", plrId);

        // 2. PLR_TM 종료
        jdbcTemplate.update(
            "UPDATE PLR_TM SET TM_END_DT=? WHERE PLR_ID=? AND TM_ID=? AND TM_END_DT IS NULL",
            curDt, plrId, tmId);

        // 3. PLR_TM_CNTRCT 종료
        jdbcTemplate.update(
            "UPDATE PLR_TM_CNTRCT SET FA_CNTRCT_END_DT=? WHERE PLR_ID=? AND TM_ID=? AND " +
            "(FA_CNTRCT_END_DT IS NULL OR FA_CNTRCT_END_DT > ?)",
            curDt, plrId, tmId, curDt);

        // 4. 이번 시즌 엔트리/라인업/로테이션/불펜 제거
        jdbcTemplate.update("DELETE FROM PLR_ENTY WHERE PLR_ID=? AND SSNT_YR=?", plrId, ssntYr);
        jdbcTemplate.update("DELETE FROM TM_LINEUP WHERE PLR_ID=? AND TM_ID=?", plrId, tmId);
        jdbcTemplate.update("DELETE FROM TM_ROTATION WHERE PLR_ID=? AND TM_ID=?", plrId, tmId);
        jdbcTemplate.update("DELETE FROM TM_BULLPEN WHERE PLR_ID=? AND TM_ID=?", plrId, tmId);

        // 5. FRGN_PLR_CAND 정리 (현 시즌, 이름 매칭)
        jdbcTemplate.update(
            "UPDATE FRGN_PLR_CAND SET SGND_TM_ID=NULL, CNTRCT_STTS_CD='RELEASED' " +
            "WHERE SSNT_YR=? AND SGND_TM_ID=? AND PLR_NM=?",
            ssntYr, tmId, plrNm);

        // 6. 방출 뉴스 생성
        jdbcTemplate.update(
            "INSERT INTO SSNT_EVNT (SSNT_YR, EVNT_DT, TM_ID, PLR_ID, EVNT_TYPE_CD, EVNT_TTLT, EVNT_CNTS, RD_YN) " +
            "VALUES (?,?,?,?,'FRGN',?,?,'0')",
            ssntYr, curDt, tmId, plrId,
            plrNm + " 외국인 선수 방출",
            "외국인 선수 " + plrNm + "와의 계약이 해지되었습니다.\n방출일: " + curDt);

        log.info("외국인 선수 계약 해지: plrId={} tmId={} 이름={}", plrId, tmId, plrNm);

        int remainingSlots = MAX_FRGN_PLR - countActiveFrgnPlrs(tmId);
        return FrgnPlrReleaseResponse.builder()
            .plrNm(plrNm)
            .plrAnslSal(plrAnslSal)
            .releaseDt(curDt)
            .remainingFrgnSlots(remainingSlots)
            .build();
    }

    /**
     * 외국인 선수 영입 단계 종료 (정보성 - 현재는 no-op)
     */
    public void stopSigningPhase(int ssntYr) {
        log.info("외국인 영입 단계 종료 처리 (ssntYr={})", ssntYr);
    }

    /**
     * 일별 오퍼 처리 (AI 오퍼 생성 + PENDING 오퍼 결과 처리)
     * AdvanceWeekService에서 PRE 시즌 기간에 호출
     */
    @Transactional
    public void processDailyOffers(int ssntYr, String curDt) {
        // 계약 기간(2/1~2/10)에만 처리
        String start = ssntYr + "-02-01";
        String end   = ssntYr + "-02-10";
        if (curDt.compareTo(start) < 0 || curDt.compareTo(end) > 0) {
            return;
        }

        Long userTmId = GameUtil.getUserTmId(jdbcTemplate);

        // 1. AI 팀 오퍼 생성
        makeAiOffers(ssntYr, curDt, userTmId);

        // 2. 전날(curDt 이전) PENDING 오퍼 결과 처리
        processPendingOffers(ssntYr, curDt, userTmId);
    }

    // ==========================================================================
    // 내부: 후보 생성
    // ==========================================================================

    public void generateCandidatesIfAbsent(int ssntYr) {
        Integer cnt = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM FRGN_PLR_CAND WHERE SSNT_YR=?", Integer.class, ssntYr);
        if (cnt != null && cnt > 0) return;
        Long userTmId = GameUtil.getUserTmId(jdbcTemplate);
        aiEvaluateAndReleaseForeignPlayers(ssntYr, userTmId); // 기존 외국인 평가/방출
        generateCandidates(ssntYr);
    }

    /**
     * AI 팀 외국인 선수 성적 평가 후 부진 선수 방출
     * - 이전 시즌 성적이 기준 이하이고 더 좋은 후보가 있으면 50% 확률로 방출
     * - 후보 생성 전 호출되므로 후보 비교는 전년도 잔류 후보 또는 빈 상태일 수 있음
     */
    @Transactional
    public void aiEvaluateAndReleaseForeignPlayers(int ssntYr, Long userTmId) {
        int prevYr = ssntYr - 1;
        String relDt = ssntYr + "-01-15";
        Random rnd = new Random();

        // 모든 AI 팀 목록 조회 (userTmId 제외)
        List<Map<String, Object>> allTms = jdbcTemplate.queryForList(
            "SELECT TM_ID FROM TM ORDER BY TM_ID");

        for (Map<String, Object> tm : allTms) {
            long tmId = toLong(tm.get("TM_ID"));
            if (userTmId != null && tmId == userTmId) continue;

            // 해당 AI 팀의 현재 활성 외국인 선수 조회
            List<Map<String, Object>> frgnPlrs = jdbcTemplate.queryForList(
                "SELECT P.PLR_ID, P.PLR_NM, P.PLR_FRGN_YN, P.PLR_OVRL_ABLT, P.TM_ID" +
                " FROM PLR P" +
                " WHERE P.TM_ID = ? AND P.PLR_FRGN_YN = '1' AND P.PLR_STTS_CD = 'AT'",
                tmId);

            for (Map<String, Object> plr : frgnPlrs) {
                long plrId   = toLong(plr.get("PLR_ID"));
                String plrNm = str(plr.get("PLR_NM"));
                int plrOvrl  = toInt(plr.get("PLR_OVRL_ABLT"));

                // 이전 시즌 성적 평가: 투수 여부 판단 (PLR_PTCH_SSNT_REC 기록 존재 여부)
                List<Map<String, Object>> pitchRec = jdbcTemplate.queryForList(
                    "SELECT ERA FROM PLR_PTCH_SSNT_REC WHERE PLR_ID=? AND SSNT_YR=?",
                    plrId, prevYr);
                List<Map<String, Object>> batRec = jdbcTemplate.queryForList(
                    "SELECT H, AB FROM PLR_BATR_SSNT_REC WHERE PLR_ID=? AND SSNT_YR=?",
                    plrId, prevYr);

                // 이전 시즌 기록이 없으면 신규 외국인으로 간주, 평가 생략
                if (pitchRec.isEmpty() && batRec.isEmpty()) continue;

                boolean isPoor = false;
                String plrTypeCd;

                if (!pitchRec.isEmpty()) {
                    // 투수 평가
                    plrTypeCd = "P";
                    double era = toDouble(pitchRec.get(0).get("ERA"));
                    if (era > 5.5) isPoor = true;
                } else {
                    // 타자 평가
                    plrTypeCd = "B";
                    int h  = toInt(batRec.get(0).get("H"));
                    int ab = toInt(batRec.get(0).get("AB"));
                    double avg = ab > 0 ? (double) h / ab : 0.0;
                    if (avg < 0.240) isPoor = true;
                }

                if (!isPoor) continue;

                // 현재 후보(같은 타입, AVAIL) 중 최고 OVRL 계산
                // OVRL은 FRGN_PLR_CAND_ABLT 평균으로 산출
                List<Map<String, Object>> candOvrls = jdbcTemplate.queryForList(
                    "SELECT c.CAND_ID" +
                    " FROM FRGN_PLR_CAND c" +
                    " WHERE c.SSNT_YR = ? AND c.PLR_TYPE_CD = ? AND c.CNTRCT_STTS_CD = 'AVAIL'",
                    ssntYr, plrTypeCd);

                int maxCandOvrl = 0;
                for (Map<String, Object> cand : candOvrls) {
                    long candId = toLong(cand.get("CAND_ID"));
                    List<Map<String, Object>> abltRows = jdbcTemplate.queryForList(
                        "SELECT ABLT_VAL FROM FRGN_PLR_CAND_ABLT WHERE CAND_ID=?", candId);
                    if (abltRows.isEmpty()) continue;
                    int abltSum = 0;
                    for (Map<String, Object> a : abltRows) abltSum += toInt(a.get("ABLT_VAL"));
                    int candOvrl = clamp(abltSum / abltRows.size(), 20, 80);
                    if (candOvrl > maxCandOvrl) maxCandOvrl = candOvrl;
                }

                // 후보 최고 OVRL이 현재 선수보다 8 이상 높아야 방출 후보
                boolean hasBetterCandidate = (maxCandOvrl - plrOvrl) >= 8;
                if (!hasBetterCandidate) continue;

                // 50% 확률로 방출 결정
                if (rnd.nextDouble() >= 0.5) continue;

                // 방출 처리
                jdbcTemplate.update(
                    "UPDATE PLR SET PLR_STTS_CD='REL', TM_ID=NULL WHERE PLR_ID=?", plrId);
                jdbcTemplate.update(
                    "UPDATE PLR_TM SET TM_END_DT=? WHERE PLR_ID=? AND TM_ID=? AND TM_END_DT IS NULL",
                    relDt, plrId, tmId);
                jdbcTemplate.update(
                    "UPDATE PLR_TM_CNTRCT SET FA_CNTRCT_END_DT=?" +
                    " WHERE PLR_ID=? AND TM_ID=? AND (FA_CNTRCT_END_DT IS NULL OR FA_CNTRCT_END_DT > ?)",
                    relDt, plrId, tmId, relDt);
                jdbcTemplate.update(
                    "DELETE FROM PLR_ENTY WHERE PLR_ID=? AND SSNT_YR=?", plrId, ssntYr);
                jdbcTemplate.update(
                    "DELETE FROM TM_LINEUP WHERE PLR_ID=? AND TM_ID=?", plrId, tmId);
                jdbcTemplate.update(
                    "DELETE FROM TM_ROTATION WHERE PLR_ID=? AND TM_ID=?", plrId, tmId);
                jdbcTemplate.update(
                    "DELETE FROM TM_BULLPEN WHERE PLR_ID=? AND TM_ID=?", plrId, tmId);
                jdbcTemplate.update(
                    "UPDATE FRGN_PLR_CAND SET SGND_TM_ID=NULL, CNTRCT_STTS_CD='RELEASED'" +
                    " WHERE SSNT_YR=? AND SGND_TM_ID=? AND PLR_NM=?",
                    ssntYr, tmId, plrNm);

                // 방출 뉴스 생성
                jdbcTemplate.update(
                    "INSERT INTO SSNT_EVNT" +
                    " (SSNT_YR, EVNT_DT, TM_ID, PLR_ID, EVNT_TYPE_CD, EVNT_TTLT, EVNT_CNTS, RD_YN)" +
                    " VALUES (?,?,?,?,'FRGN',?,?,'0')",
                    ssntYr, relDt, tmId, plrId,
                    plrNm + " 외국인 선수 방출",
                    "성적 부진으로 외국인 선수 " + plrNm + "와의 계약이 해지되었습니다.");

                log.info("AI 외국인 선수 방출: plrId={} tmId={} plrNm={}", plrId, tmId, plrNm);
            }
        }
    }

    @Transactional
    public void generateCandidates(int ssntYr) {
        Random rnd = new Random();

        // 투수 25명
        List<String> pitcherNames = new ArrayList<>(Arrays.asList(PITCHER_NAMES));
        Collections.shuffle(pitcherNames, rnd);
        for (int i = 0; i < 25; i++) {
            String nm = pitcherNames.get(i % pitcherNames.size()) + (i >= pitcherNames.size() ? " Jr." : "");
            insertPitcherCandidate(ssntYr, nm, rnd);
        }

        // 타자 15명
        List<String> batterNames = new ArrayList<>(Arrays.asList(BATTER_NAMES));
        Collections.shuffle(batterNames, rnd);
        for (int i = 0; i < 15; i++) {
            String nm = batterNames.get(i % batterNames.size()) + (i >= batterNames.size() ? " Jr." : "");
            insertBatterCandidate(ssntYr, nm, rnd);
        }

        log.info("외국인 선수 후보 생성 완료: ssntYr={} (투수 25, 타자 15)", ssntYr);
    }

    private void insertPitcherCandidate(int ssntYr, String nm, Random rnd) {
        boolean isGood = rnd.nextDouble() < 0.4; // 40% 좋은 선수

        // 스탯 결정
        double era   = isGood ? (2.5 + rnd.nextDouble() * 2.0)  : (4.0 + rnd.nextDouble() * 2.0);
        double ip    = isGood ? (150 + rnd.nextInt(51))          : (100 + rnd.nextInt(81));
        int    wins  = isGood ? (8  + rnd.nextInt(11))           : (5   + rnd.nextInt(8));
        int    losses= isGood ? (5  + rnd.nextInt(8))            : (7   + rnd.nextInt(9));
        int    so    = isGood ? (120 + rnd.nextInt(101))         : (80  + rnd.nextInt(81));
        double whip  = isGood ? (1.0 + rnd.nextDouble() * 0.4)  : (1.2 + rnd.nextDouble() * 0.6);

        // 능력치 도출 (스탯 기반)
        // CTL: whip이 낮을수록 높음 (0.8~1.8 범위에서 80~20)
        int ctl = clamp((int)(80 - (whip - 0.8) / 1.0 * 60) + rnd.nextInt(10) - 5, 20, 80);
        // BRK: SO와 연관 (160SO=70, 80SO=30)
        int brk = clamp((int)(30 + (so - 80.0) / 80.0 * 40) + rnd.nextInt(10) - 5, 20, 80);
        // VEL: ERA와 반비례 (2.5=65~75, 6.0=25~35), max 77
        int vel = clamp((int)(75 - (era - 2.5) / 3.5 * 45) + rnd.nextInt(8) - 4, 20, 77);
        // STM: IP와 연관 (200=75, 100=30)
        int stm = clamp((int)(30 + (ip - 100.0) / 100.0 * 45) + rnd.nextInt(8) - 4, 20, 80);

        int age = 22 + rnd.nextInt(14); // 22~35
        String ntly = pickNtly(rnd);
        String prvLg = PRV_LG_POOL[rnd.nextInt(PRV_LG_POOL.length)];
        long wantSal = calcWantSal(new int[]{ctl, brk, vel, stm}, rnd);

        long candId = jdbcTemplate.queryForObject(
            "SELECT COALESCE(MAX(CAND_ID),0)+1 FROM FRGN_PLR_CAND", Long.class);
        jdbcTemplate.update(
            "INSERT INTO FRGN_PLR_CAND" +
            " (CAND_ID, SSNT_YR, PLR_NM, NTLY_CD, AGE, PLR_TYPE_CD, REPR_POSN_CD, PRV_LG_NM, WANT_SAL, CNTRCT_STTS_CD)" +
            " VALUES (?,?,?,?,?,'P','10',?,?,'AVAIL')",
            candId, ssntYr, nm, ntly, age, prvLg, wantSal);

        // 스탯 INSERT
        Object[][] pitcherStats = {
            {"ERA",  round2(era)},
            {"IP",   round2(ip)},
            {"W",    wins},
            {"L",    losses},
            {"SO",   so},
            {"WHIP", round2(whip)}
        };
        for (Object[] stat : pitcherStats) {
            jdbcTemplate.update(
                "INSERT INTO FRGN_PLR_CAND_STAT (CAND_ID, STAT_CD, STAT_VAL) VALUES (?,?,?)",
                candId, stat[0], stat[1]);
        }

        // 능력치 INSERT
        Object[][] ablts = {{"CTL", ctl}, {"BRK", brk}, {"VEL", vel}, {"STM", stm}};
        for (Object[] ab : ablts) {
            jdbcTemplate.update(
                "INSERT INTO FRGN_PLR_CAND_ABLT (CAND_ID, ABLT_CD, ABLT_VAL) VALUES (?,?,?)",
                candId, ab[0], ab[1]);
        }
    }

    private void insertBatterCandidate(int ssntYr, String nm, Random rnd) {
        boolean isGood = rnd.nextDouble() < 0.4;

        double avg = isGood ? (0.270 + rnd.nextDouble() * 0.070) : (0.230 + rnd.nextDouble() * 0.060);
        int    hr  = isGood ? (15 + rnd.nextInt(21))             : (8    + rnd.nextInt(15));
        int    rbi = isGood ? (60 + rnd.nextInt(51))             : (40   + rnd.nextInt(41));
        double obp = isGood ? (0.340 + rnd.nextDouble() * 0.080) : (0.300 + rnd.nextDouble() * 0.070);
        double slg = isGood ? (0.450 + rnd.nextDouble() * 0.150) : (0.370 + rnd.nextDouble() * 0.110);
        int    sb  = isGood ? (5  + rnd.nextInt(26))             : rnd.nextInt(16);

        // 능력치
        // CNT: AVG 기반 (0.340=75, 0.230=30)
        int cnt = clamp((int)(30 + (avg - 0.230) / 0.110 * 45) + rnd.nextInt(10) - 5, 20, 80);
        // PWR: HR 기반 (35=75, 8=25)
        int pwr = clamp((int)(25 + (hr - 8.0) / 27.0 * 50) + rnd.nextInt(10) - 5, 20, 80);
        // RUN: SB 기반 (30=75, 0=25)
        int run = clamp((int)(25 + (sb / 30.0) * 50) + rnd.nextInt(10) - 5, 20, 80);
        // STL: OBP 기반 (0.420=70, 0.300=25)
        int stl = clamp((int)(25 + (obp - 0.300) / 0.120 * 45) + rnd.nextInt(8) - 4, 20, 80);
        // THR: 랜덤 (20~65)
        int thr = 20 + rnd.nextInt(46);

        String posn = BATTER_POSNS[rnd.nextInt(BATTER_POSNS.length)];
        int age = 22 + rnd.nextInt(14);
        String ntly = pickNtly(rnd);
        String prvLg = PRV_LG_POOL[rnd.nextInt(PRV_LG_POOL.length)];
        long wantSal = calcWantSal(new int[]{cnt, pwr, run, stl, thr}, rnd);

        long candId = jdbcTemplate.queryForObject(
            "SELECT COALESCE(MAX(CAND_ID),0)+1 FROM FRGN_PLR_CAND", Long.class);
        jdbcTemplate.update(
            "INSERT INTO FRGN_PLR_CAND" +
            " (CAND_ID, SSNT_YR, PLR_NM, NTLY_CD, AGE, PLR_TYPE_CD, REPR_POSN_CD, PRV_LG_NM, WANT_SAL, CNTRCT_STTS_CD)" +
            " VALUES (?,?,?,?,?,'B',?,?,?,'AVAIL')",
            candId, ssntYr, nm, ntly, age, posn, prvLg, wantSal);

        Object[][] batterStats = {
            {"AVG", round3(avg)},
            {"HR",  hr},
            {"RBI", rbi},
            {"OBP", round3(obp)},
            {"SLG", round3(slg)},
            {"SB",  sb}
        };
        for (Object[] stat : batterStats) {
            jdbcTemplate.update(
                "INSERT INTO FRGN_PLR_CAND_STAT (CAND_ID, STAT_CD, STAT_VAL) VALUES (?,?,?)",
                candId, stat[0], stat[1]);
        }

        Object[][] ablts = {{"CNT", cnt}, {"PWR", pwr}, {"RUN", run}, {"STL", stl}, {"THR", thr}};
        for (Object[] ab : ablts) {
            jdbcTemplate.update(
                "INSERT INTO FRGN_PLR_CAND_ABLT (CAND_ID, ABLT_CD, ABLT_VAL) VALUES (?,?,?)",
                candId, ab[0], ab[1]);
        }
    }

    // ==========================================================================
    // 내부: AI 오퍼 생성
    // ==========================================================================

    private void makeAiOffers(int ssntYr, String curDt, Long userTmId) {
        List<Map<String, Object>> allTms = jdbcTemplate.queryForList(
            "SELECT TM_ID FROM TM ORDER BY TM_ID");
        Random rnd = new Random();

        // AVAIL 후보 목록
        List<Map<String, Object>> avail = jdbcTemplate.queryForList(
            "SELECT CAND_ID, WANT_SAL FROM FRGN_PLR_CAND WHERE SSNT_YR=? AND CNTRCT_STTS_CD='AVAIL'",
            ssntYr);
        if (avail.isEmpty()) return;

        for (Map<String, Object> tm : allTms) {
            long tmId = toLong(tm.get("TM_ID"));
            if (userTmId != null && tmId == userTmId) continue;

            // 이미 3명 외국인 보유 시 스킵 (현재 로스터 기준)
            if (countActiveFrgnPlrs(tmId) >= MAX_FRGN_PLR) continue;

            // 1~2개 오퍼
            int offerCnt = 1 + rnd.nextInt(2);
            Collections.shuffle(avail, rnd);
            int made = 0;
            for (Map<String, Object> cand : avail) {
                if (made >= offerCnt) break;
                long candId  = toLong(cand.get("CAND_ID"));
                long wantSal = toLong(cand.get("WANT_SAL"));

                // 이미 이 팀이 이 후보에 PENDING 오퍼 있으면 스킵
                Integer pending = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM FRGN_PLR_OFFER" +
                    " WHERE CAND_ID=? AND TM_ID=? AND SSNT_YR=? AND OFFER_STTS_CD='PENDING'",
                    Integer.class, candId, tmId, ssntYr);
                if (pending != null && pending > 0) continue;

                double ratio = 0.85 + rnd.nextDouble() * 0.30;
                long offerSal = (long) Math.min(
                    Math.max(wantSal * ratio, wantSal * 0.7),
                    wantSal * 1.1);

                jdbcTemplate.update(
                    "INSERT INTO FRGN_PLR_OFFER (CAND_ID, TM_ID, SSNT_YR, OFFER_DT, OFFER_SAL, OFFER_STTS_CD)" +
                    " VALUES (?,?,?,?,?,'PENDING')",
                    candId, tmId, ssntYr, curDt, offerSal);
                made++;
            }
        }
    }

    // ==========================================================================
    // 내부: PENDING 오퍼 처리
    // ==========================================================================

    private void processPendingOffers(int ssntYr, String curDt, Long userTmId) {
        // curDt 이전(= 전날까지)의 PENDING 오퍼를 처리
        List<Map<String, Object>> pending = jdbcTemplate.queryForList(
            "SELECT o.OFFER_ID, o.CAND_ID, o.TM_ID, o.OFFER_SAL," +
            "       c.WANT_SAL, c.CNTRCT_STTS_CD" +
            " FROM FRGN_PLR_OFFER o" +
            " JOIN FRGN_PLR_CAND c ON c.CAND_ID = o.CAND_ID" +
            " WHERE o.SSNT_YR=? AND o.OFFER_STTS_CD='PENDING' AND o.OFFER_DT < ?",
            ssntYr, curDt);

        Random rnd = new Random();

        for (Map<String, Object> offer : pending) {
            long offerId = toLong(offer.get("OFFER_ID"));
            long candId  = toLong(offer.get("CAND_ID"));
            long tmId    = toLong(offer.get("TM_ID"));
            long offerSal= toLong(offer.get("OFFER_SAL"));
            long wantSal = toLong(offer.get("WANT_SAL"));
            String candStts = str(offer.get("CNTRCT_STTS_CD"));

            // 이미 다른 팀과 계약된 후보면 REJECTED
            if (!"AVAIL".equals(candStts)) {
                jdbcTemplate.update(
                    "UPDATE FRGN_PLR_OFFER SET OFFER_STTS_CD='REJECTED' WHERE OFFER_ID=?", offerId);
                continue;
            }

            // AI 팀의 경우 이미 MAX_FRGN_PLR 이상 계약 시 REJECTED
            boolean isUser = userTmId != null && tmId == userTmId;
            if (!isUser && countActiveFrgnPlrs(tmId) >= MAX_FRGN_PLR) {
                jdbcTemplate.update(
                    "UPDATE FRGN_PLR_OFFER SET OFFER_STTS_CD='REJECTED' WHERE OFFER_ID=?", offerId);
                continue;
            }

            // 수락/거절 확률 계산
            double ratio = wantSal > 0 ? (double) offerSal / wantSal : 0;
            double acceptProb;
            if      (ratio >= 1.0) acceptProb = 0.95;
            else if (ratio >= 0.9) acceptProb = 0.75;
            else if (ratio >= 0.8) acceptProb = 0.50;
            else if (ratio >= 0.7) acceptProb = 0.25;
            else                   acceptProb = 0.05;

            if (rnd.nextDouble() < acceptProb) {
                acceptOffer(ssntYr, offerId, candId, tmId, offerSal, userTmId, curDt);
            } else {
                jdbcTemplate.update(
                    "UPDATE FRGN_PLR_OFFER SET OFFER_STTS_CD='REJECTED' WHERE OFFER_ID=?", offerId);
                if (userTmId != null && tmId == userTmId) {
                    String plrNm = jdbcTemplate.queryForObject(
                        "SELECT PLR_NM FROM FRGN_PLR_CAND WHERE CAND_ID=?", String.class, candId);
                    jdbcTemplate.update(
                        "INSERT INTO SSNT_EVNT (SSNT_YR, EVNT_DT, TM_ID, EVNT_TYPE_CD, EVNT_TTLT, EVNT_CNTS)" +
                        " VALUES (?,?,?,'FRGN',?,?)",
                        ssntYr, curDt, userTmId,
                        plrNm + " 외국인 선수 오퍼 거절",
                        String.format("외국인 선수 %s가 우리 팀의 오퍼를 거절했습니다.\n제시 연봉: %,d만원\n\n다른 선수에게 오퍼를 제출해보세요.", plrNm, offerSal));
                }
            }
        }
    }

    private void acceptOffer(int ssntYr, long offerId, long candId, long tmId,
                             long offerSal, Long userTmId, String curDt) {
        // 해당 오퍼 ACCEPTED
        jdbcTemplate.update(
            "UPDATE FRGN_PLR_OFFER SET OFFER_STTS_CD='ACCEPTED' WHERE OFFER_ID=?", offerId);

        // 다른 팀의 동일 후보 오퍼 REJECTED
        jdbcTemplate.update(
            "UPDATE FRGN_PLR_OFFER SET OFFER_STTS_CD='REJECTED'" +
            " WHERE CAND_ID=? AND OFFER_ID!=? AND OFFER_STTS_CD='PENDING'",
            candId, offerId);

        // 후보 상태 갱신
        boolean isUser = userTmId != null && tmId == userTmId;
        String newStts = isUser ? "SIGNED" : "AI_SIGNED";
        jdbcTemplate.update(
            "UPDATE FRGN_PLR_CAND SET CNTRCT_STTS_CD=?, SGND_TM_ID=? WHERE CAND_ID=?",
            newStts, tmId, candId);

        // PLR 생성
        createPlayerFromCandidate(ssntYr, candId, tmId, offerSal, curDt, isUser);

        log.info("외국인 선수 계약 완료: candId={} tmId={} sal={} isUser={}", candId, tmId, offerSal, isUser);
    }

    private void createPlayerFromCandidate(int ssntYr, long candId, long tmId,
                                            long offerSal, String curDt, boolean isUser) {
        // 후보 정보 조회
        Map<String, Object> cand = jdbcTemplate.queryForMap(
            "SELECT PLR_NM, AGE, REPR_POSN_CD, NTLY_CD FROM FRGN_PLR_CAND WHERE CAND_ID=?", candId);
        String plrNm  = str(cand.get("PLR_NM"));
        String posnCd = str(cand.get("REPR_POSN_CD"));
        String ntlyCd = str(cand.get("NTLY_CD"));

        // 능력치 조회
        List<Map<String, Object>> ablts = jdbcTemplate.queryForList(
            "SELECT ABLT_CD, ABLT_VAL FROM FRGN_PLR_CAND_ABLT WHERE CAND_ID=?", candId);
        int abltSum = ablts.stream().mapToInt(a -> toInt(a.get("ABLT_VAL"))).sum();
        int abltCnt = ablts.isEmpty() ? 1 : ablts.size();
        int ovrl = clamp(abltSum / abltCnt, 20, 80);
        int pot  = clamp(ovrl + 5, 20, 80);

        // PLR INSERT (AUTO_INCREMENT)
        // PLR_FRGN_YN='1' 외국인, PLR_ANSL_SAL=offerSal
        jdbcTemplate.update(
            "INSERT INTO PLR" +
            " (PLR_NM, TM_ID, PLR_STTS_CD, PLR_OVRL_ABLT, PLR_POT_ABLT, PLR_ANSL_SAL, PLR_FRGN_YN, PLR_NTNLT)" +
            " VALUES (?,?,'AT',?,?,?,'1',?)",
            plrNm, tmId, ovrl, pot, offerSal, ntlyCd);

        Long plrId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
        if (plrId == null || plrId == 0) {
            throw new IllegalStateException("PLR 생성 실패");
        }

        // PLR_ABLT INSERT
        for (Map<String, Object> ab : ablts) {
            jdbcTemplate.update(
                "INSERT INTO PLR_ABLT (PLR_ID, ABLT_CD, ABLT_VAL) VALUES (?,?,?)",
                plrId, ab.get("ABLT_CD"), ab.get("ABLT_VAL"));
        }

        // PLR_TM INSERT (소속 등록)
        jdbcTemplate.update(
            "INSERT INTO PLR_TM (PLR_ID, TM_ID, TM_BGNG_DT) VALUES (?,?,?)",
            plrId, tmId, curDt);

        // PLR_TM_CNTRCT INSERT (1년 FA 계약)
        String endDt = (ssntYr + 1) + "-01-31";
        jdbcTemplate.update(
            "INSERT INTO PLR_TM_CNTRCT" +
            " (PLR_ID, TM_ID, FA_CNTRCT_BGNG_DT, FA_AMT, FA_CNTRCT_END_DT, REPR_POSN_CD, CNTRCT_TYPE_CD)" +
            " VALUES (?,?,?,?,?,?,'FR')",
            plrId, tmId, curDt, offerSal, endDt, posnCd);

        // PLR_POSN INSERT (FRGN_PLR_CAND.REPR_POSN_CD → PLR_POSN.POSN_CD 변환)
        Map<String, String> reprToPosnCd = new java.util.HashMap<>();
        reprToPosnCd.put("10", "10"); // 투수 → 선발투수
        reprToPosnCd.put("1",  "20"); // 포수
        reprToPosnCd.put("2",  "21"); // 1루수
        reprToPosnCd.put("3",  "22"); // 2루수
        reprToPosnCd.put("4",  "23"); // 3루수
        reprToPosnCd.put("5",  "24"); // 유격수
        reprToPosnCd.put("6",  "25"); // 좌익수
        reprToPosnCd.put("7",  "26"); // 중견수
        reprToPosnCd.put("8",  "27"); // 우익수
        reprToPosnCd.put("9",  "28"); // DH
        String plrPosnCd = reprToPosnCd.getOrDefault(posnCd, "10");
        jdbcTemplate.update(
            "INSERT INTO PLR_POSN (PLR_ID, POSN_CD, POSN_PRFC_ABLT) VALUES (?,?,?)",
            plrId, plrPosnCd, ovrl);

        // PLR_ENTY INSERT (2군 등록)
        jdbcTemplate.update(
            "INSERT INTO PLR_ENTY (PLR_ID, TM_ID, SSNT_YR, ENTY_LVL_CD, ENTY_DT) VALUES (?,?,?,'2',?)",
            plrId, tmId, ssntYr, curDt);

        // 유저 팀이면 이벤트 생성
        if (isUser) {
            jdbcTemplate.update(
                "INSERT INTO SSNT_EVNT (SSNT_YR, EVNT_DT, TM_ID, PLR_ID, EVNT_TYPE_CD, EVNT_TTLT, EVNT_CNTS)" +
                " VALUES (?,?,?,?,'FRGN',?,?)",
                ssntYr, curDt, tmId, plrId,
                plrNm + " 외국인 선수 계약 체결",
                String.format("외국인 선수 %s와 계약이 체결되었습니다.\n연봉: %,d만원 / 1년 계약", plrNm, offerSal));
        }
    }

    // ==========================================================================
    // 내부 유틸
    // ==========================================================================

    private String getCurrentDate() {
        try {
            return jdbcTemplate.queryForObject(
                "SELECT CUR_DT FROM SSNT ORDER BY SSNT_YR DESC LIMIT 1", String.class);
        } catch (Exception e) { return null; }
    }

    /** 가중치 기반 국적 선택 */
    private String pickNtly(Random rnd) {
        int total = 0;
        for (int w : NTLY_WGHTS) total += w;
        int r = rnd.nextInt(total);
        int cum = 0;
        for (int i = 0; i < NTLY_POOL.length; i++) {
            cum += NTLY_WGHTS[i];
            if (r < cum) return NTLY_POOL[i];
        }
        return NTLY_POOL[0];
    }

    /** 능력치 평균 기반 희망연봉 계산 (5000~50000 만원) */
    private long calcWantSal(int[] ablts, Random rnd) {
        double avg = Arrays.stream(ablts).average().orElse(40);
        // avg 20->5000, avg 80->50000
        long base = (long) (5000 + (avg - 20.0) / 60.0 * 45000);
        // ±15% 랜덤 변동
        long delta = (long) (base * 0.15 * (rnd.nextDouble() * 2 - 1));
        return Math.max(5000, Math.min(50000, base + delta));
    }

    private int clamp(int v, int min, int max) {
        return Math.max(min, Math.min(max, v));
    }

    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }

    private double round3(double v) {
        return Math.round(v * 1000.0) / 1000.0;
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

    private double toDouble(Object v) {
        if (v == null) return 0.0;
        if (v instanceof Number n) return n.doubleValue();
        try { return Double.parseDouble(v.toString()); } catch (Exception e) { return 0.0; }
    }

    private String str(Object v) {
        return v == null ? null : v.toString();
    }
}
