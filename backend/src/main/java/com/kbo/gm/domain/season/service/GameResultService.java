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

            // 타자 라인업 조회
            List<Map<String, Object>> homeBatterList = getLineupBatters(homeTmId);
            List<Map<String, Object>> awayBatterList = getLineupBatters(awayTmId);

            // 선발/불펜 투수 조회 (TM_ROTATION, TM_BULLPEN 기반)
            Map<String, Object> homeStarter  = mapper.findStarterWithAbilities(homeTmId, ssntYr);
            Map<String, Object> awayStarter  = mapper.findStarterWithAbilities(awayTmId, ssntYr);
            List<Map<String, Object>> homeBullpen = mapper.findBullpenWithAbilities(homeTmId, ssntYr);
            List<Map<String, Object>> awayBullpen = mapper.findBullpenWithAbilities(awayTmId, ssntYr);

            // 팀 타격/투구 능력치 계산 (점수 시뮬레이션용)
            double homeBatting  = calcBattingRating(getAbilityList(homeTmId, false));
            double awayBatting  = calcBattingRating(getAbilityList(awayTmId, false));
            double homePitching = calcPitchingRating(getAbilityList(homeTmId, true));
            double awayPitching = calcPitchingRating(getAbilityList(awayTmId, true));

            // 능력치 기반 기대 득점 (Poisson)
            // 홈팀 득점 = 홈팀 타격 vs 어웨이팀 투구
            // 어웨이팀 득점 = 어웨이팀 타격 vs 홈팀 투구
            double homeLambda = Math.min(12.0, Math.max(0.5, 4.5 * (homeBatting / 50.0) * (50.0 / awayPitching)));
            double awayLambda = Math.min(12.0, Math.max(0.5, 4.5 * (awayBatting / 50.0) * (50.0 / homePitching)));

            int homeScore = poissonRandom(homeLambda, rnd);
            int awayScore = poissonRandom(awayLambda, rnd);

            // 동점 방지: 어웨이 점수 재롤
            while (homeScore == awayScore) {
                awayScore = poissonRandom(awayLambda, rnd);
            }

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
            result.put("HOME_STARTER",  homeStarter);
            result.put("HOME_BULLPEN",  homeBullpen);
            result.put("AWAY_STARTER",  awayStarter);
            result.put("AWAY_BULLPEN",  awayBullpen);
            results.add(result);

            log.debug("경기 시뮬레이션: GAME_ID={} {}:{} 최종{}:{}",
                    gameId, game.get("HOME_TM_KR_NM"), game.get("AWAY_TM_KR_NM"), homeScore, awayScore);
        }
        return results;
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

    /** 투구 능력치 평균 (VEL + CTL) / 2. 투수 없으면 50 */
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
            Map<String, Object>       homeStarter  = (Map<String, Object>) r.get("HOME_STARTER");
            List<Map<String, Object>> homeBullpen  = (List<Map<String, Object>>) r.get("HOME_BULLPEN");
            Map<String, Object>       awayStarter  = (Map<String, Object>) r.get("AWAY_STARTER");
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

            savePitcherRecords(homeStarter, homeBullpen, gameId, homeTmId, ssntYr, homeWon, awayScore, scoreDiff, rnd);
            savePitcherRecords(awayStarter, awayBullpen, gameId, awayTmId, ssntYr, awayWon, homeScore, scoreDiff, rnd);
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
     * SP/RP/CL 역할 기반 투수 기록 저장
     * SP: STM 기반 이닝(STM20→4이닝, STM50→5.2이닝, STM80→7이닝)
     * MR(중간계투) → SU(셋업맨) → CL(마무리) 순 등판
     * SP 승: 5이닝(15아웃) 이상 & 팀 승리 / CL 세이브: 3점 이내 접전 마무리 / SU 홀드: 세이브 상황 유지
     */
    private void savePitcherRecords(Map<String, Object> starter,
                                    List<Map<String, Object>> bullpen,
                                    long gameId, long tmId, int ssntYr,
                                    boolean teamWon, int runsAllowed, int scoreDiff, Random rnd) {
        if (starter == null || toLong(starter.get("PLR_ID")) == 0) return;

        int spStm  = toInt(starter.get("STM")); if (spStm  == 0) spStm  = 50;
        int spBase = 12 + (int) Math.round((spStm - 20.0) / 60.0 * 9); // stm20→12, stm50→17, stm80→21
        int spOuts = Math.max(12, Math.min(24, spBase + rnd.nextInt(5) - 2));

        List<Map<String, Object>> mrList = new ArrayList<>();
        List<Map<String, Object>> suList = new ArrayList<>();
        Map<String, Object>       clMap  = null;
        for (Map<String, Object> p : bullpen) {
            String role = (String) p.get("ROLE_CD");
            if      ("CL".equals(role) && clMap == null) clMap = p;
            else if ("SU".equals(role))                  suList.add(p);
            else                                         mrList.add(p);
        }

        List<Map<String, Object>> pData  = new ArrayList<>();
        List<String>              pRole  = new ArrayList<>();
        List<Integer>             pOuts  = new ArrayList<>();

        int remaining = 27 - spOuts;
        if (remaining <= 0) {
            pData.add(starter); pRole.add("SP"); pOuts.add(27);
        } else {
            pData.add(starter); pRole.add("SP"); pOuts.add(spOuts);

            boolean closeGame = teamWon && scoreDiff <= 3;
            int clOuts = (clMap != null && closeGame) ? 3 : 0;
            int suOuts = (!suList.isEmpty() && clOuts > 0) ? (3 + rnd.nextInt(3)) : 0;
            int mrOuts = Math.max(0, remaining - clOuts - suOuts);

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
            int w   = wArr[i]; int l  = lArr[i]; int sv  = svArr[i]; int hld = hldArr[i];

            boolean isSp = "SP".equals(roleCd);
            boolean isCg = isSp && pData.size() == 1;
            int qs  = (isSp && ipOut >= 18 && er <= 3) ? 1 : 0;
            int cg  = isCg ? 1 : 0;
            int sho = (isCg && runsAllowed == 0) ? 1 : 0;
            int nh  = (isCg && h == 0) ? 1 : 0;
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
                "INSERT INTO PLR_FATG_COND (PLR_ID, SSNT_YR, FATG, COND) VALUES (?,?,30,70) " +
                "ON DUPLICATE KEY UPDATE " +
                "  FATG = LEAST(100, GREATEST(0, FATG + ?)), " +
                "  COND = LEAST(100, GREATEST(1, COND + ?))",
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

            int homeScore = toInt(r.get("HOME_SCORE"));
            int awayScore = toInt(r.get("AWAY_SCORE"));
            String homeNm = (String) r.get("HOME_TM_KR_NM");
            String awayNm = (String) r.get("AWAY_TM_KR_NM");
            Long winTmId = (Long) r.get("WIN_TM_ID");

            String resultTag;
            if (winTmId == null) {
                resultTag = "무승부";
            } else if (winTmId.equals(userTmId)) {
                resultTag = "승리";
            } else {
                resultTag = "패배";
            }
            String ttlt = String.format("[%s] %s %d : %d %s", resultTag, homeNm, homeScore, awayScore, awayNm);

            Map<String, Object> ev = new HashMap<>();
            ev.put("ssntYr", ssntYr);
            ev.put("evntDt", gameDt);
            ev.put("tmId", userTmId);
            ev.put("plrId", null);
            ev.put("evntTypeCd", "GAME");
            ev.put("evntTtlt", ttlt);
            ev.put("evntCnts", gameDt); // 프론트에서 경기 날짜로 기록 조회
            events.add(ev);
        }

        // 업적/마일스톤 달성 이벤트 감지
        checkAndGenerateAchievements(userTmId, ssntYr, gameDt, events);

        if (!events.isEmpty()) mapper.insertEvntBatch(events);
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
