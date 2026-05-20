package com.kbo.gm.domain.season.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kbo.gm.domain.season.dto.GameResultProgressDto;
import com.kbo.gm.domain.season.mapper.GameResultMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameResultService {

    private static final int TOTAL_STEPS = 8;

    private final GameResultMapper mapper;
    private final ObjectMapper objectMapper;
    private final JdbcTemplate jdbcTemplate;

    public void processGames(int ssntYr, String gameDt, SseEmitter emitter) {
        try {
            // Step 1: 경기 목록 조회 및 시뮬레이션 준비
            emit(emitter, 1, ssntYr, gameDt, "경기 결과 시뮬레이션 준비 중...", false);
            List<Map<String, Object>> games = mapper.findGamesOnDate(ssntYr, gameDt);
            if (games.isEmpty()) {
                emit(emitter, TOTAL_STEPS, ssntYr, gameDt, "처리할 경기가 없습니다.", true);
                emitter.complete();
                return;
            }

            // Step 2: 경기 점수 시뮬레이션 및 결과 저장
            emit(emitter, 2, ssntYr, gameDt, "경기 점수 시뮬레이션 중... (" + games.size() + "경기)", false);
            List<Map<String, Object>> results = simulateAndSaveGames(games, ssntYr);

            // Step 3: 선수 경기 기록 저장
            emit(emitter, 3, ssntYr, gameDt, "선수 경기 기록 저장 중...", false);
            savePlayerGameRecords(results, ssntYr);

            // Step 4: 순위 갱신
            emit(emitter, 4, ssntYr, gameDt, "팀 순위 갱신 중...", false);
            updateStandings(results, ssntYr);

            // Step 5: 선수 피로도/컨디션 반영
            emit(emitter, 5, ssntYr, gameDt, "선수 피로도·컨디션 반영 중...", false);
            applyFatigueCondition(results, ssntYr);

            // Step 6: 재정 반영 (티켓 수입)
            emit(emitter, 6, ssntYr, gameDt, "구단 재정 반영 중...", false);
            applyFinance(results, ssntYr);

            // Step 7: 경기 뉴스/이벤트 생성
            emit(emitter, 7, ssntYr, gameDt, "경기 이벤트 생성 중...", false);
            generateGameEvents(results, ssntYr, gameDt);

            // Step 8: 경기 처리 완료 확정
            emit(emitter, 8, ssntYr, gameDt, "경기 처리 완료 중...", false);
            finalizeGames(results);

            emit(emitter, TOTAL_STEPS, ssntYr, gameDt, gameDt + " 경기 처리 완료! (" + games.size() + "경기)", true);
            emitter.complete();

        } catch (Exception e) {
            log.error("경기 결과 처리 실패 ({}년 {})", ssntYr, gameDt, e);
            try {
                GameResultProgressDto err = GameResultProgressDto.builder()
                        .step(0).total(TOTAL_STEPS).message("오류: " + e.getMessage())
                        .done(false).error(e.getMessage()).ssntYr(ssntYr).gameDt(gameDt)
                        .build();
                emitter.send(SseEmitter.event().data(objectMapper.writeValueAsString(err)));
            } catch (Exception ignored) {}
            emitter.completeWithError(e);
        }
    }

    /** AdvanceWeekService 에서 SSE 없이 호출하는 내부 실행 메서드 */
    public void processGamesInternal(int ssntYr, String gameDt) {
        List<Map<String, Object>> games = mapper.findGamesOnDate(ssntYr, gameDt);
        if (games.isEmpty()) return;
        List<Map<String, Object>> results = simulateAndSaveGames(games, ssntYr);
        savePlayerGameRecords(results, ssntYr);
        updateStandings(results, ssntYr);
        applyFatigueCondition(results, ssntYr);
        applyFinance(results, ssntYr);
        generateGameEvents(results, ssntYr, gameDt);
        finalizeGames(results);
    }

    // ----- Step 2: 경기 시뮬레이션 -----

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> simulateAndSaveGames(List<Map<String, Object>> games, int ssntYr) {
        List<Map<String, Object>> results = new ArrayList<>();
        Random rnd = new Random();

        for (Map<String, Object> game : games) {
            long gameId   = toLong(game.get("GAME_ID"));
            long homeTmId = toLong(game.get("HOME_TM_ID"));
            long awayTmId = toLong(game.get("AWAY_TM_ID"));

            // 타자 라인업 조회 (1군 확정 로스터 기반)
            List<Map<String, Object>> homeBatterList = getLineupBatters(homeTmId);
            List<Map<String, Object>> awayBatterList = getLineupBatters(awayTmId);

            // 선발투수 — TM_ROTATION 완료 경기 수 기반 자동 선택
            long homeSpId = pickSpFromRotation(homeTmId, ssntYr);
            long awaySpId = pickSpFromRotation(awayTmId, ssntYr);

            Map<String, Object> homeSp = homeSpId > 0 ? mapper.findSpAbilitiesByPlrId(homeSpId) : null;
            Map<String, Object> awaySp = awaySpId > 0 ? mapper.findSpAbilitiesByPlrId(awaySpId) : null;

            // 불펜 — TM_BULLPEN (MR/SU/CL 역할 기반)
            List<Map<String, Object>> homeBullpen = mapper.findBullpenWithAbilities(homeTmId, ssntYr);
            List<Map<String, Object>> awayBullpen = mapper.findBullpenWithAbilities(awayTmId, ssntYr);

            // 타격/투구 능력치 계산 — 지정 투수(SP+불펜)만 사용
            double homeBatting  = calcBattingRating(getAbilityList(homeTmId, false));
            double awayBatting  = calcBattingRating(getAbilityList(awayTmId, false));
            double homePitching = calcPitchingRatingFromPitchers(homeSp, homeBullpen);
            double awayPitching = calcPitchingRatingFromPitchers(awaySp, awayBullpen);

            double homeLambda = Math.min(12.0, Math.max(0.5, 4.5 * (homeBatting / 50.0) * (50.0 / awayPitching)));
            double awayLambda = Math.min(12.0, Math.max(0.5, 4.5 * (awayBatting / 50.0) * (50.0 / homePitching)));

            int homeScore = poissonRandom(homeLambda, rnd);
            int awayScore = poissonRandom(awayLambda, rnd);
            while (homeScore == awayScore) awayScore = poissonRandom(awayLambda, rnd);

            Long winTmId = homeScore > awayScore ? homeTmId
                         : awayScore > homeScore ? awayTmId : null;

            jdbcTemplate.update(
                    "UPDATE GAME SET HOME_SCORE=?, AWAY_SCORE=?, GAME_STTS_CD='03' WHERE GAME_ID=?",
                    homeScore, awayScore, gameId);

            Map<String, Object> result = new HashMap<>(game);
            result.put("HOME_SCORE", homeScore);
            result.put("AWAY_SCORE", awayScore);
            result.put("WIN_TM_ID", winTmId);
            result.put("HOME_BATTING_PLAYERS", homeBatterList);
            result.put("AWAY_BATTING_PLAYERS", awayBatterList);
            result.put("HOME_SP",      homeSp);
            result.put("HOME_BULLPEN", homeBullpen);
            result.put("AWAY_SP",      awaySp);
            result.put("AWAY_BULLPEN", awayBullpen);
            results.add(result);

            log.debug("경기 시뮬레이션: GAME_ID={} {}:{} 최종{}:{}",
                    gameId, game.get("HOME_TM_KR_NM"), game.get("AWAY_TM_KR_NM"), homeScore, awayScore);
        }
        return results;
    }

    /**
     * TM_ROTATION 기반 선발 투수 선택.
     * 완료 경기 수 % 5 → ROT_ORD. 로테이션 없으면 PLR_ENTY fallback.
     * GAME 테이블에 별도 저장 없이 시뮬레이션에만 사용.
     */
    private long pickSpFromRotation(long tmId, int ssntYr) {
        Integer done = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM GAME WHERE (HOME_TM_ID=? OR AWAY_TM_ID=?) AND SSNT_YR=? AND GAME_STTS_CD='03'",
                Integer.class, tmId, tmId, ssntYr);
        if (done == null) done = 0;
        int rotOrd = (done % 5) + 1;

        List<Long> rotIds = jdbcTemplate.queryForList(
                "SELECT R.PLR_ID FROM TM_ROTATION R JOIN PLR P ON P.PLR_ID = R.PLR_ID " +
                "WHERE R.TM_ID=? AND R.SSNT_YR=? AND R.ROT_ORD=? AND P.PLR_STTS_CD='AT'",
                Long.class, tmId, ssntYr, rotOrd);

        if (!rotIds.isEmpty()) return rotIds.get(0);

        // 로테이션 없으면 PLR_ENTY 첫 번째 투수
        List<Map<String, Object>> fallback = mapper.findEntrantPitchersWithAbilities(tmId);
        return fallback.isEmpty() ? 0L : toLong(fallback.get(0).get("PLR_ID"));
    }

    /** 팀의 타자 능력치(CNT, PWR) 목록 조회 — 능력치 평균 계산용 */
    private List<Map<String, Object>> getAbilityList(long tmId, boolean pitcher) {
        String posnFilter = pitcher ? "AND pc.REPR_POSN_CD = '10'" : "AND pc.REPR_POSN_CD != '10'";
        String abilities  = pitcher ? "'VEL', 'CTL', 'STM'" : "'CNT', 'PWR'";
        return jdbcTemplate.queryForList(
                "SELECT pa.PLR_ID, pa.ABLT_CD, pa.ABLT_VAL " +
                "FROM PLR_ENTY pe " +
                "JOIN PLR p ON p.PLR_ID = pe.PLR_ID " +
                "JOIN PLR_ABLT pa ON pa.PLR_ID = pe.PLR_ID " +
                "JOIN (SELECT PLR_ID, REPR_POSN_CD FROM PLR_TM_CNTRCT " +
                "      WHERE FA_CNTRCT_END_DT >= CURDATE() OR FA_CNTRCT_END_DT IS NULL " +
                "      GROUP BY PLR_ID) pc ON pc.PLR_ID = pe.PLR_ID " +
                "WHERE pe.TM_ID = ? AND pe.ENTY_LVL_CD = '1' " +
                "AND p.PLR_STTS_CD = 'AT' " + posnFilter + " " +
                "AND pa.ABLT_CD IN (" + abilities + ")",
                tmId);
    }

    /** 팀 라인업 타자 상세 정보 (CNT, PWR, STL) 최대 9명 */
    private List<Map<String, Object>> getLineupBatters(long tmId) {
        return jdbcTemplate.queryForList(
                "SELECT pe.PLR_ID, " +
                "MAX(CASE WHEN pa.ABLT_CD='CNT' THEN pa.ABLT_VAL END) AS CNT, " +
                "MAX(CASE WHEN pa.ABLT_CD='PWR' THEN pa.ABLT_VAL END) AS PWR, " +
                "MAX(CASE WHEN pa.ABLT_CD='STL' THEN pa.ABLT_VAL END) AS STL " +
                "FROM PLR_ENTY pe " +
                "JOIN PLR p ON p.PLR_ID = pe.PLR_ID " +
                "JOIN PLR_ABLT pa ON pa.PLR_ID = pe.PLR_ID " +
                "JOIN (SELECT PLR_ID, REPR_POSN_CD FROM PLR_TM_CNTRCT " +
                "      WHERE FA_CNTRCT_END_DT >= CURDATE() OR FA_CNTRCT_END_DT IS NULL " +
                "      GROUP BY PLR_ID) pc ON pc.PLR_ID = pe.PLR_ID " +
                "WHERE pe.TM_ID = ? AND pe.ENTY_LVL_CD = '1' " +
                "AND p.PLR_STTS_CD = 'AT' AND pc.REPR_POSN_CD != '10' " +
                "AND pa.ABLT_CD IN ('CNT', 'PWR', 'STL') " +
                "GROUP BY pe.PLR_ID " +
                "ORDER BY pe.PLR_ID LIMIT 9",
                tmId);
    }

    /** 타격 능력치 평균 (CNT + PWR) / 2. 선수 없으면 50 */
    private double calcBattingRating(List<Map<String, Object>> abilityRows) {
        if (abilityRows.isEmpty()) return 50.0;
        Map<Long, Map<String, Integer>> plrMap = new HashMap<>();
        for (Map<String, Object> row : abilityRows) {
            long plrId = toLong(row.get("PLR_ID"));
            String cd = (String) row.get("ABLT_CD");
            int val = toInt(row.get("ABLT_VAL"));
            plrMap.computeIfAbsent(plrId, k -> new HashMap<>()).put(cd, val);
        }
        double sum = 0;
        int cnt = 0;
        for (Map<String, Integer> m : plrMap.values()) {
            int cntVal = m.getOrDefault("CNT", 50);
            int pwrVal = m.getOrDefault("PWR", 50);
            sum += (cntVal + pwrVal) / 2.0;
            cnt++;
        }
        return cnt == 0 ? 50.0 : sum / cnt;
    }

    /** SP 60% + 불펜 평균 40% 가중 투구 능력치. SP 없으면 50 */
    private double calcPitchingRatingFromPitchers(Map<String, Object> sp, List<Map<String, Object>> bullpen) {
        int vel = sp != null ? toInt(sp.get("VEL")) : 0;
        int ctl = sp != null ? toInt(sp.get("CTL")) : 0;
        if (vel == 0) vel = 50;
        if (ctl == 0) ctl = 50;
        double spRating = (vel + ctl) / 2.0;

        if (bullpen.isEmpty()) return spRating;

        double bpSum = 0;
        for (Map<String, Object> p : bullpen) {
            int bv = toInt(p.get("VEL")); if (bv == 0) bv = 50;
            int bc = toInt(p.get("CTL")); if (bc == 0) bc = 50;
            bpSum += (bv + bc) / 2.0;
        }
        double bpRating = bpSum / bullpen.size();
        return spRating * 0.6 + bpRating * 0.4;
    }

    /** 투구 능력치 평균 (VEL + CTL) / 2. 투수 없으면 50 (레거시용 — 타격 계산에는 미사용) */
    private double calcPitchingRating(List<Map<String, Object>> abilityRows) {
        if (abilityRows.isEmpty()) return 50.0;
        Map<Long, Map<String, Integer>> plrMap = new HashMap<>();
        for (Map<String, Object> row : abilityRows) {
            long plrId = toLong(row.get("PLR_ID"));
            String cd = (String) row.get("ABLT_CD");
            int val = toInt(row.get("ABLT_VAL"));
            plrMap.computeIfAbsent(plrId, k -> new HashMap<>()).put(cd, val);
        }
        double sum = 0;
        int cnt = 0;
        for (Map<String, Integer> m : plrMap.values()) {
            int velVal = m.getOrDefault("VEL", 50);
            int ctlVal = m.getOrDefault("CTL", 50);
            sum += (velVal + ctlVal) / 2.0;
            cnt++;
        }
        return cnt == 0 ? 50.0 : sum / cnt;
    }

    /** 포아송 난수 생성 */
    private int poissonRandom(double lambda, Random rnd) {
        double L = Math.exp(-lambda);
        int k = 0;
        double p = 1.0;
        do {
            k++;
            p *= rnd.nextDouble();
        } while (p > L);
        return k - 1;
    }

    // ----- Step 3: 선수 경기 기록 저장 -----

    @SuppressWarnings("unchecked")
    private void savePlayerGameRecords(List<Map<String, Object>> results, int ssntYr) {
        Random rnd = new Random();

        for (Map<String, Object> r : results) {
            long gameId    = toLong(r.get("GAME_ID"));
            long homeTmId  = toLong(r.get("HOME_TM_ID"));
            long awayTmId  = toLong(r.get("AWAY_TM_ID"));
            int  homeScore = toInt(r.get("HOME_SCORE"));
            int  awayScore = toInt(r.get("AWAY_SCORE"));
            Long winTmId   = (Long) r.get("WIN_TM_ID");

            List<Map<String, Object>> homeBatters  = (List<Map<String, Object>>) r.get("HOME_BATTING_PLAYERS");
            List<Map<String, Object>> awayBatters  = (List<Map<String, Object>>) r.get("AWAY_BATTING_PLAYERS");
            Map<String, Object>       homeSp       = (Map<String, Object>) r.get("HOME_SP");
            List<Map<String, Object>> homeBullpen  = (List<Map<String, Object>>) r.get("HOME_BULLPEN");
            Map<String, Object>       awaySp       = (Map<String, Object>) r.get("AWAY_SP");
            List<Map<String, Object>> awayBullpen  = (List<Map<String, Object>>) r.get("AWAY_BULLPEN");

            if (homeBatters == null) homeBatters = Collections.emptyList();
            if (awayBatters == null) awayBatters = Collections.emptyList();
            if (homeBullpen == null) homeBullpen = Collections.emptyList();
            if (awayBullpen == null) awayBullpen = Collections.emptyList();

            saveBatterRecords(homeBatters, gameId, homeTmId, ssntYr, rnd);
            saveBatterRecords(awayBatters, gameId, awayTmId, ssntYr, rnd);

            boolean homeWon   = winTmId != null && winTmId.equals(homeTmId);
            boolean awayWon   = winTmId != null && winTmId.equals(awayTmId);
            int     scoreDiff = Math.abs(homeScore - awayScore);

            savePitcherRecords(homeSp, homeBullpen, gameId, homeTmId, ssntYr, homeWon, awayScore, scoreDiff, rnd);
            savePitcherRecords(awaySp, awayBullpen, gameId, awayTmId, ssntYr, awayWon, homeScore, scoreDiff, rnd);
        }
    }

    private void saveBatterRecords(List<Map<String, Object>> batters, long gameId, long tmId,
                                   int ssntYr, Random rnd) {
        for (Map<String, Object> batter : batters) {
            long plrId = toLong(batter.get("PLR_ID"));
            if (plrId == 0) continue;

            int cnt = toInt(batter.get("CNT"));
            if (cnt == 0) cnt = 50;
            int pwr = toInt(batter.get("PWR"));
            if (pwr == 0) pwr = 40;
            int stl = toInt(batter.get("STL"));
            if (stl == 0) stl = 40;

            int pa = 4 + rnd.nextInt(2); // 4 or 5
            int bb = rnd.nextDouble() < 0.08 ? 1 : 0;
            int ab = pa - bb;

            double hitProb = 0.150 + (cnt - 20.0) / 60.0 * 0.200;
            hitProb = Math.min(0.400, Math.max(0.100, hitProb));
            int h = binomialCount(ab, hitProb, rnd);

            double hrProb = 0.005 + (pwr - 20.0) / 60.0 * 0.045;
            hrProb = Math.min(0.100, Math.max(0.001, hrProb));
            int hr = binomialCount(h, hrProb * 2, rnd);
            hr = Math.min(hr, h);

            int nonHrHits = h - hr;
            int dobl = binomialCount(nonHrHits, 0.20, rnd);
            int trpl = binomialCount(nonHrHits - dobl, 0.03, rnd);
            int so = binomialCount(ab - h, 0.25, rnd);
            int sb = rnd.nextDouble() < Math.max(0, (stl - 20.0) / 60.0 * 0.15) ? 1 : 0;
            int r  = h > 0 && rnd.nextDouble() < 0.30 ? 1 : 0;
            int rbi = h > 0 && rnd.nextDouble() < 0.35 ? 1 : 0;

            jdbcTemplate.update(
                    "INSERT IGNORE INTO PLR_BATR_GAME_REC " +
                    "(PLR_ID, GAME_ID, TM_ID, PA, AB, H, DOBL, TRPL, HR, RBI, R, BB, IBB, SO, SB, CS, HBP, SAC, SF, GIDP) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, 0, 0, 0, 0, 0)",
                    plrId, gameId, tmId, pa, ab, h, dobl, trpl, hr, rbi, r, bb, so, sb);

            // 시즌 누적 기록 UPSERT
            jdbcTemplate.update(
                    "INSERT INTO PLR_BATR_SSNT_REC (PLR_ID, SSNT_YR, PA, AB, H, DOBL, TRPL, HR, RBI, R, BB, SO, SB) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
                    "ON DUPLICATE KEY UPDATE " +
                    "PA=PA+VALUES(PA), AB=AB+VALUES(AB), H=H+VALUES(H), " +
                    "DOBL=DOBL+VALUES(DOBL), TRPL=TRPL+VALUES(TRPL), HR=HR+VALUES(HR), " +
                    "RBI=RBI+VALUES(RBI), R=R+VALUES(R), BB=BB+VALUES(BB), " +
                    "SO=SO+VALUES(SO), SB=SB+VALUES(SB)",
                    plrId, ssntYr, pa, ab, h, dobl, trpl, hr, rbi, r, bb, so, sb);
        }
    }

    /**
     * SP + TM_BULLPEN(MR/SU/CL) 기반 투수 기록 저장.
     * CG 확률: STM 80+ → 10%, 60+ → 5%, 그 외 → 2%.
     * 불펜 없으면 SP 완투 처리.
     */
    private void savePitcherRecords(Map<String, Object> starter,
                                    List<Map<String, Object>> bullpen,
                                    long gameId, long tmId, int ssntYr,
                                    boolean teamWon, int runsAllowed, int scoreDiff, Random rnd) {
        if (starter == null || toLong(starter.get("PLR_ID")) == 0) return;

        int spStm = toInt(starter.get("STM")); if (spStm == 0) spStm = 50;

        double cgProb = spStm >= 80 ? 0.10 : spStm >= 60 ? 0.05 : 0.02;
        boolean isCg  = bullpen.isEmpty() || rnd.nextDouble() < cgProb;

        List<Map<String, Object>> pData = new ArrayList<>();
        List<String>              pRole = new ArrayList<>();
        List<Integer>             pOuts = new ArrayList<>();

        if (isCg) {
            pData.add(starter); pRole.add("SP"); pOuts.add(27);
        } else {
            int spBase = 12 + (int) Math.round((spStm - 20.0) / 60.0 * 9);
            int spOuts = Math.max(12, Math.min(24, spBase + rnd.nextInt(5) - 2));
            pData.add(starter); pRole.add("SP"); pOuts.add(spOuts);

            // TM_BULLPEN 역할 분류 (MR→SU→CL)
            List<Map<String, Object>> mrList = new ArrayList<>();
            List<Map<String, Object>> suList = new ArrayList<>();
            Map<String, Object>       clMap  = null;
            for (Map<String, Object> p : bullpen) {
                String role = (String) p.get("ROLE_CD");
                if      ("CL".equals(role) && clMap == null) clMap = p;
                else if ("SU".equals(role))                  suList.add(p);
                else                                         mrList.add(p);
            }

            int remaining  = 27 - spOuts;
            boolean close  = teamWon && scoreDiff <= 3;
            int clOuts     = (clMap != null && close) ? 3 : 0;
            int suOuts     = (!suList.isEmpty() && clOuts > 0) ? (3 + rnd.nextInt(3)) : 0;
            int mrOuts     = Math.max(0, remaining - clOuts - suOuts);

            if (mrOuts > 0 && !mrList.isEmpty()) {
                int assigned = 0;
                for (int i = 0; i < mrList.size() && assigned < mrOuts; i++) {
                    int per  = Math.max(3, mrOuts / mrList.size());
                    int outs = (i == mrList.size() - 1)
                             ? mrOuts - assigned
                             : Math.min(per + rnd.nextInt(3) - 1, mrOuts - assigned);
                    outs = Math.max(1, outs);
                    pData.add(mrList.get(i)); pRole.add("MR"); pOuts.add(outs);
                    assigned += outs;
                }
            }
            if (suOuts > 0 && !suList.isEmpty()) { pData.add(suList.get(0)); pRole.add("SU"); pOuts.add(suOuts); }
            if (clOuts > 0)                       { pData.add(clMap);        pRole.add("CL"); pOuts.add(clOuts); }
        }

        int[] runs = distributeRuns(pOuts, runsAllowed, rnd);

        int[] wArr   = new int[pData.size()];
        int[] lArr   = new int[pData.size()];
        int[] svArr  = new int[pData.size()];
        int[] hldArr = new int[pData.size()];

        if (teamWon) {
            if (pOuts.get(0) >= 15) {
                wArr[0] = 1;
            } else {
                for (int i = 1; i < pRole.size(); i++) {
                    if (!"CL".equals(pRole.get(i))) { wArr[i] = 1; break; }
                }
            }
            if (scoreDiff <= 3) {
                for (int i = 0; i < pRole.size(); i++) {
                    if ("CL".equals(pRole.get(i))) {
                        svArr[i] = 1;
                        for (int j = 0; j < i; j++) { if ("SU".equals(pRole.get(j))) hldArr[j] = 1; }
                        break;
                    }
                }
            }
        } else {
            lArr[0] = 1;
        }

        for (int i = 0; i < pData.size(); i++) {
            Map<String, Object> data   = pData.get(i);
            String              roleCd = pRole.get(i);
            int                 ipOut  = pOuts.get(i);
            long                plrId  = toLong(data.get("PLR_ID"));
            if (plrId == 0) continue;

            int vel = toInt(data.get("VEL")); if (vel == 0) vel = 50;
            int ctl = toInt(data.get("CTL")); if (ctl == 0) ctl = 50;

            double kRate  = Math.min(0.40, Math.max(0.10, 0.15 + (vel - 20.0) / 60.0 * 0.20));
            double bbRate = Math.min(0.15, Math.max(0.02, 0.10 - (ctl - 20.0) / 60.0 * 0.07));
            int k   = binomialCount(ipOut, kRate, rnd);
            int bb  = binomialCount(ipOut, bbRate, rnd);
            int h   = Math.max(0, (int) Math.round(ipOut * (1.0 - kRate) * 0.8));
            int r   = runs[i];
            int er  = r > 0 ? Math.max(0, r - rnd.nextInt(Math.max(1, r / 2 + 1))) : 0;
            int bf  = ipOut + h + bb;
            int w   = wArr[i]; int l = lArr[i]; int sv = svArr[i]; int hld = hldArr[i];

            boolean isSp  = "SP".equals(roleCd);
            boolean isSpCg = isCg && isSp;
            int qs  = (isSp && ipOut >= 18 && er <= 3) ? 1 : 0;
            int cg  = isSpCg ? 1 : 0;
            int sho = (isSpCg && runsAllowed == 0) ? 1 : 0;
            int nh  = (isSpCg && h == 0) ? 1 : 0;
            int pg  = (nh == 1 && bb == 0) ? 1 : 0;

            jdbcTemplate.update(
                    "INSERT IGNORE INTO PLR_PTCH_GAME_REC " +
                    "(PLR_ID, GAME_ID, TM_ID, PTCH_ROLE_CD, IP_OUT, BF, H, DOBL, TRPL, HR, R, ER, BB, IBB, SO, HBP, W, L, SV, HLD, BSV, CG, SHO, QS, NH, PG, PITCHES, STRIKES) " +
                    "VALUES (?, ?, ?, ?, ?, ?, ?, 0, 0, 0, ?, ?, ?, 0, ?, 0, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?)",
                    plrId, gameId, tmId, roleCd, ipOut, bf, h, r, er, bb, k,
                    w, l, sv, hld, cg, sho, qs, nh, pg,
                    (int)(ipOut * 3.8), (int)(ipOut * 2.5));

            jdbcTemplate.update(
                    "INSERT INTO PLR_PTCH_SSNT_REC " +
                    "(PLR_ID, SSNT_YR, G, GS, IP_OUT, BF, H, R, ER, BB, SO, W, L, SV, HLD, QS, CG, SHO, NH, PG) " +
                    "VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) " +
                    "ON DUPLICATE KEY UPDATE " +
                    "G=G+1, GS=GS+VALUES(GS), IP_OUT=IP_OUT+VALUES(IP_OUT), " +
                    "BF=BF+VALUES(BF), H=H+VALUES(H), R=R+VALUES(R), ER=ER+VALUES(ER), " +
                    "BB=BB+VALUES(BB), SO=SO+VALUES(SO), W=W+VALUES(W), L=L+VALUES(L), " +
                    "SV=SV+VALUES(SV), HLD=HLD+VALUES(HLD), QS=QS+VALUES(QS), " +
                    "CG=CG+VALUES(CG), SHO=SHO+VALUES(SHO), NH=NH+VALUES(NH), PG=PG+VALUES(PG)",
                    plrId, ssntYr, isSp ? 1 : 0,
                    ipOut, bf, h, r, er, bb, k, w, l, sv, hld, qs, cg, sho, nh, pg);

            jdbcTemplate.update(
                    "UPDATE PLR_PTCH_SSNT_REC SET " +
                    "ERA  = CASE WHEN IP_OUT > 0 THEN ROUND(ER * 27.0 / IP_OUT, 2) ELSE NULL END, " +
                    "WHIP = CASE WHEN IP_OUT > 0 THEN ROUND((BB + H) * 3.0 / IP_OUT, 3) ELSE NULL END " +
                    "WHERE PLR_ID = ? AND SSNT_YR = ?",
                    plrId, ssntYr);
        }
    }

    private int[] distributeRuns(List<Integer> outsList, int totalRuns, Random rnd) {
        int[] runs = new int[outsList.size()];
        if (outsList.isEmpty() || totalRuns == 0) return runs;
        int totalOuts = outsList.stream().mapToInt(Integer::intValue).sum();
        if (totalOuts == 0) { runs[runs.length - 1] = totalRuns; return runs; }
        int assigned = 0;
        for (int i = 0; i < outsList.size() - 1; i++) {
            int prop = (int) Math.round((double) outsList.get(i) / totalOuts * totalRuns);
            runs[i]  = Math.max(0, Math.min(prop + rnd.nextInt(3) - 1, totalRuns - assigned));
            assigned += runs[i];
        }
        runs[outsList.size() - 1] = Math.max(0, totalRuns - assigned);
        return runs;
    }

    // ----- Step 4: 순위 갱신 -----

    private void updateStandings(List<Map<String, Object>> results, int ssntYr) {
        for (Map<String, Object> r : results) {
            long homeTmId = toLong(r.get("HOME_TM_ID"));
            long awayTmId = toLong(r.get("AWAY_TM_ID"));
            int homeScore = toInt(r.get("HOME_SCORE"));
            int awayScore = toInt(r.get("AWAY_SCORE"));

            if (homeScore > awayScore) {
                updateStnd(homeTmId, ssntYr, 1, 0, 0, homeScore, awayScore);
                updateStnd(awayTmId, ssntYr, 0, 1, 0, awayScore, homeScore);
            } else if (awayScore > homeScore) {
                updateStnd(homeTmId, ssntYr, 0, 1, 0, homeScore, awayScore);
                updateStnd(awayTmId, ssntYr, 1, 0, 0, awayScore, homeScore);
            } else {
                updateStnd(homeTmId, ssntYr, 0, 0, 1, homeScore, awayScore);
                updateStnd(awayTmId, ssntYr, 0, 0, 1, awayScore, homeScore);
            }
        }
        recalcRank(ssntYr);
    }

    private void updateStnd(long tmId, int ssntYr, int w, int l, int t, int rs, int ra) {
        jdbcTemplate.update(
                "UPDATE STND SET " +
                "  W=W+?, L=L+?, T=T+?, RS=RS+?, RA=RA+?, RUN_DIFF=RUN_DIFF+(? - ?), " +
                "  PCT=CASE WHEN (W+L) > 0 THEN ROUND(W/(W+L),4) ELSE NULL END " +
                "WHERE TM_ID=? AND SSNT_YR=?",
                w, l, t, rs, ra, rs, ra, tmId, ssntYr);
    }

    private void recalcRank(int ssntYr) {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(
                "SELECT TM_ID, W, L FROM STND WHERE SSNT_YR=? ORDER BY PCT DESC, W DESC", ssntYr);
        if (rows.isEmpty()) return;
        int leaderW = toInt(rows.get(0).get("W"));
        int leaderL = toInt(rows.get(0).get("L"));
        for (int i = 0; i < rows.size(); i++) {
            long tmId = toLong(rows.get(i).get("TM_ID"));
            int w = toInt(rows.get(i).get("W"));
            int l = toInt(rows.get(i).get("L"));
            double gb = ((leaderW - w) + (l - leaderL)) / 2.0;
            jdbcTemplate.update("UPDATE STND SET STND_RNK=?, GB=? WHERE TM_ID=? AND SSNT_YR=?",
                    i + 1, gb == 0 ? null : gb, tmId, ssntYr);
        }
    }

    // ----- Step 5: 피로도/컨디션 -----

    private void applyFatigueCondition(List<Map<String, Object>> results, int ssntYr) {
        Random rnd = new Random();
        // 경기마다 두 팀의 GRSS 시설 레벨을 조회하여 적용 (캐시)
        Map<Long, Integer> grassLvlCache = new HashMap<>();
        for (Map<String, Object> r : results) {
            long homeTmId = toLong(r.get("HOME_TM_ID"));
            long awayTmId = toLong(r.get("AWAY_TM_ID"));
            applyTeamFatigue(homeTmId, ssntYr, rnd, grassLevelOf(homeTmId, grassLvlCache));
            applyTeamFatigue(awayTmId, ssntYr, rnd, grassLevelOf(awayTmId, grassLvlCache));
        }
    }

    private int grassLevelOf(long tmId, Map<Long, Integer> cache) {
        return cache.computeIfAbsent(tmId, id -> {
            List<Integer> rows = jdbcTemplate.queryForList(
                    "SELECT FCLTY_LVL FROM TM_FCLTY WHERE TM_ID = ? AND FCLTY_TYPE_CD = 'TRNG'",
                    Integer.class, id);
            return rows.isEmpty() ? 1 : rows.get(0);
        });
    }

    private void applyTeamFatigue(long tmId, int ssntYr, Random rnd, int grassLvl) {
        // 잔디 시설 레벨 1~5에 따라 피로도 증가 및 컨디션 감소를 "아주 조금" 완화
        // - 레벨당 fatg 증가량 -0.5 (최대 -2)
        // - 레벨당 cond 감소 하한 +0.4 (최대 +1.6, 변동성 일부 상쇄)
        int grassStep = Math.max(0, grassLvl - 1);
        List<Map<String, Object>> lineupRows = mapper.findLineup(tmId, ssntYr);
        for (Map<String, Object> row : lineupRows) {
            long plrId = toLong(row.get("PLR_ID"));
            String reprPosnCd = (String) row.get("REPR_POSN_CD");
            int baseFatg = "10".equals(reprPosnCd) ? 12 : 5;
            int fatgDelta = Math.max(1, baseFatg - (int) Math.round(grassStep * 0.5));
            int baseCondDelta = rnd.nextInt(8) - 3; // -3 ~ +4
            int condDelta = baseCondDelta + (int) Math.round(grassStep * 0.4);
            upsertFatigCond(plrId, ssntYr, fatgDelta, condDelta);
        }
    }

    private void upsertFatigCond(long plrId, int ssntYr, int fatgDelta, int condDelta) {
        jdbcTemplate.update(
                "INSERT INTO PLR_FATG_COND (PLR_ID, SSNT_YR, FATG, `COND`) VALUES (?,?,30,70) " +
                "ON DUPLICATE KEY UPDATE " +
                "  FATG = LEAST(100, GREATEST(0, CAST(FATG AS SIGNED) + ?)), " +
                "  `COND` = LEAST(100, GREATEST(1, CAST(`COND` AS SIGNED) + ?))",
                plrId, ssntYr, fatgDelta, condDelta);
    }

    // ----- Step 6: 재정 반영 -----

    private void applyFinance(List<Map<String, Object>> results, int ssntYr) {
        for (Map<String, Object> r : results) {
            long homeTmId = toLong(r.get("HOME_TM_ID"));
            Map<String, Object> mkt = mapper.findTeamMarketRow(homeTmId, ssntYr);
            if (mkt == null) continue;
            int avgAtnd = toInt(mkt.get("AVG_ATND_CNT"));
            int ppltRtg = toInt(mkt.get("PPLT_RTG"));
            double ppltMult = 1.0 + (ppltRtg - 50.0) / 100.0;
            long tcktRev = (long) (avgAtnd * 2 * ppltMult); // 2만원/명
            jdbcTemplate.update(
                    "INSERT INTO TM_FNC_SSNT (TM_ID, SSNT_YR, TCKT_REV) VALUES (?,?,?) " +
                    "ON DUPLICATE KEY UPDATE TCKT_REV=COALESCE(TCKT_REV,0)+VALUES(TCKT_REV), " +
                    "CUR_CASH=COALESCE(CUR_CASH,0)+VALUES(TCKT_REV)",
                    homeTmId, ssntYr, tcktRev);
        }

        // 방송국 승리 수당 (유저 팀이 이긴 경기에만)
        Long userTmId = mapper.findUserTmId();
        if (userTmId == null) return;
        Map<String, Object> bonusRow = mapper.findBrdcstWinBonus();
        if (bonusRow == null) return;
        long winBonus = toLong(bonusRow.get("WIN_BONUS"));
        if (winBonus <= 0) return;

        for (Map<String, Object> r : results) {
            Long winTmId = (Long) r.get("WIN_TM_ID");
            if (winTmId == null || !winTmId.equals(userTmId)) continue;
            jdbcTemplate.update(
                    "INSERT INTO TM_FNC_SSNT (TM_ID, SSNT_YR, BCST_REV) VALUES (?,?,?) " +
                    "ON DUPLICATE KEY UPDATE BCST_REV=COALESCE(BCST_REV,0)+VALUES(BCST_REV), " +
                    "CUR_CASH=COALESCE(CUR_CASH,0)+VALUES(BCST_REV)",
                    userTmId, ssntYr, winBonus);
            log.debug("방송국 승리 수당: {}만원 지급", winBonus);
        }
    }

    // ----- Step 7: 이벤트 생성 -----

    private void generateGameEvents(List<Map<String, Object>> results, int ssntYr, String gameDt) {
        Long userTmId = mapper.findUserTmId();
        if (userTmId == null) return;

        List<Map<String, Object>> events = new ArrayList<>();
        for (Map<String, Object> r : results) {
            long homeTmId = toLong(r.get("HOME_TM_ID"));
            long awayTmId = toLong(r.get("AWAY_TM_ID"));
            if (!userTmId.equals(homeTmId) && !userTmId.equals(awayTmId)) continue;

            long gameId   = toLong(r.get("GAME_ID"));
            int homeScore = toInt(r.get("HOME_SCORE"));
            int awayScore = toInt(r.get("AWAY_SCORE"));
            String homeNm = (String) r.get("HOME_TM_KR_NM");
            String awayNm = (String) r.get("AWAY_TM_KR_NM");
            Long winTmId  = (Long) r.get("WIN_TM_ID");

            String resultTag = winTmId == null ? "무승부"
                    : winTmId.equals(userTmId) ? "승리" : "패배";
            String ttlt = String.format("[%s] %s %d : %d %s", resultTag, homeNm, homeScore, awayScore, awayNm);
            String cnts = buildGameRecordText(gameId, homeNm, awayNm, homeTmId, awayTmId);

            Map<String, Object> ev = new HashMap<>();
            ev.put("ssntYr",    ssntYr);
            ev.put("evntDt",    gameDt);
            ev.put("tmId",      userTmId);
            ev.put("plrId",     null);
            ev.put("evntTypeCd","GAME");
            ev.put("evntTtlt",  ttlt);
            ev.put("evntCnts",  cnts);
            events.add(ev);
        }

        checkAndGenerateAchievements(userTmId, ssntYr, gameDt, events);
        if (!events.isEmpty()) mapper.insertEvntBatch(events);
    }

    /** 경기 선수 기록을 SSNT_EVNT evntCnts 용 텍스트로 포맷 */
    private String buildGameRecordText(long gameId, String homeNm, String awayNm,
                                       long homeTmId, long awayTmId) {
        List<Map<String, Object>> batters = jdbcTemplate.queryForList(
                "SELECT R.TM_ID, P.PLR_NM, R.PA, R.H, R.HR, R.RBI, R.BB, R.SO " +
                "FROM PLR_BATR_GAME_REC R JOIN PLR P ON P.PLR_ID = R.PLR_ID " +
                "WHERE R.GAME_ID = ? ORDER BY R.TM_ID, R.HR DESC, R.H DESC", gameId);

        List<Map<String, Object>> pitchers = jdbcTemplate.queryForList(
                "SELECT R.TM_ID, P.PLR_NM, R.PTCH_ROLE_CD, R.IP_OUT, R.H, R.ER, R.BB, R.SO, R.W, R.L, R.SV, R.HLD " +
                "FROM PLR_PTCH_GAME_REC R JOIN PLR P ON P.PLR_ID = R.PLR_ID " +
                "WHERE R.GAME_ID = ? ORDER BY R.TM_ID, FIELD(R.PTCH_ROLE_CD,'SP','MR','SU','CL')", gameId);

        StringBuilder sb = new StringBuilder();

        sb.append("▣ 타자 기록\n");
        appendBatterBlock(sb, homeNm, homeTmId, batters);
        sb.append("\n");
        appendBatterBlock(sb, awayNm, awayTmId, batters);

        sb.append("\n▣ 투수 기록\n");
        appendPitcherBlock(sb, homeNm, homeTmId, pitchers);
        sb.append("\n");
        appendPitcherBlock(sb, awayNm, awayTmId, pitchers);

        return sb.toString();
    }

    private void appendBatterBlock(StringBuilder sb, String tmNm, long tmId,
                                    List<Map<String, Object>> batters) {
        sb.append("[").append(tmNm).append("]\n");
        sb.append(String.format("%-10s %3s %3s %3s %3s %3s %3s%n", "이름", "타석", "안타", "홈런", "타점", "볼넷", "삼진"));
        boolean any = false;
        for (Map<String, Object> b : batters) {
            if (toLong(b.get("TM_ID")) != tmId) continue;
            sb.append(String.format("%-10s %3d %3d %3d %3d %3d %3d%n",
                    b.get("PLR_NM"), toInt(b.get("PA")), toInt(b.get("H")),
                    toInt(b.get("HR")), toInt(b.get("RBI")), toInt(b.get("BB")), toInt(b.get("SO"))));
            any = true;
        }
        if (!any) sb.append("  (기록 없음)\n");
    }

    private final Map<String, String> ROLE_NM = Map.of(
            "SP", "선발", "MR", "중계", "SU", "셋업", "CL", "마무리");

    private void appendPitcherBlock(StringBuilder sb, String tmNm, long tmId,
                                     List<Map<String, Object>> pitchers) {
        sb.append("[").append(tmNm).append("]\n");
        sb.append(String.format("%-10s %-4s %5s %3s %3s %3s%n", "이름", "역할", "이닝", "피안", "자책", "결과"));
        boolean any = false;
        for (Map<String, Object> p : pitchers) {
            if (toLong(p.get("TM_ID")) != tmId) continue;
            String role = ROLE_NM.getOrDefault((String) p.get("PTCH_ROLE_CD"), (String) p.get("PTCH_ROLE_CD"));
            int ipOut = toInt(p.get("IP_OUT"));
            String ip = ipOut / 3 + "." + ipOut % 3;
            String result = toInt(p.get("W")) > 0 ? "승" : toInt(p.get("L")) > 0 ? "패"
                          : toInt(p.get("SV")) > 0 ? "세이브" : toInt(p.get("HLD")) > 0 ? "홀드" : "-";
            sb.append(String.format("%-10s %-4s %5s %3d %3d %s%n",
                    p.get("PLR_NM"), role, ip, toInt(p.get("H")), toInt(p.get("ER")), result));
            any = true;
        }
        if (!any) sb.append("  (기록 없음)\n");
    }

    /** 유저 팀 선수의 시즌 기록 마일스톤 달성 여부 확인 및 이벤트 생성 */
    private void checkAndGenerateAchievements(long userTmId, int ssntYr, String gameDt,
                                               List<Map<String, Object>> events) {
        // 타자 마일스톤: H(100단위), HR/2B/3B/SB(10단위)
        List<Map<String, Object>> batrStats = jdbcTemplate.queryForList(
                "SELECT p.PLR_ID, p.PLR_NM, r.H, r.HR, r.DOBL AS DOBL2, r.TRPL, r.SB " +
                "FROM PLR_BATR_SSNT_REC r JOIN PLR p ON p.PLR_ID = r.PLR_ID " +
                "WHERE r.SSNT_YR = ? AND p.TM_ID = ?",
                ssntYr, userTmId);

        for (Map<String, Object> stat : batrStats) {
            String plrNm = (String) stat.get("PLR_NM");
            long plrId = toLong(stat.get("PLR_ID"));
            checkMilestone(events, ssntYr, gameDt, userTmId, plrId, plrNm,
                           toInt(stat.get("H")), 100, "안타");
            checkMilestone(events, ssntYr, gameDt, userTmId, plrId, plrNm,
                           toInt(stat.get("HR")), 10, "홈런");
            checkMilestone(events, ssntYr, gameDt, userTmId, plrId, plrNm,
                           toInt(stat.get("DOBL2")), 10, "2루타");
            checkMilestone(events, ssntYr, gameDt, userTmId, plrId, plrNm,
                           toInt(stat.get("TRPL")), 10, "3루타");
            checkMilestone(events, ssntYr, gameDt, userTmId, plrId, plrNm,
                           toInt(stat.get("SB")), 10, "도루");
        }

        // 투수 마일스톤: K(100단위), W/SV/HLD(10단위)
        List<Map<String, Object>> ptchStats = jdbcTemplate.queryForList(
                "SELECT p.PLR_ID, p.PLR_NM, r.SO, r.W, r.SV, r.HLD " +
                "FROM PLR_PTCH_SSNT_REC r JOIN PLR p ON p.PLR_ID = r.PLR_ID " +
                "WHERE r.SSNT_YR = ? AND p.TM_ID = ?",
                ssntYr, userTmId);

        for (Map<String, Object> stat : ptchStats) {
            String plrNm = (String) stat.get("PLR_NM");
            long plrId = toLong(stat.get("PLR_ID"));
            checkMilestone(events, ssntYr, gameDt, userTmId, plrId, plrNm,
                           toInt(stat.get("SO")), 100, "탈삼진");
            checkMilestone(events, ssntYr, gameDt, userTmId, plrId, plrNm,
                           toInt(stat.get("W")), 10, "승리");
            checkMilestone(events, ssntYr, gameDt, userTmId, plrId, plrNm,
                           toInt(stat.get("SV")), 10, "세이브");
            checkMilestone(events, ssntYr, gameDt, userTmId, plrId, plrNm,
                           toInt(stat.get("HLD")), 10, "홀드");
        }
    }

    /** 마일스톤 달성 시 이벤트 추가 */
    private void checkMilestone(List<Map<String, Object>> events, int ssntYr, String gameDt,
                                 long tmId, long plrId, String plrNm,
                                 int current, int step, String statName) {
        if (current > 0 && current % step == 0) {
            Map<String, Object> ev = new HashMap<>();
            ev.put("ssntYr", ssntYr);
            ev.put("evntDt", gameDt);
            ev.put("tmId", tmId);
            ev.put("plrId", plrId);
            ev.put("evntTypeCd", "REC");
            ev.put("evntTtlt", plrNm + " " + current + "번째 " + statName + " 달성");
            ev.put("evntCnts", plrNm + "이(가) 시즌 " + current + " " + statName + "을(를) 달성했습니다!");
            events.add(ev);
        }
    }

    // ----- Step 8: 경기 완료 확정 -----

    private void finalizeGames(List<Map<String, Object>> results) {
        // GAME_STTS_CD는 Step 2에서 이미 '03'으로 업데이트됨
        // 추가 후처리가 필요하면 여기에 구현
        log.info("경기 처리 완료: {}건", results.size());
    }

    // ----- SSE 헬퍼 -----

    private void emit(SseEmitter emitter, int step, int ssntYr, String gameDt,
                      String message, boolean done) throws Exception {
        GameResultProgressDto dto = GameResultProgressDto.builder()
                .step(step).total(TOTAL_STEPS).message(message)
                .done(done).ssntYr(ssntYr).gameDt(gameDt)
                .build();
        emitter.send(SseEmitter.event().data(objectMapper.writeValueAsString(dto)));
    }

    // ----- 유틸 -----

    /** 이항 분포 난수 (n번 시행에서 확률 p로 성공 횟수) */
    private int binomialCount(int n, double p, Random rnd) {
        int count = 0;
        for (int i = 0; i < n; i++) {
            if (rnd.nextDouble() < p) count++;
        }
        return count;
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
