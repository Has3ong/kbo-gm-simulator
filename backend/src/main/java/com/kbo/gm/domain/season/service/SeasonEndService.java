package com.kbo.gm.domain.season.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kbo.gm.domain.season.dto.SeasonEndProgressDto;
import com.kbo.gm.domain.season.mapper.SeasonEndMapper;
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
public class SeasonEndService {

    private static final int TOTAL_STEPS = 14;

    private final SeasonEndMapper mapper;
    private final ObjectMapper objectMapper;
    private final JdbcTemplate jdbcTemplate;

    public void endSeason(int ssntYr, LocalDate evntDt, SseEmitter emitter) {
        try {
            // Step 1: 조건 확인
            emit(emitter, 1, ssntYr, "시즌 종료 조건 확인 중...", false);
            Map<String, Object> ssntInfo = mapper.findSsntInfo(ssntYr);
            if (ssntInfo == null) throw new IllegalStateException("시즌 정보를 찾을 수 없습니다: " + ssntYr);
            String sttsCd = (String) ssntInfo.get("SSNT_STTS_CD");
            if ("OFF".equals(sttsCd)) {
                emit(emitter, TOTAL_STEPS, ssntYr, "이미 종료된 시즌입니다.", true);
                emitter.complete();
                return;
            }

            // Step 2: 최종 순위 확정
            emit(emitter, 2, ssntYr, "최종 순위 확정 중...", false);
            finalizeStandings(ssntYr);

            // Step 3: 챔피언 결정
            emit(emitter, 3, ssntYr, "시즌 챔피언 결정 중...", false);
            List<Map<String, Object>> championEvents = determineChampion(ssntYr, evntDt);
            if (!championEvents.isEmpty()) mapper.insertEvntBatch(championEvents);

            // Step 4: 시즌 기록 확정
            emit(emitter, 4, ssntYr, "시즌 기록 확정 중...", false);
            finalizeSeasonRecords(ssntYr);

            // Step 5: 골든글러브 선정
            emit(emitter, 5, ssntYr, "골든글러브 선정 중...", false);
            List<Map<String, Object>> ggEvents = selectGoldenGloves(ssntYr, evntDt);
            if (!ggEvents.isEmpty()) mapper.insertEvntBatch(ggEvents);

            // Step 6: MVP 선정
            emit(emitter, 6, ssntYr, "시즌 MVP 선정 중...", false);
            List<Map<String, Object>> mvpEvents = selectSeasonMvp(ssntYr, evntDt);
            if (!mvpEvents.isEmpty()) mapper.insertEvntBatch(mvpEvents);

            // Step 7: 팬·구단주 최종 평가
            emit(emitter, 7, ssntYr, "팬·구단주 최종 평가 중...", false);
            updateFinalSatisfaction(ssntYr);

            // Step 8: 재정 최종 정산
            emit(emitter, 8, ssntYr, "구단 재정 최종 정산 중...", false);
            finalizeFinance(ssntYr);

            // Step 9: 선수 성장·노화
            emit(emitter, 9, ssntYr, "선수 성장·노화 처리 중...", false);
            applyGrowthAndAging(ssntYr);
            applyFacilityDecay();

            // Step 10: 계약 만료·FA 처리
            emit(emitter, 10, ssntYr, "계약 만료·FA 처리 중...", false);
            String ssntEndDt = ssntInfo.get("SSNT_END_DT") != null
                    ? ssntInfo.get("SSNT_END_DT").toString()
                    : evntDt.toString();
            List<Map<String, Object>> faEvents = processExpiredContracts(ssntYr, ssntEndDt, evntDt);
            if (!faEvents.isEmpty()) mapper.insertEvntBatch(faEvents);

            // Step 11: 은퇴 처리
            emit(emitter, 11, ssntYr, "은퇴 선수 처리 중...", false);
            List<Map<String, Object>> retEvents = processRetirements(ssntYr, evntDt);
            if (!retEvents.isEmpty()) mapper.insertEvntBatch(retEvents);

            // Step 12: 드래프트 준비
            emit(emitter, 12, ssntYr, "드래프트 일정 준비 중...", false);
            prepareDraft(ssntYr);

            // Step 13: 오프시즌 전환
            emit(emitter, 13, ssntYr, "오프시즌 전환 처리 중...", false);
            jdbcTemplate.update("UPDATE SSNT SET SSNT_STTS_CD = 'OFF' WHERE SSNT_YR = ?", ssntYr);
            List<Map<String, Object>> offEvents = buildOffseasonEvent(ssntYr, evntDt);
            mapper.insertEvntBatch(offEvents);

            // Step 14: 최종 리포트 생성
            emit(emitter, 14, ssntYr, "시즌 최종 리포트 생성 중...", false);
            List<Map<String, Object>> reportEvents = generateFinalReport(ssntYr, evntDt);
            if (!reportEvents.isEmpty()) mapper.insertEvntBatch(reportEvents);

            // 완료
            emit(emitter, TOTAL_STEPS, ssntYr, ssntYr + "년 시즌 종료 처리 완료!", true);
            emitter.complete();

        } catch (Exception e) {
            log.error("시즌 종료 처리 실패 ({}년)", ssntYr, e);
            try {
                SeasonEndProgressDto err = SeasonEndProgressDto.builder()
                        .step(0).total(TOTAL_STEPS)
                        .message("오류: " + e.getMessage())
                        .done(false).error(e.getMessage())
                        .ssntYr(ssntYr)
                        .build();
                emitter.send(SseEmitter.event().data(objectMapper.writeValueAsString(err)));
            } catch (Exception ignored) {}
            emitter.completeWithError(e);
        }
    }

    // ----- Step 2: 최종 순위 확정 -----

    /** AdvanceWeekService 에서 SSE 없이 호출하는 내부 실행 메서드 */
    public void runSeasonEnd(int ssntYr, String evntDtStr) {
        LocalDate evntDt = LocalDate.parse(evntDtStr);
        Map<String, Object> ssntInfo = mapper.findSsntInfo(ssntYr);
        if (ssntInfo == null) return;
        if ("OFF".equals(ssntInfo.get("SSNT_STTS_CD"))) return;
        finalizeStandings(ssntYr);
        List<Map<String, Object>> champ = determineChampion(ssntYr, evntDt);
        if (!champ.isEmpty()) mapper.insertEvntBatch(champ);
        finalizeSeasonRecords(ssntYr);
        List<Map<String, Object>> gg = selectGoldenGloves(ssntYr, evntDt);
        if (!gg.isEmpty()) mapper.insertEvntBatch(gg);
        List<Map<String, Object>> mvp = selectSeasonMvp(ssntYr, evntDt);
        if (!mvp.isEmpty()) mapper.insertEvntBatch(mvp);
        updateFinalSatisfaction(ssntYr);
        finalizeFinance(ssntYr);
        applyGrowthAndAging(ssntYr);
        String ssntEndDt = ssntInfo.get("SSNT_END_DT") != null
                ? ssntInfo.get("SSNT_END_DT").toString() : evntDtStr;
        applyFacilityDecay();
        List<Map<String, Object>> fa = processExpiredContracts(ssntYr, ssntEndDt, evntDt);
        if (!fa.isEmpty()) mapper.insertEvntBatch(fa);
        List<Map<String, Object>> ret = processRetirements(ssntYr, evntDt);
        if (!ret.isEmpty()) mapper.insertEvntBatch(ret);
        prepareDraft(ssntYr);
        jdbcTemplate.update("UPDATE SSNT SET SSNT_STTS_CD = 'OFF' WHERE SSNT_YR = ?", ssntYr);
        mapper.insertEvntBatch(buildOffseasonEvent(ssntYr, evntDt));
        List<Map<String, Object>> report = generateFinalReport(ssntYr, evntDt);
        if (!report.isEmpty()) mapper.insertEvntBatch(report);
    }

    private void finalizeStandings(int ssntYr) {
        List<Map<String, Object>> stndList = mapper.findCurrentStnd(ssntYr);
        if (stndList.isEmpty()) return;

        int leaderW = toInt(stndList.get(0).get("W"));
        int leaderL = toInt(stndList.get(0).get("L"));

        for (int i = 0; i < stndList.size(); i++) {
            Map<String, Object> row = stndList.get(i);
            Long tmId = toLong(row.get("TM_ID"));
            int rank = i + 1;
            int w = toInt(row.get("W"));
            int l = toInt(row.get("L"));
            int t = toInt(row.get("T"));
            double pct = (w + l) > 0 ? Math.round((double) w / (w + l) * 10000.0) / 10000.0 : 0.0;
            double gb = ((leaderW - w) + (l - leaderL)) / 2.0;

            jdbcTemplate.update(
                    "UPDATE STND SET STND_RNK = ?, PCT = ?, GB = ? WHERE TM_ID = ? AND SSNT_YR = ?",
                    rank, pct, gb == 0.0 ? null : gb, tmId, ssntYr
            );
        }
        log.info("최종 순위 확정 완료: {}건 ({}년)", stndList.size(), ssntYr);
    }

    // ----- Step 3: 챔피언 결정 -----

    private List<Map<String, Object>> determineChampion(int ssntYr, LocalDate evntDt) {
        Map<String, Object> champion = mapper.findChampion(ssntYr);
        if (champion == null) return Collections.emptyList();

        String tmNm = (String) champion.get("TM_KR_NM");
        int w = toInt(champion.get("W"));
        int l = toInt(champion.get("L"));

        Map<String, Object> e = new HashMap<>();
        e.put("ssntYr", ssntYr);
        e.put("evntDt", evntDt);
        e.put("tmId", champion.get("TM_ID"));
        e.put("evntTypeCd", "POST");
        e.put("evntTtlt", ssntYr + "년 KBO 우승팀: " + tmNm);
        e.put("evntCnts", String.format(
                "%s이(가) %d년 KBO 리그 우승팀으로 확정되었습니다.\n최종 성적: %d승 %d패 (승률 %.3f).",
                tmNm, ssntYr, w, l, (w + l) > 0 ? (double) w / (w + l) : 0.0));
        return List.of(e);
    }

    // ----- Step 4: 시즌 기록 확정 -----

    private void finalizeSeasonRecords(int ssntYr) {
        // 타자 시즌 기록
        List<Map<String, Object>> batStats = mapper.aggregateBatterSeasonStats(ssntYr);
        for (Map<String, Object> r : batStats) {
            jdbcTemplate.update(
                    "INSERT INTO PLR_BATR_SSNT_REC " +
                    "(PLR_ID, TM_ID, SSNT_YR, G, PA, AB, H, DOBL, TRPL, HR, RBI, R, BB, IBB, SO, SB, CS, HBP, SAC, SF, GIDP, BA, OBP, SLG) " +
                    "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) " +
                    "ON DUPLICATE KEY UPDATE " +
                    "TM_ID=VALUES(TM_ID), G=VALUES(G), PA=VALUES(PA), AB=VALUES(AB), " +
                    "H=VALUES(H), DOBL=VALUES(DOBL), TRPL=VALUES(TRPL), HR=VALUES(HR), " +
                    "RBI=VALUES(RBI), R=VALUES(R), BB=VALUES(BB), IBB=VALUES(IBB), " +
                    "SO=VALUES(SO), SB=VALUES(SB), CS=VALUES(CS), HBP=VALUES(HBP), " +
                    "SAC=VALUES(SAC), SF=VALUES(SF), GIDP=VALUES(GIDP), BA=VALUES(BA), " +
                    "OBP=VALUES(OBP), SLG=VALUES(SLG)",
                    r.get("PLR_ID"), r.get("TM_ID"), r.get("SSNT_YR"),
                    r.get("G"), r.get("PA"), r.get("AB"), r.get("H"),
                    r.get("DOBL"), r.get("TRPL"), r.get("HR"), r.get("RBI"), r.get("R"),
                    r.get("BB"), r.get("IBB"), r.get("SO"), r.get("SB"), r.get("CS"),
                    r.get("HBP"), r.get("SAC"), r.get("SF"), r.get("GIDP"),
                    r.get("BA"), r.get("OBP"), r.get("SLG")
            );
        }

        // 투수 시즌 기록
        List<Map<String, Object>> pitStats = mapper.aggregatePitcherSeasonStats(ssntYr);
        for (Map<String, Object> r : pitStats) {
            jdbcTemplate.update(
                    "INSERT INTO PLR_PTCH_SSNT_REC " +
                    "(PLR_ID, TM_ID, SSNT_YR, G, GS, IP_OUT, BF, H, HR, R, ER, BB, IBB, SO, HBP, W, L, SV, HLD, ERA, WHIP) " +
                    "VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?) " +
                    "ON DUPLICATE KEY UPDATE " +
                    "TM_ID=VALUES(TM_ID), G=VALUES(G), GS=VALUES(GS), IP_OUT=VALUES(IP_OUT), " +
                    "BF=VALUES(BF), H=VALUES(H), HR=VALUES(HR), R=VALUES(R), ER=VALUES(ER), " +
                    "BB=VALUES(BB), IBB=VALUES(IBB), SO=VALUES(SO), HBP=VALUES(HBP), " +
                    "W=VALUES(W), L=VALUES(L), SV=VALUES(SV), HLD=VALUES(HLD), " +
                    "ERA=VALUES(ERA), WHIP=VALUES(WHIP)",
                    r.get("PLR_ID"), r.get("TM_ID"), r.get("SSNT_YR"),
                    r.get("G"), r.get("GS"), r.get("IP_OUT"), r.get("BF"),
                    r.get("H"), r.get("HR"), r.get("R"), r.get("ER"),
                    r.get("BB"), r.get("IBB"), r.get("SO"), r.get("HBP"),
                    r.get("W"), r.get("L"), r.get("SV"), r.get("HLD"),
                    r.get("ERA"), r.get("WHIP")
            );
        }

        log.info("시즌 기록 확정 완료 — 타자: {}건, 투수: {}건 ({}년)",
                batStats.size(), pitStats.size(), ssntYr);
    }

    // ----- Step 5: 골든글러브 선정 -----

    private static final Map<String, String> POSN_NM = Map.of(
            "20", "포수", "21", "1루수", "22", "2루수", "23", "3루수",
            "24", "유격수", "25", "좌익수", "26", "중견수", "27", "우익수", "28", "지명타자"
    );

    private List<Map<String, Object>> selectGoldenGloves(int ssntYr, LocalDate evntDt) {
        List<Map<String, Object>> events = new ArrayList<>();

        // 투수 골든글러브
        Map<String, Object> pitcher = mapper.findGoldenGlovePitcher(ssntYr);
        if (pitcher != null) {
            String plrNm = (String) pitcher.get("PLR_NM");
            String tmNm = (String) pitcher.get("TM_KR_NM");
            Object era = pitcher.get("ERA");
            Object w = pitcher.get("W");
            Map<String, Object> e = new HashMap<>();
            e.put("ssntYr", ssntYr);
            e.put("evntDt", evntDt);
            e.put("tmId", null);
            e.put("evntTypeCd", "REC");
            e.put("evntTtlt", ssntYr + "년 골든글러브 — 투수: " + plrNm);
            e.put("evntCnts", String.format(
                    "%s(%s) — ERA %s, %s승으로 %d년 투수 골든글러브를 수상했습니다.",
                    plrNm, tmNm, era, w, ssntYr));
            events.add(e);
        }

        // 야수 골든글러브
        List<Map<String, Object>> fielders = mapper.findGoldenGloveFielders(ssntYr);
        for (Map<String, Object> fielder : fielders) {
            String plrNm = (String) fielder.get("PLR_NM");
            String tmNm = (String) fielder.get("TM_KR_NM");
            String posnCd = (String) fielder.get("POSN_CD");
            String posnNm = POSN_NM.getOrDefault(posnCd, posnCd);
            Object ops = fielder.get("OPS");
            Map<String, Object> e = new HashMap<>();
            e.put("ssntYr", ssntYr);
            e.put("evntDt", evntDt);
            e.put("tmId", null);
            e.put("evntTypeCd", "REC");
            e.put("evntTtlt", ssntYr + "년 골든글러브 — " + posnNm + ": " + plrNm);
            e.put("evntCnts", String.format(
                    "%s(%s) — OPS %s로 %d년 %s 골든글러브를 수상했습니다.",
                    plrNm, tmNm, ops, ssntYr, posnNm));
            events.add(e);
        }

        return events;
    }

    // ----- Step 6: 시즌 MVP 선정 -----

    private List<Map<String, Object>> selectSeasonMvp(int ssntYr, LocalDate evntDt) {
        List<Map<String, Object>> events = new ArrayList<>();

        Map<String, Object> mvpBatter = mapper.findSeasonMvpBatter(ssntYr);
        if (mvpBatter != null) {
            String plrNm = (String) mvpBatter.get("PLR_NM");
            String tmNm = (String) mvpBatter.get("TM_KR_NM");
            Object ops = mvpBatter.get("OPS");
            Object hr = mvpBatter.get("HR");
            Object rbi = mvpBatter.get("RBI");
            Map<String, Object> e = new HashMap<>();
            e.put("ssntYr", ssntYr);
            e.put("evntDt", evntDt);
            e.put("tmId", null);
            e.put("evntTypeCd", "MVP");
            e.put("evntTtlt", ssntYr + "년 시즌 MVP(타자): " + plrNm);
            e.put("evntCnts", String.format(
                    "%s(%s) — OPS %s, %s홈런, %s타점으로 %d년 시즌 MVP(타자)에 선정되었습니다.",
                    plrNm, tmNm, ops, hr, rbi, ssntYr));
            events.add(e);
        }

        Map<String, Object> mvpPitcher = mapper.findSeasonMvpPitcher(ssntYr);
        if (mvpPitcher != null) {
            String plrNm = (String) mvpPitcher.get("PLR_NM");
            String tmNm = (String) mvpPitcher.get("TM_KR_NM");
            Object era = mvpPitcher.get("ERA");
            Object w = mvpPitcher.get("W");
            Object so = mvpPitcher.get("SO");
            Map<String, Object> e = new HashMap<>();
            e.put("ssntYr", ssntYr);
            e.put("evntDt", evntDt);
            e.put("tmId", null);
            e.put("evntTypeCd", "MVP");
            e.put("evntTtlt", ssntYr + "년 시즌 MVP(투수): " + plrNm);
            e.put("evntCnts", String.format(
                    "%s(%s) — ERA %s, %s승, %s탈삼진으로 %d년 시즌 MVP(투수)에 선정되었습니다.",
                    plrNm, tmNm, era, w, so, ssntYr));
            events.add(e);
        }

        return events;
    }

    // ----- Step 7: 팬·구단주 최종 평가 -----

    private void updateFinalSatisfaction(int ssntYr) {
        List<Map<String, Object>> stndList = mapper.findTeamFinalStnd(ssntYr);
        List<Map<String, Object>> mktList = mapper.findTeamMktSsnt(ssntYr);

        Map<Long, Map<String, Object>> mktMap = new HashMap<>();
        for (Map<String, Object> m : mktList) {
            mktMap.put(toLong(m.get("TM_ID")), m);
        }

        for (Map<String, Object> stnd : stndList) {
            Long tmId = toLong(stnd.get("TM_ID"));
            int rank = toInt(stnd.get("STND_RNK"));
            Map<String, Object> mkt = mktMap.getOrDefault(tmId, new HashMap<>());

            int fanSts = toInt(mkt.getOrDefault("FAN_STSFCTN", 50));
            int ownSts = toInt(mkt.getOrDefault("OWN_STSFCTN", 50));

            int delta;
            if (rank == 1) delta = 5;
            else if (rank <= 3) delta = 2;
            else if (rank <= 6) delta = 0;
            else if (rank <= 8) delta = -2;
            else delta = -5;

            int newFanSts = Math.max(20, Math.min(80, fanSts + delta));
            int newOwnSts = Math.max(20, Math.min(80, ownSts + delta));

            jdbcTemplate.update(
                    "INSERT INTO TM_MKT_SSNT (TM_ID, SSNT_YR, FAN_STSFCTN, OWN_STSFCTN) " +
                    "VALUES (?, ?, ?, ?) " +
                    "ON DUPLICATE KEY UPDATE FAN_STSFCTN = ?, OWN_STSFCTN = ?",
                    tmId, ssntYr, newFanSts, newOwnSts, newFanSts, newOwnSts
            );
        }
        log.info("팬·구단주 최종 평가 완료 ({}년)", ssntYr);
    }

    // ----- Step 8: 재정 최종 정산 -----

    private void finalizeFinance(int ssntYr) {
        // 현재 현금 = 티켓 수입 + 방송 수당 - 선수 연봉
        jdbcTemplate.update(
                "UPDATE TM_FNC_SSNT " +
                "SET CUR_CASH = COALESCE(TCKT_REV, 0) + COALESCE(BCST_REV, 0) - COALESCE(PLR_SAL_COST, 0) " +
                "WHERE SSNT_YR = ?",
                ssntYr
        );
        log.info("재정 최종 정산 완료 ({}년)", ssntYr);
    }

    // ----- Step 9: 선수 성장·노화 -----

    private void applyGrowthAndAging(int ssntYr) {
        List<Map<String, Object>> players = mapper.findPlayersForGrowth();
        Random rnd = new Random();

        for (Map<String, Object> plr : players) {
            long plrId = toLong(plr.get("PLR_ID"));
            int ovrl = toInt(plr.get("PLR_OVRL_ABLT"));
            int pot = toInt(plr.get("PLR_POT_ABLT"));

            // 잠재치 대비 현재 능력 비율
            double ratio = pot > 0 ? (double) ovrl / pot : 1.0;

            int delta;
            if (ratio < 0.6) {
                // 잠재치 대비 낮음: 성장 (+1 ~ +3)
                delta = rnd.nextInt(3) + 1;
            } else if (ratio < 0.85) {
                // 중간 구간: 소폭 성장 or 유지 (+0 ~ +1)
                delta = rnd.nextInt(2);
            } else if (ovrl >= 70) {
                // 잠재치 근접 + 높은 능력치: 노화 가능성 (-1 ~ -2)
                delta = -(rnd.nextInt(2) + 1);
            } else {
                // 잠재치 근접이지만 능력치 낮음: 유지
                delta = 0;
            }

            if (delta == 0) continue;

            int newOvrl = Math.min(pot, Math.max(20, Math.min(80, ovrl + delta)));
            if (newOvrl == ovrl) continue;

            jdbcTemplate.update(
                    "UPDATE PLR SET PLR_OVRL_ABLT = ? WHERE PLR_ID = ?",
                    newOvrl, plrId
            );

            // 개별 능력치 비례 조정 (delta 방향으로 1포인트 랜덤 능력치 조정)
            if (Math.abs(delta) >= 1) {
                jdbcTemplate.update(
                        "UPDATE PLR_ABLT " +
                        "SET ABLT_VAL = GREATEST(20, LEAST(80, ABLT_VAL + ?)) " +
                        "WHERE PLR_ID = ? AND ABLT_CD = (" +
                        "  SELECT ABLT_CD FROM (" +
                        "    SELECT ABLT_CD FROM PLR_ABLT WHERE PLR_ID = ? " +
                        "    ORDER BY RAND() LIMIT 1" +
                        "  ) sub" +
                        ")",
                        Integer.signum(delta), plrId, plrId
                );
            }
        }
        log.info("선수 성장·노화 처리 완료 — {}명 ({}년)", players.size(), ssntYr);
    }

    // ----- 시설 노후화 (시즌 종료 시 각 시설 랜덤 1~3단계 하락, 최소 1단계 유지) -----

    private void applyFacilityDecay() {
        Random rnd = new Random();
        List<Map<String, Object>> facilities = jdbcTemplate.queryForList(
                "SELECT TM_ID, FCLTY_TYPE_CD FROM TM_FCLTY WHERE FCLTY_TYPE_CD != 'STDM'"
        );
        for (Map<String, Object> f : facilities) {
            int drop = rnd.nextInt(3) + 1;  // 1 ~ 3
            jdbcTemplate.update(
                    "UPDATE TM_FCLTY SET FCLTY_LVL = GREATEST(1, FCLTY_LVL - ?) WHERE TM_ID = ? AND FCLTY_TYPE_CD = ?",
                    drop, f.get("TM_ID"), f.get("FCLTY_TYPE_CD")
            );
        }
        log.info("시설 노후화 처리 완료 — {}건 (STDM 제외)", facilities.size());
    }

    // ----- Step 10: 계약 만료·FA 처리 -----

    private List<Map<String, Object>> processExpiredContracts(int ssntYr, String ssntEndDt, LocalDate evntDt) {
        List<Map<String, Object>> expired = mapper.findExpiredContracts(ssntEndDt);
        List<Map<String, Object>> events = new ArrayList<>();

        Long userTmId = mapper.findUserTmId();

        for (Map<String, Object> contract : expired) {
            long plrId = toLong(contract.get("PLR_ID"));
            String plrNm = (String) contract.get("PLR_NM");
            Object tmId = contract.get("TM_ID");
            String tmNm = (String) contract.get("TM_KR_NM");

            // 선수 상태를 FA로 변경, 소속 팀 해제
            jdbcTemplate.update(
                    "UPDATE PLR SET PLR_STTS_CD = 'FA', TM_ID = NULL WHERE PLR_ID = ?",
                    plrId
            );

            // 계약 이력 저장
            jdbcTemplate.update(
                    "INSERT IGNORE INTO PLR_TM_CNTRCT_HIST " +
                    "(PLR_ID, TM_ID, FA_CNTRCT_BGNG_DT, FA_CNTRCT_END_DT) " +
                    "SELECT PLR_ID, TM_ID, FA_CNTRCT_BGNG_DT, FA_CNTRCT_END_DT " +
                    "FROM PLR_TM_CNTRCT WHERE PLR_ID = ?",
                    plrId
            );

            // 유저 팀 선수의 FA는 이벤트 생성
            if (userTmId != null && userTmId.equals(toLong(tmId))) {
                Map<String, Object> e = new HashMap<>();
                e.put("ssntYr", ssntYr);
                e.put("evntDt", evntDt);
                e.put("tmId", userTmId);
                e.put("evntTypeCd", "SIGN");
                e.put("evntTtlt", plrNm + " 계약 만료 — FA 전환");
                e.put("evntCnts", String.format(
                        "%s의 %s와의 계약이 만료되어 FA(자유계약선수)로 전환되었습니다. 오프시즌에 재계약 협상이 가능합니다.",
                        plrNm, tmNm != null ? tmNm : "팀"));
                events.add(e);
            }
        }

        log.info("계약 만료·FA 처리 완료 — {}명 ({}년)", expired.size(), ssntYr);
        return events;
    }

    // ----- Step 11: 은퇴 처리 -----

    private List<Map<String, Object>> processRetirements(int ssntYr, LocalDate evntDt) {
        List<Map<String, Object>> candidates = mapper.findRetirementCandidates();
        List<Map<String, Object>> events = new ArrayList<>();
        Random rnd = new Random();

        for (Map<String, Object> plr : candidates) {
            long plrId = toLong(plr.get("PLR_ID"));
            String plrNm = (String) plr.get("PLR_NM");
            int ovrl = toInt(plr.get("PLR_OVRL_ABLT"));

            // 은퇴 확률: 능력치가 낮을수록 높음 (40 이하 → 70%, 35 이하 → 90%)
            double retireProb = ovrl <= 35 ? 0.9 : 0.7;
            if (rnd.nextDouble() > retireProb) continue;

            jdbcTemplate.update(
                    "UPDATE PLR SET PLR_STTS_CD = 'RET', TM_ID = NULL WHERE PLR_ID = ?",
                    plrId
            );

            Map<String, Object> e = new HashMap<>();
            e.put("ssntYr", ssntYr);
            e.put("evntDt", evntDt);
            e.put("tmId", null);
            e.put("evntTypeCd", "REL");
            e.put("evntTtlt", plrNm + " 은퇴");
            e.put("evntCnts", String.format(
                    "%s 선수가 %d년을 끝으로 현역 생활을 마무리하고 은퇴를 선언했습니다.",
                    plrNm, ssntYr));
            events.add(e);
        }

        log.info("은퇴 처리 완료 — {}명 중 {}명 은퇴 ({}년)", candidates.size(), events.size(), ssntYr);
        return events;
    }

    // ----- Step 12: 드래프트 준비 -----

    private void prepareDraft(int ssntYr) {
        int nextYr = ssntYr + 1;
        String drftDt = LocalDate.of(nextYr, 2, 1).toString();

        // 드래프트 이벤트 생성 (JdbcTemplate으로 generated key 획득)
        var keyHolder = new org.springframework.jdbc.support.GeneratedKeyHolder();
        jdbcTemplate.update(conn -> {
            var ps = conn.prepareStatement(
                    "INSERT INTO DRFT (SSNT_YR, DRFT_DT, DRFT_STTS_CD) VALUES (?, ?, 'READY')",
                    java.sql.Statement.RETURN_GENERATED_KEYS
            );
            ps.setInt(1, nextYr);
            ps.setString(2, drftDt);
            return ps;
        }, keyHolder);

        Number key = keyHolder.getKey();
        if (key == null) {
            log.warn("드래프트 ID 생성 실패 — 건너뜀");
            return;
        }
        long drftId = key.longValue();

        // 역순위 드래프트 지명순 생성 (10위 → 1픽, RND=1)
        List<Map<String, Object>> stndList = mapper.findCurrentStnd(ssntYr);
        int totalTeams = stndList.size();
        for (int i = 0; i < totalTeams; i++) {
            Map<String, Object> row = stndList.get(i);
            Long tmId = toLong(row.get("TM_ID"));
            // 순위가 높을수록 나중에 픽 (1위 팀이 10픽, 10위 팀이 1픽)
            int pickNo = totalTeams - i;     // 전체 픽 번호
            int rndPickNo = totalTeams - i;  // 라운드 내 픽 번호

            jdbcTemplate.update(
                    "INSERT INTO DRFT_ORD (DRFT_ID, PICK_NO, RND, RND_PICK_NO, TM_ID, PICK_STTS_CD) " +
                    "VALUES (?, ?, 1, ?, ?, 'PENDING')",
                    drftId, pickNo, rndPickNo, tmId
            );
        }

        log.info("드래프트 준비 완료 — drftId={}, {}년 ({} 예정)", drftId, nextYr, drftDt);
    }

    // ----- Step 13: 오프시즌 이벤트 -----

    private List<Map<String, Object>> buildOffseasonEvent(int ssntYr, LocalDate evntDt) {
        Map<String, Object> e = new HashMap<>();
        e.put("ssntYr", ssntYr);
        e.put("evntDt", evntDt);
        e.put("tmId", null);
        e.put("evntTypeCd", "NEWS");
        e.put("evntTtlt", ssntYr + "년 KBO 리그 시즌 종료");
        e.put("evntCnts", String.format(
                "%d년 KBO 리그가 공식적으로 종료되었습니다.\n" +
                "이제 오프시즌이 시작됩니다. FA 협상, 트레이드, 드래프트 등 다양한 오프시즌 활동을 진행할 수 있습니다.",
                ssntYr));
        return List.of(e);
    }

    // ----- Step 14: 최종 리포트 -----

    private List<Map<String, Object>> generateFinalReport(int ssntYr, LocalDate evntDt) {
        Long userTmId = mapper.findUserTmId();
        if (userTmId == null) {
            log.warn("유저 팀 ID 없음 — 최종 리포트 스킵");
            return Collections.emptyList();
        }

        Map<String, Object> stnd = mapper.findTeamFinalStnd(ssntYr)
                .stream().filter(r -> userTmId.equals(toLong(r.get("TM_ID")))).findFirst().orElse(null);
        Map<String, Object> bestBat = mapper.findUserTeamSeasonBestBatter(userTmId, ssntYr);
        Map<String, Object> bestPit = mapper.findUserTeamSeasonBestPitcher(userTmId, ssntYr);
        Map<String, Object> finance = mapper.findUserTeamFinance(userTmId, ssntYr);

        StringBuilder cnts = new StringBuilder();
        cnts.append(String.format("▣ %d년 시즌 최종 성적\n", ssntYr));
        if (stnd != null) {
            int w = toInt(stnd.get("W"));
            int l = toInt(stnd.get("L"));
            int rank = toInt(stnd.get("STND_RNK"));
            double pct = toDouble(stnd.get("PCT"));
            cnts.append(String.format("  %d승 %d패 | 승률 %.3f | 최종 순위 %d위\n", w, l, pct, rank));
        }

        cnts.append("\n▣ 시즌 최고 선수\n");
        if (bestBat != null) {
            cnts.append(String.format("  타자: %s (OPS %s, %s홈런, %s타점)\n",
                    bestBat.get("PLR_NM"), bestBat.get("OPS"),
                    bestBat.get("HR"), bestBat.get("RBI")));
        } else {
            cnts.append("  타자: 기록 없음\n");
        }
        if (bestPit != null) {
            cnts.append(String.format("  투수: %s (ERA %s, %s승, %s탈삼진)\n",
                    bestPit.get("PLR_NM"), bestPit.get("ERA"),
                    bestPit.get("W"), bestPit.get("SO")));
        } else {
            cnts.append("  투수: 기록 없음\n");
        }

        cnts.append("\n▣ 시즌 재정 결산\n");
        if (finance != null) {
            long tckt = toLong(finance.get("TCKT_REV"));
            long bcst = toLong(finance.get("BCST_REV"));
            long cost = toLong(finance.get("PLR_SAL_COST"));
            long cash = toLong(finance.get("CUR_CASH"));
            cnts.append(String.format(
                    "  티켓: %,d만원 | 방송: %,d만원 | 연봉: %,d만원\n  순이익: %,d만원 | 잔여자금: %,d만원",
                    tckt, bcst, cost, (tckt + bcst - cost), cash));
        } else {
            cnts.append("  재정 정보 없음");
        }

        Map<String, Object> report = new HashMap<>();
        report.put("ssntYr", ssntYr);
        report.put("evntDt", evntDt);
        report.put("tmId", userTmId);
        report.put("evntTypeCd", "NEWS");
        report.put("evntTtlt", ssntYr + "년 시즌 최종 리포트");
        report.put("evntCnts", cnts.toString());

        return List.of(report);
    }

    // ----- SSE 전송 헬퍼 -----

    private void emit(SseEmitter emitter, int step, int ssntYr,
                      String message, boolean done) throws Exception {
        SeasonEndProgressDto dto = SeasonEndProgressDto.builder()
                .step(step).total(TOTAL_STEPS)
                .message(message).done(done)
                .ssntYr(ssntYr)
                .build();
        emitter.send(SseEmitter.event().data(objectMapper.writeValueAsString(dto)));
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
