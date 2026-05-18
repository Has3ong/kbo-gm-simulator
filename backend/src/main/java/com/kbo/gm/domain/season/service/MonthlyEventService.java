package com.kbo.gm.domain.season.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kbo.gm.domain.season.dto.MonthlyEventProgressDto;
import com.kbo.gm.domain.season.mapper.MonthlyEventMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDate;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class MonthlyEventService {

    private static final int TOTAL_STEPS = 6;

    // 티켓 단가 (만원)
    private static final long TICKET_PRICE = 2;
    // 인기 지수 배율 최대값 (50 기준 1.0배, 80 기준 1.6배)
    private static final double PPLT_BASE = 50.0;

    private final MonthlyEventMapper mapper;
    private final ObjectMapper objectMapper;
    private final JdbcTemplate jdbcTemplate;

    /**
     * 월간 정산 이벤트 메인 실행
     *
     * @param ssntYr 시즌 연도
     * @param mon    정산 대상 월 (이전 달, ex: 5월 1일이면 4)
     * @param evntDt 이벤트 기준일 (현재 게임 날짜, 보통 새 달 1일)
     * @param emitter SSE 에미터
     */
    public void settle(int ssntYr, int mon, LocalDate evntDt, SseEmitter emitter) {
        try {
            // Step 1: 전월 팀 성적 정리
            emit(emitter, 1, ssntYr, mon, mon + "월 팀 성적 정리 중...", false);
            settleTeamStats(ssntYr, mon);

            // Step 2: 전월 선수 기록 정리
            emit(emitter, 2, ssntYr, mon, mon + "월 선수 기록 정리 중...", false);
            settlePlayerStats(ssntYr, mon);

            // Step 3: 월간 MVP / 우수 선수 선정
            emit(emitter, 3, ssntYr, mon, "월간 MVP 선정 중...", false);
            List<Map<String, Object>> mvpEvents = selectMonthlyMvp(ssntYr, mon, evntDt);
            if (!mvpEvents.isEmpty()) mapper.insertEvntBatch(mvpEvents);

            // Step 4: 구단 월간 수익·비용 정산
            emit(emitter, 4, ssntYr, mon, "구단 재정 정산 중...", false);
            settleFinance(ssntYr, mon);

            // Step 5: 팬·구단주 만족도 변화
            emit(emitter, 5, ssntYr, mon, "팬·구단주 만족도 갱신 중...", false);
            List<Map<String, Object>> satisfactionEvents = updateSatisfaction(ssntYr, mon, evntDt);
            if (!satisfactionEvents.isEmpty()) mapper.insertEvntBatch(satisfactionEvents);

            // Step 6: 유저 월간 리포트
            emit(emitter, 6, ssntYr, mon, "월간 리포트 생성 중...", false);
            List<Map<String, Object>> reportEvents = generateMonthlyReport(ssntYr, mon, evntDt);
            if (!reportEvents.isEmpty()) mapper.insertEvntBatch(reportEvents);

            // 능력치 월간 스냅샷
            snapshotAbltMon(ssntYr, mon);

            // 완료
            emit(emitter, 6, ssntYr, mon, ssntYr + "년 " + mon + "월 정산 완료!", true);
            emitter.complete();

        } catch (Exception e) {
            log.error("월간 정산 실패 ({}년 {}월)", ssntYr, mon, e);
            try {
                MonthlyEventProgressDto err = MonthlyEventProgressDto.builder()
                        .step(0).total(TOTAL_STEPS)
                        .message("오류: " + e.getMessage())
                        .done(false).error(e.getMessage())
                        .ssntYr(ssntYr).mon(mon)
                        .build();
                emitter.send(SseEmitter.event().data(objectMapper.writeValueAsString(err)));
            } catch (Exception ignored) {}
            emitter.completeWithError(e);
        }
    }

    /** AdvanceWeekService 에서 SSE 없이 호출하는 내부 실행 메서드 */
    public void settleInternal(int ssntYr, int mon, LocalDate evntDt) {
        settleTeamStats(ssntYr, mon);
        settlePlayerStats(ssntYr, mon);
        List<Map<String, Object>> mvpEvents = selectMonthlyMvp(ssntYr, mon, evntDt);
        if (!mvpEvents.isEmpty()) mapper.insertEvntBatch(mvpEvents);
        settleFinance(ssntYr, mon);
        List<Map<String, Object>> satEvents = updateSatisfaction(ssntYr, mon, evntDt);
        if (!satEvents.isEmpty()) mapper.insertEvntBatch(satEvents);
        List<Map<String, Object>> reportEvents = generateMonthlyReport(ssntYr, mon, evntDt);
        if (!reportEvents.isEmpty()) mapper.insertEvntBatch(reportEvents);
        snapshotAbltMon(ssntYr, mon);
    }

    // ----- SSE 전송 헬퍼 -----

    private void emit(SseEmitter emitter, int step, int ssntYr, int mon,
                      String message, boolean done) throws Exception {
        MonthlyEventProgressDto dto = MonthlyEventProgressDto.builder()
                .step(step).total(TOTAL_STEPS)
                .message(message).done(done)
                .ssntYr(ssntYr).mon(mon)
                .build();
        emitter.send(SseEmitter.event().data(objectMapper.writeValueAsString(dto)));
    }

    // ----- Step 1: 팀 성적 정리 -----

    private void settleTeamStats(int ssntYr, int mon) {
        List<Map<String, Object>> monthlyStats = mapper.aggregateTeamMonthlyStats(ssntYr, mon);
        if (monthlyStats.isEmpty()) {
            log.info("{}년 {}월 완료 경기 없음 — 팀 성적 정리 스킵", ssntYr, mon);
            return;
        }

        // TM_MON_REC 저장
        List<Map<String, Object>> monRecList = new ArrayList<>();
        List<Map<String, Object>> stndUpdateList = new ArrayList<>();
        for (Map<String, Object> row : monthlyStats) {
            Map<String, Object> monRec = new HashMap<>();
            monRec.put("tmId", row.get("TM_ID"));
            monRec.put("ssntYr", ssntYr);
            monRec.put("mon", mon);
            monRec.put("w", row.getOrDefault("W", 0));
            monRec.put("l", row.getOrDefault("L", 0));
            monRec.put("t", row.getOrDefault("T", 0));
            monRec.put("rs", row.getOrDefault("RS", 0));
            monRec.put("ra", row.getOrDefault("RA", 0));
            monRecList.add(monRec);

            Map<String, Object> stndRow = new HashMap<>(monRec);
            stndRow.put("ssntYr", ssntYr);
            stndUpdateList.add(stndRow);
        }
        mapper.upsertTmMonRecBatch(monRecList);

        // STND 누적 갱신 (JdbcTemplate: allowMultiQueries 불필요)
        for (Map<String, Object> r : stndUpdateList) {
            jdbcTemplate.update(
                    "UPDATE STND SET W = W + ?, L = L + ?, T = T + ?, " +
                    "PCT = CASE WHEN (W + ? + L + ?) > 0 THEN ROUND((W + ?) / (W + ? + L + ?), 4) ELSE NULL END " +
                    "WHERE TM_ID = ? AND SSNT_YR = ?",
                    r.get("w"), r.get("l"), r.get("t"),
                    r.get("w"), r.get("l"), r.get("w"), r.get("w"), r.get("l"),
                    r.get("tmId"), r.get("ssntYr")
            );
        }

        // 순위 재정렬
        recalcStndRank(ssntYr);
    }

    private void recalcStndRank(int ssntYr) {
        List<Map<String, Object>> stndList = mapper.findCurrentStnd(ssntYr);
        if (stndList.isEmpty()) return;

        // GB(게임차) 계산: 1위 팀 기준
        int leaderW = toInt(stndList.get(0).get("W"));
        int leaderL = toInt(stndList.get(0).get("L"));

        for (int i = 0; i < stndList.size(); i++) {
            Map<String, Object> row = stndList.get(i);
            Long tmId = toLong(row.get("TM_ID"));
            int rank = i + 1;
            int w = toInt(row.get("W"));
            int l = toInt(row.get("L"));
            double gb = ((leaderW - w) + (l - leaderL)) / 2.0;

            jdbcTemplate.update(
                    "UPDATE STND SET STND_RNK = ?, GB = ? WHERE TM_ID = ? AND SSNT_YR = ?",
                    rank, gb == 0.0 ? null : gb, tmId, ssntYr
            );
        }
        log.debug("순위 재정렬 완료: {}건 ({}년)", stndList.size(), ssntYr);
    }

    // ----- Step 2: 선수 기록 정리 -----

    private void settlePlayerStats(int ssntYr, int mon) {
        // 타자 기록
        List<Map<String, Object>> batStats = mapper.aggregateBatterMonthlyStats(ssntYr, mon);
        if (!batStats.isEmpty()) {
            List<Map<String, Object>> batList = new ArrayList<>();
            for (Map<String, Object> r : batStats) {
                Map<String, Object> row = new HashMap<>();
                row.put("plrId", r.get("PLR_ID"));
                row.put("ssntYr", ssntYr);
                row.put("mon", mon);
                row.put("tmId", r.get("TM_ID"));
                row.put("g", r.getOrDefault("G", 0));
                row.put("pa", r.getOrDefault("PA", 0));
                row.put("ab", r.getOrDefault("AB", 0));
                row.put("h", r.getOrDefault("H", 0));
                row.put("dobl", r.getOrDefault("DOBL", 0));
                row.put("trpl", r.getOrDefault("TRPL", 0));
                row.put("hr", r.getOrDefault("HR", 0));
                row.put("rbi", r.getOrDefault("RBI", 0));
                row.put("r", r.getOrDefault("R", 0));
                row.put("bb", r.getOrDefault("BB", 0));
                row.put("ibb", r.getOrDefault("IBB", 0));
                row.put("so", r.getOrDefault("SO", 0));
                row.put("sb", r.getOrDefault("SB", 0));
                row.put("cs", r.getOrDefault("CS", 0));
                row.put("hbp", r.getOrDefault("HBP", 0));
                row.put("sac", r.getOrDefault("SAC", 0));
                row.put("sf", r.getOrDefault("SF", 0));
                row.put("gidp", r.getOrDefault("GIDP", 0));
                row.put("ba", r.get("BA"));
                row.put("obp", r.get("OBP"));
                row.put("slg", r.get("SLG"));
                batList.add(row);
            }
            mapper.upsertBatterMonRecBatch(batList);
        }

        // 투수 기록
        List<Map<String, Object>> pitStats = mapper.aggregatePitcherMonthlyStats(ssntYr, mon);
        if (!pitStats.isEmpty()) {
            List<Map<String, Object>> pitList = new ArrayList<>();
            for (Map<String, Object> r : pitStats) {
                Map<String, Object> row = new HashMap<>();
                row.put("plrId", r.get("PLR_ID"));
                row.put("ssntYr", ssntYr);
                row.put("mon", mon);
                row.put("tmId", r.get("TM_ID"));
                row.put("g", r.getOrDefault("G", 0));
                row.put("gs", r.getOrDefault("GS", 0));
                row.put("ipOut", r.getOrDefault("IP_OUT", 0));
                row.put("bf", r.getOrDefault("BF", 0));
                row.put("h", r.getOrDefault("H", 0));
                row.put("hr", r.getOrDefault("HR", 0));
                row.put("r", r.getOrDefault("R", 0));
                row.put("er", r.getOrDefault("ER", 0));
                row.put("bb", r.getOrDefault("BB", 0));
                row.put("ibb", r.getOrDefault("IBB", 0));
                row.put("so", r.getOrDefault("SO", 0));
                row.put("hbp", r.getOrDefault("HBP", 0));
                row.put("w", r.getOrDefault("W", 0));
                row.put("l", r.getOrDefault("L", 0));
                row.put("sv", r.getOrDefault("SV", 0));
                row.put("hld", r.getOrDefault("HLD", 0));
                row.put("era", r.get("ERA"));
                row.put("whip", r.get("WHIP"));
                pitList.add(row);
            }
            mapper.upsertPitcherMonRecBatch(pitList);
        }

        log.info("{}년 {}월 선수 기록 정리 완료 — 타자: {}건, 투수: {}건",
                ssntYr, mon, batStats.size(), pitStats.size());
    }

    // ----- Step 3: 월간 MVP -----

    private List<Map<String, Object>> selectMonthlyMvp(int ssntYr, int mon, LocalDate evntDt) {
        List<Map<String, Object>> events = new ArrayList<>();

        Map<String, Object> mvpBatter = mapper.findMonthlyMvpBatter(ssntYr, mon);
        if (mvpBatter != null) {
            String plrNm = (String) mvpBatter.get("PLR_NM");
            String tmNm = (String) mvpBatter.get("TM_KR_NM");
            Object ops = mvpBatter.get("OPS");
            Object hr = mvpBatter.get("HR");
            Object rbi = mvpBatter.get("RBI");
            Object plrId = mvpBatter.get("PLR_ID");

            Map<String, Object> e = new HashMap<>();
            e.put("ssntYr", ssntYr);
            e.put("evntDt", evntDt);
            e.put("tmId", plrId != null ? mapper.findUserTmId() : null); // 전체 이벤트
            e.put("evntTypeCd", "MVP");
            e.put("evntTtlt", ssntYr + "년 " + mon + "월 월간 MVP 타자: " + plrNm);
            e.put("evntCnts", String.format(
                    "%s(%s) — OPS %s, %s홈런, %s타점으로 %d년 %d월 월간 MVP 타자에 선정되었습니다.",
                    plrNm, tmNm, ops, hr, rbi, ssntYr, mon));
            events.add(e);
        }

        Map<String, Object> mvpPitcher = mapper.findMonthlyMvpPitcher(ssntYr, mon);
        if (mvpPitcher != null) {
            String plrNm = (String) mvpPitcher.get("PLR_NM");
            String tmNm = (String) mvpPitcher.get("TM_KR_NM");
            Object era = mvpPitcher.get("ERA");
            Object w = mvpPitcher.get("W");

            Map<String, Object> e = new HashMap<>();
            e.put("ssntYr", ssntYr);
            e.put("evntDt", evntDt);
            e.put("tmId", null);
            e.put("evntTypeCd", "MVP");
            e.put("evntTtlt", ssntYr + "년 " + mon + "월 월간 MVP 투수: " + plrNm);
            e.put("evntCnts", String.format(
                    "%s(%s) — ERA %s, %s승으로 %d년 %d월 월간 MVP 투수에 선정되었습니다.",
                    plrNm, tmNm, era, w, ssntYr, mon));
            events.add(e);
        }

        return events;
    }

    // ----- Step 4: 재정 정산 -----

    private void settleFinance(int ssntYr, int mon) {
        List<Map<String, Object>> marketInfo = mapper.findTeamMarketInfo(ssntYr);
        List<Map<String, Object>> salaryInfo = mapper.findTeamSalarySum();
        List<Map<String, Object>> homeGames = mapper.findTeamHomeGameCount(ssntYr, mon);

        // tmId -> 값 맵핑
        Map<Long, Long> salMap = new HashMap<>();
        for (Map<String, Object> r : salaryInfo) {
            salMap.put(toLong(r.get("TM_ID")), toLong(r.get("TOTAL_SAL")));
        }
        Map<Long, Integer> homeGameMap = new HashMap<>();
        for (Map<String, Object> r : homeGames) {
            homeGameMap.put(toLong(r.get("TM_ID")), toInt(r.get("HOME_GAME_CNT")));
        }

        List<Map<String, Object>> fncList = new ArrayList<>();
        for (Map<String, Object> mkt : marketInfo) {
            Long tmId = toLong(mkt.get("TM_ID"));
            int avgAtnd = toInt(mkt.get("AVG_ATND_CNT"));
            int ppltRtg = toInt(mkt.get("PPLT_RTG"));
            int homeGameCnt = homeGameMap.getOrDefault(tmId, 0);
            long totalSal = salMap.getOrDefault(tmId, 0L);

            // 티켓 수입 = 홈 경기 수 × 평균 관중 × 티켓 단가(만원) × 인기 배율
            double ppltMult = 1.0 + (ppltRtg - PPLT_BASE) / 100.0;
            long tcktRev = (long) (homeGameCnt * avgAtnd * TICKET_PRICE * ppltMult);

            // 선수 연봉 월할 = 연봉 합계 / 6 (정규시즌 6개월)
            long plrSalCost = totalSal / 6;

            Map<String, Object> row = new HashMap<>();
            row.put("tmId", tmId);
            row.put("ssntYr", ssntYr);
            row.put("tcktRev", tcktRev);
            row.put("plrSalCost", plrSalCost);
            fncList.add(row);
        }

        if (!fncList.isEmpty()) {
            mapper.upsertTmFncSsntBatch(fncList);
        }

        // 방송국 승리 수당 — 유저 팀에만 적용
        applyBrdcstWinBonus(ssntYr, mon);
    }

    private void applyBrdcstWinBonus(int ssntYr, int mon) {
        Long userTmId = mapper.findUserTmId();
        if (userTmId == null) return;

        Long winBonus = mapper.findBrdcstWinBonus();
        if (winBonus == null || winBonus == 0) return;

        Map<String, Object> monRec = mapper.findUserTeamMonthlyRecord(userTmId, ssntYr, mon);
        if (monRec == null) return;

        int wins = toInt(monRec.get("W"));
        if (wins <= 0) return;

        long bcstRev = winBonus * wins;

        jdbcTemplate.update(
                "INSERT INTO TM_FNC_SSNT (TM_ID, SSNT_YR, BCST_REV) " +
                "VALUES (?, ?, ?) " +
                "ON DUPLICATE KEY UPDATE " +
                "    BCST_REV = COALESCE(BCST_REV, 0) + VALUES(BCST_REV), " +
                "    CUR_CASH = COALESCE(CUR_CASH, 0) + VALUES(BCST_REV)",
                userTmId, ssntYr, bcstRev
        );

        log.info("방송국 승리 수당 정산: 유저팀={}, {}승 × {}만원 = {}만원", userTmId, wins, winBonus, bcstRev);
    }

    // ----- Step 5: 만족도 변화 -----

    private List<Map<String, Object>> updateSatisfaction(int ssntYr, int mon, LocalDate evntDt) {
        List<Map<String, Object>> monthlyRecs = mapper.findTeamMonthlyRecord(ssntYr, mon);
        List<Map<String, Object>> mktList = mapper.findTeamMktSsnt(ssntYr);

        // tmId -> MKT 정보
        Map<Long, Map<String, Object>> mktMap = new HashMap<>();
        for (Map<String, Object> m : mktList) {
            mktMap.put(toLong(m.get("TM_ID")), m);
        }

        List<Map<String, Object>> updList = new ArrayList<>();
        List<Map<String, Object>> events = new ArrayList<>();

        for (Map<String, Object> rec : monthlyRecs) {
            Long tmId = toLong(rec.get("TM_ID"));
            double winPct = toDouble(rec.get("WIN_PCT"));
            Map<String, Object> mkt = mktMap.getOrDefault(tmId, new HashMap<>());

            int fanSts = toInt(mkt.getOrDefault("FAN_STSFCTN", 50));
            int ownSts = toInt(mkt.getOrDefault("OWN_STSFCTN", 50));
            int fanLylty = toInt(mkt.getOrDefault("FAN_LYLTY", 50));

            // 팬 만족도 변화 계산
            int fanDelta;
            if (winPct >= 0.600) fanDelta = 3;
            else if (winPct >= 0.500) fanDelta = 2;
            else if (winPct <= 0.300) fanDelta = -3;
            else if (winPct <= 0.400) fanDelta = -2;
            else fanDelta = 0;

            // 팬 충성도가 높으면 하락 완충 (-2 이하를 -1로 완화)
            if (fanDelta < 0 && fanLylty >= 65) fanDelta = Math.min(fanDelta + 1, 0);

            int newFanSts = Math.max(20, Math.min(80, fanSts + fanDelta));
            int newOwnSts = Math.max(20, Math.min(80, ownSts + fanDelta));

            Map<String, Object> upd = new HashMap<>();
            upd.put("tmId", tmId);
            upd.put("ssntYr", ssntYr);
            upd.put("fanStsfctn", newFanSts);
            upd.put("ownStsfctn", newOwnSts);
            updList.add(upd);

            // 팬 만족도 급변 시 이벤트 생성
            if (Math.abs(fanDelta) >= 3) {
                String direction = fanDelta > 0 ? "급등" : "급락";
                Map<String, Object> e = new HashMap<>();
                e.put("ssntYr", ssntYr);
                e.put("evntDt", evntDt);
                e.put("tmId", tmId);
                e.put("evntTypeCd", "FAN");
                e.put("evntTtlt", mon + "월 팬 만족도 " + direction);
                e.put("evntCnts", String.format(
                        "이번 달 성적(승률 %.3f)에 따라 팬 만족도가 %d → %d로 %s했습니다.",
                        winPct, fanSts, newFanSts, direction));
                events.add(e);
            }
        }

        if (!updList.isEmpty()) mapper.upsertTmMktSsntBatch(updList);
        return events;
    }

    // ----- Step 6: 유저 월간 리포트 -----

    private List<Map<String, Object>> generateMonthlyReport(int ssntYr, int mon, LocalDate evntDt) {
        Long userTmId = mapper.findUserTmId();
        if (userTmId == null) {
            log.warn("유저 팀 ID 없음 — 월간 리포트 스킵");
            return Collections.emptyList();
        }

        Map<String, Object> monRec = mapper.findUserTeamMonthlyRecord(userTmId, ssntYr, mon);
        Map<String, Object> bestBat = mapper.findUserTeamBestBatter(userTmId, ssntYr, mon);
        Map<String, Object> bestPit = mapper.findUserTeamBestPitcher(userTmId, ssntYr, mon);
        Map<String, Object> finance = mapper.findUserTeamFinance(userTmId, ssntYr);

        StringBuilder cnts = new StringBuilder();
        cnts.append(String.format("▣ %d년 %d월 팀 성적\n", ssntYr, mon));

        if (monRec != null) {
            int w = toInt(monRec.get("W"));
            int l = toInt(monRec.get("L"));
            int t = toInt(monRec.get("T"));
            int seasonW = toInt(monRec.get("SEASON_W"));
            int seasonL = toInt(monRec.get("SEASON_L"));
            Object rnk = monRec.get("STND_RNK");
            cnts.append(String.format("  월간 %d승%d패%d무 | 시즌 누계 %d승%d패 | 순위 %s위\n",
                    w, l, t, seasonW, seasonL, rnk != null ? rnk : "-"));
        } else {
            cnts.append("  이달 경기 기록 없음\n");
        }

        cnts.append("\n▣ 이달의 선수\n");
        if (bestBat != null) {
            cnts.append(String.format("  타자: %s (OPS %s, %s홈런)\n",
                    bestBat.get("PLR_NM"), bestBat.get("OPS"), bestBat.get("HR")));
        } else {
            cnts.append("  타자: 해당 없음\n");
        }
        if (bestPit != null) {
            cnts.append(String.format("  투수: %s (ERA %s, %s승)\n",
                    bestPit.get("PLR_NM"), bestPit.get("ERA"), bestPit.get("W")));
        } else {
            cnts.append("  투수: 해당 없음\n");
        }

        cnts.append("\n▣ 구단 재정\n");
        if (finance != null) {
            long tckt = toLong(finance.get("TCKT_REV"));
            long bcst = toLong(finance.get("BCST_REV"));
            long cost = toLong(finance.get("PLR_SAL_COST"));
            long cash = toLong(finance.get("CUR_CASH"));
            cnts.append(String.format("  티켓 수입: %,d만원 | 방송 수당: %,d만원 | 선수 연봉: %,d만원 | 현금: %,d만원",
                    tckt, bcst, cost, cash));
        } else {
            cnts.append("  재정 정보 없음");
        }

        Map<String, Object> report = new HashMap<>();
        report.put("ssntYr", ssntYr);
        report.put("evntDt", evntDt);
        report.put("tmId", userTmId);
        report.put("evntTypeCd", "NEWS");
        report.put("evntTtlt", ssntYr + "년 " + mon + "월 월간 리포트");
        report.put("evntCnts", cnts.toString());

        return List.of(report);
    }

    // ----- 능력치 스냅샷 -----

    /**
     * 월 마감 시 모든 활성 선수(AT/INJ)의 PLR_ABLT 스냅샷을 PLR_ABLT_MON에 저장.
     * 이미 해당 월 데이터가 있으면 스킵.
     */
    private void snapshotAbltMon(int ssntYr, int mon) {
        Integer existing = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM PLR_ABLT_MON WHERE SSNT_YR=? AND MON=?",
            Integer.class, ssntYr, mon);
        if (existing != null && existing > 0) {
            log.debug("PLR_ABLT_MON 스냅샷 스킵 (이미 존재): {}년 {}월", ssntYr, mon);
            return;
        }

        int inserted = jdbcTemplate.update(
            "INSERT IGNORE INTO PLR_ABLT_MON (PLR_ID, SSNT_YR, MON, ABLT_CD, ABLT_VAL) " +
            "SELECT A.PLR_ID, ?, ?, A.ABLT_CD, A.ABLT_VAL " +
            "FROM PLR_ABLT A JOIN PLR P ON P.PLR_ID = A.PLR_ID " +
            "WHERE P.PLR_STTS_CD IN ('AT', 'INJ')",
            ssntYr, mon);
        log.info("PLR_ABLT_MON 스냅샷 완료: {}년 {}월 — {}건 INSERT", ssntYr, mon, inserted);
    }

    // ----- 유틸 -----

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
}
