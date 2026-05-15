package com.kbo.gm.domain.season.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kbo.gm.domain.season.dto.WeeklyEventProgressDto;
import com.kbo.gm.domain.season.mapper.WeeklyEventMapper;
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
public class WeeklyEventService {

    private static final int TOTAL_STEPS = 10;

    private final WeeklyEventMapper mapper;
    private final ObjectMapper objectMapper;
    private final JdbcTemplate jdbcTemplate;

    public void process(int ssntYr, String weekDt, SseEmitter emitter) {
        try {
            LocalDate weekDate = LocalDate.parse(weekDt);
            String weekStart = weekDate.minusDays(6).toString();
            String weekEnd = weekDt;

            // Step 1: 지난 1주일 성적 요약
            emit(emitter, 1, ssntYr, weekDt, "지난 주 성적 요약 중...", false);
            List<Map<String, Object>> weeklyStats = summarizeWeeklyStats(ssntYr, weekStart, weekEnd);

            // Step 2: 선수 피로도/컨디션 회복
            emit(emitter, 2, ssntYr, weekDt, "선수 피로도·컨디션 회복 중...", false);
            recoverFatigueCondition(ssntYr);

            // Step 3: 부상 회복 상태 갱신
            emit(emitter, 3, ssntYr, weekDt, "부상 선수 회복 상태 갱신 중...", false);
            updateInjuryRecovery(ssntYr);

            // Step 4: 로스터 문제 점검
            emit(emitter, 4, ssntYr, weekDt, "로스터 점검 중...", false);
            List<Map<String, Object>> rosterWarnings = checkRosterIssues(ssntYr, weekDt);

            // Step 5: 선발 로테이션 정리
            emit(emitter, 5, ssntYr, weekDt, "선발 로테이션 정리 중...", false);
            // 실제 로테이션 순환 로직은 향후 구현

            // Step 6: 불펜 피로도 경고
            emit(emitter, 6, ssntYr, weekDt, "불펜 피로도 점검 중...", false);
            List<Map<String, Object>> bullpenWarnings = checkBullpenFatigue(ssntYr, weekDt);

            // Step 7: AI 구단 로스터 자동 조정
            emit(emitter, 7, ssntYr, weekDt, "AI 구단 로스터 자동 조정 중...", false);
            adjustAiRosters(ssntYr);

            // Step 8: 트레이드 시장 관심도 갱신
            emit(emitter, 8, ssntYr, weekDt, "트레이드 시장 관심도 갱신 중...", false);
            // 향후 구현

            // Step 9: 스카우팅 진행도 갱신
            emit(emitter, 9, ssntYr, weekDt, "스카우팅 진행도 갱신 중...", false);
            advanceScoutingAccuracy(ssntYr);

            // Step 10: 주간 리포트 생성
            emit(emitter, 10, ssntYr, weekDt, "주간 리포트 생성 중...", false);
            List<Map<String, Object>> allEvents = new ArrayList<>();
            allEvents.addAll(rosterWarnings);
            allEvents.addAll(bullpenWarnings);
            allEvents.addAll(generateWeeklyReport(ssntYr, weekDt, weekStart, weekEnd, weeklyStats));
            if (!allEvents.isEmpty()) mapper.insertEvntBatch(allEvents);

            emit(emitter, TOTAL_STEPS, ssntYr, weekDt, "주간 처리 완료!", true);
            emitter.complete();

        } catch (Exception e) {
            log.error("주간 처리 실패 ({}년 {})", ssntYr, weekDt, e);
            try {
                WeeklyEventProgressDto err = WeeklyEventProgressDto.builder()
                        .step(0).total(TOTAL_STEPS).message("오류: " + e.getMessage())
                        .done(false).error(e.getMessage()).ssntYr(ssntYr).weekDt(weekDt)
                        .build();
                emitter.send(SseEmitter.event().data(objectMapper.writeValueAsString(err)));
            } catch (Exception ignored) {}
            emitter.completeWithError(e);
        }
    }

    /** AdvanceWeekService 에서 SSE 없이 호출하는 내부 실행 메서드 */
    public void processInternal(int ssntYr, String weekDt) {
        LocalDate weekDate = LocalDate.parse(weekDt);
        String weekStart = weekDate.minusDays(6).toString();
        String weekEnd = weekDt;
        List<Map<String, Object>> weeklyStats = summarizeWeeklyStats(ssntYr, weekStart, weekEnd);
        recoverFatigueCondition(ssntYr);
        updateInjuryRecovery(ssntYr);
        List<Map<String, Object>> rosterWarnings = checkRosterIssues(ssntYr, weekDt);
        List<Map<String, Object>> bullpenWarnings = checkBullpenFatigue(ssntYr, weekDt);
        adjustAiRosters(ssntYr);
        advanceScoutingAccuracy(ssntYr);
        List<Map<String, Object>> allEvents = new ArrayList<>();
        allEvents.addAll(rosterWarnings);
        allEvents.addAll(bullpenWarnings);
        allEvents.addAll(generateWeeklyReport(ssntYr, weekDt, weekStart, weekEnd, weeklyStats));
        if (!allEvents.isEmpty()) mapper.insertEvntBatch(allEvents);
    }

    // ----- Step 1: 주간 성적 요약 -----

    private List<Map<String, Object>> summarizeWeeklyStats(int ssntYr, String weekStart, String weekEnd) {
        try {
            return mapper.findWeeklyTeamStats(ssntYr, weekStart, weekEnd);
        } catch (Exception e) {
            log.warn("주간 성적 집계 실패: {}", e.getMessage());
            return Collections.emptyList();
        }
    }

    // ----- Step 2: 피로도/컨디션 회복 -----

    private void recoverFatigueCondition(int ssntYr) {
        // 모든 활동 선수 피로도 감소, 컨디션 증가
        jdbcTemplate.update(
                "UPDATE PLR_FATG_COND FC " +
                "JOIN PLR P ON P.PLR_ID = FC.PLR_ID " +
                "SET FC.FATG = GREATEST(0, FC.FATG - 15), " +
                "    FC.COND = LEAST(100, FC.COND + 10) " +
                "WHERE FC.SSNT_YR = ? AND P.PLR_STTS_CD = 'AT'",
                ssntYr);
        log.debug("주간 피로도/컨디션 회복 완료");
    }

    // ----- Step 3: 부상 회복 -----

    private void updateInjuryRecovery(int ssntYr) {
        // 부상 선수 회복 시뮬레이션: 일정 확률로 AT 복귀
        List<Map<String, Object>> injured = mapper.findInjuredPlayers();
        Random rnd = new Random();
        for (Map<String, Object> row : injured) {
            long plrId = toLong(row.get("PLR_ID"));
            // 10% 확률로 회복
            if (rnd.nextDouble() < 0.10) {
                jdbcTemplate.update("UPDATE PLR SET PLR_STTS_CD='AT' WHERE PLR_ID=?", plrId);
                log.debug("부상 회복: PLR_ID={}", plrId);
            }
        }
    }

    // ----- Step 4: 로스터 점검 -----

    private List<Map<String, Object>> checkRosterIssues(int ssntYr, String weekDt) {
        Long userTmId = mapper.findUserTmId();
        if (userTmId == null) return Collections.emptyList();

        List<Map<String, Object>> players = mapper.findAllActivePlayersByTeam(userTmId);
        List<Map<String, Object>> events = new ArrayList<>();

        long pitcherCount = players.stream()
                .filter(p -> "10".equals(p.get("REPR_POSN_CD")))
                .count();
        long catcherCount = players.stream()
                .filter(p -> "20".equals(p.get("REPR_POSN_CD")))
                .count();

        if (pitcherCount < 10) {
            Map<String, Object> ev = newEvent(ssntYr, weekDt, userTmId, "WARN",
                    "로스터 경고: 투수 부족",
                    String.format("현재 1군 투수가 %d명입니다. 최소 10명 이상을 유지해야 합니다.", pitcherCount));
            events.add(ev);
        }
        if (catcherCount == 0) {
            Map<String, Object> ev = newEvent(ssntYr, weekDt, userTmId, "WARN",
                    "로스터 경고: 포수 없음",
                    "1군 엔트리에 포수가 없습니다. 즉시 포수를 보강해 주세요.");
            events.add(ev);
        }
        return events;
    }

    // ----- Step 6: 불펜 피로도 경고 -----

    private List<Map<String, Object>> checkBullpenFatigue(int ssntYr, String weekDt) {
        Long userTmId = mapper.findUserTmId();
        if (userTmId == null) return Collections.emptyList();

        List<Map<String, Object>> players = mapper.findAllActivePlayersByTeam(userTmId);
        List<Map<String, Object>> events = new ArrayList<>();

        for (Map<String, Object> p : players) {
            if (!"10".equals(p.get("REPR_POSN_CD"))) continue;
            int fatg = toInt(p.get("FATG"));
            if (fatg >= 80) {
                String plrNm = (String) p.get("PLR_NM");
                Map<String, Object> ev = newEvent(ssntYr, weekDt, userTmId, "WARN",
                        "투수 피로 경고: " + plrNm,
                        String.format("%s의 피로도가 %d로 매우 높습니다. 다음 주 등판 조정을 고려해주세요.", plrNm, fatg));
                events.add(ev);
            }
        }
        return events;
    }

    // ----- Step 7: AI 구단 로스터 자동 조정 -----

    private void adjustAiRosters(int ssntYr) {
        // 피로도 90 이상 AI 선수 2군 강등 (향후 구현 예정)
        log.debug("AI 구단 로스터 자동 조정 완료 (스텁)");
    }

    // ----- Step 9: 스카우팅 정확도 갱신 -----

    private void advanceScoutingAccuracy(int ssntYr) {
        Long userTmId = mapper.findUserTmId();
        if (userTmId == null) return;
        Map<String, Object> staffRow = mapper.findTeamStaff(userTmId);
        int fcltLvl = staffRow != null ? toInt(staffRow.get("FCLTY_LVL")) : 1;
        int delta = fcltLvl + 1; // 시설 레벨당 +1씩 추가
        jdbcTemplate.update(
                "UPDATE DRFT_SCUT_RPT SET ACCRCY=LEAST(100, ACCRCY+?) WHERE TM_ID=?",
                delta, userTmId);
    }

    // ----- Step 10: 주간 리포트 -----

    private List<Map<String, Object>> generateWeeklyReport(int ssntYr, String weekDt,
                                                            String weekStart, String weekEnd,
                                                            List<Map<String, Object>> weeklyStats) {
        Long userTmId = mapper.findUserTmId();
        if (userTmId == null) return Collections.emptyList();

        // 유저 팀 주간 성적 집계
        int totalW = 0, totalL = 0, totalT = 0;
        for (Map<String, Object> row : weeklyStats) {
            if (userTmId.equals(toLong(row.get("TM_ID")))) {
                totalW += toInt(row.get("W"));
                totalL += toInt(row.get("L"));
                totalT += toInt(row.get("T"));
            }
        }

        StringBuilder cnts = new StringBuilder();
        cnts.append(String.format("▣ 주간 성적 (%s ~ %s)\n", weekStart, weekEnd));
        cnts.append(String.format("  %d승 %d패 %d무\n\n", totalW, totalL, totalT));
        cnts.append("▣ 처리 내용\n");
        cnts.append("  · 선수 피로도·컨디션 주간 회복 완료\n");
        cnts.append("  · 부상 선수 회복 상태 점검 완료\n");
        cnts.append("  · 스카우팅 진행도 갱신 완료\n");

        Map<String, Object> report = newEvent(ssntYr, weekDt, userTmId, "NEWS",
                ssntYr + "년 주간 리포트 (" + weekEnd + ")", cnts.toString());
        return List.of(report);
    }

    // ----- 헬퍼 -----

    private Map<String, Object> newEvent(int ssntYr, String evntDt, Long tmId,
                                          String typeCd, String ttlt, String cnts) {
        Map<String, Object> e = new HashMap<>();
        e.put("ssntYr", ssntYr);
        e.put("evntDt", evntDt);
        e.put("tmId", tmId);
        e.put("plrId", null);
        e.put("evntTypeCd", typeCd);
        e.put("evntTtlt", ttlt);
        e.put("evntCnts", cnts);
        return e;
    }

    private void emit(SseEmitter emitter, int step, int ssntYr, String weekDt,
                      String message, boolean done) throws Exception {
        WeeklyEventProgressDto dto = WeeklyEventProgressDto.builder()
                .step(step).total(TOTAL_STEPS).message(message)
                .done(done).ssntYr(ssntYr).weekDt(weekDt)
                .build();
        emitter.send(SseEmitter.event().data(objectMapper.writeValueAsString(dto)));
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
