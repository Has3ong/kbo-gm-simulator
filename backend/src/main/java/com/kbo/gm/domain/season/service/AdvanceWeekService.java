package com.kbo.gm.domain.season.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kbo.gm.domain.season.dao.SsntDao;
import com.kbo.gm.domain.season.dto.AdvanceWeekProgressDto;
import com.kbo.gm.domain.season.mapper.SsntMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdvanceWeekService {

    private final SsntMapper ssntMapper;
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;
    private final GameResultService gameResultService;
    private final MonthlyEventService monthlyEventService;
    private final WeeklyEventService weeklyEventService;
    private final SeasonEndService seasonEndService;
    private final FrgnPlrService frgnPlrService;

    /**
     * 현재 날짜부터 다음주 월요일까지 하루씩 진행하며 필요한 이벤트를 자동 처리한다.
     */
    public void advanceToNextMonday(int ssntYr, SseEmitter emitter) {
        try {
            SsntDao dao = ssntMapper.findByYear(ssntYr);
            if (dao == null) throw new IllegalStateException("시즌 정보를 찾을 수 없습니다.");

            LocalDate curDt = dao.getCurDt();
            if (curDt == null) throw new IllegalStateException("현재 날짜가 없습니다.");

            // 다음주 월요일 계산
            LocalDate nextMonday = curDt.with(DayOfWeek.MONDAY).plusWeeks(1);
            int totalDays = (int) (nextMonday.toEpochDay() - curDt.toEpochDay());

            emit(emitter, 0, totalDays, curDt.toString(), nextMonday.toString(),
                    "다음주 월요일(" + nextMonday + ")까지 진행 시작...", false);

            int processed = 0;
            LocalDate date = curDt.plusDays(1);

            while (!date.isAfter(nextMonday)) {
                // 날짜 진행 (advance-check 없이 강제 이동)
                advanceDateDirect(ssntYr);
                applyStatusTransition(ssntYr, date);

                processed++;
                String dateStr = date.toString();

                // 경기일 처리 (정규시즌/포스트시즌)
                SsntDao current = ssntMapper.findByYear(ssntYr);
                String status = current != null ? current.getSsntSttsCd() : "PRE";

                if ("REG".equals(status) || "POST".equals(status)) {
                    emit(emitter, processed, totalDays, dateStr, nextMonday.toString(),
                            dateStr + " 경기 처리 중...", false);
                    try {
                        gameResultService.processGamesInternal(ssntYr, dateStr);
                    } catch (Exception e) {
                        log.warn("{}일 경기 처리 실패 (무시): {}", dateStr, e.getMessage());
                    }
                }

                // 외국인 선수 오퍼 처리 (PRE 시즌 2/1~2/10)
                if ("PRE".equals(status)) {
                    try {
                        frgnPlrService.processDailyOffers(ssntYr, dateStr);
                    } catch (Exception e) {
                        log.warn("{}일 외국인 오퍼 처리 실패: {}", dateStr, e.getMessage());
                    }
                }

                // 월 1일: 월간 정산 (이전 달)
                if (date.getDayOfMonth() == 1 && !"PRE".equals(status)) {
                    int prevMon = date.minusMonths(1).getMonthValue();
                    emit(emitter, processed, totalDays, dateStr, nextMonday.toString(),
                            date.getYear() + "년 " + prevMon + "월 정산 중...", false);
                    try {
                        monthlyEventService.settleInternal(ssntYr, prevMon, date);
                    } catch (Exception e) {
                        log.warn("{}월 정산 실패 (무시): {}", prevMon, e.getMessage());
                    }

                    // 11월 1일: 시즌 종료
                    if (date.getMonthValue() == 11) {
                        emit(emitter, processed, totalDays, dateStr, nextMonday.toString(),
                                "시즌 종료 처리 중...", false);
                        try {
                            seasonEndService.runSeasonEnd(ssntYr, dateStr);
                        } catch (Exception e) {
                            log.warn("시즌 종료 처리 실패 (무시): {}", e.getMessage());
                        }
                    }
                }

                // 월요일: 주간 처리
                if (date.getDayOfWeek() == DayOfWeek.MONDAY && !"PRE".equals(status)) {
                    emit(emitter, processed, totalDays, dateStr, nextMonday.toString(),
                            dateStr + " 주간 처리 중...", false);
                    try {
                        weeklyEventService.processInternal(ssntYr, dateStr);
                    } catch (Exception e) {
                        log.warn("{}일 주간 처리 실패 (무시): {}", dateStr, e.getMessage());
                    }
                }

                emit(emitter, processed, totalDays, dateStr, nextMonday.toString(),
                        dateStr + " 완료", false);

                date = date.plusDays(1);
            }

            emit(emitter, totalDays, totalDays, nextMonday.toString(), nextMonday.toString(),
                    nextMonday + "까지 진행 완료!", true);
            emitter.complete();

        } catch (Exception e) {
            log.error("다음주까지 진행 실패 ({}년)", ssntYr, e);
            try {
                AdvanceWeekProgressDto err = AdvanceWeekProgressDto.builder()
                        .processedDays(0).totalDays(0)
                        .currentDate("").targetDate("")
                        .message("오류: " + e.getMessage())
                        .done(false).error(e.getMessage()).ssntYr(ssntYr)
                        .build();
                emitter.send(SseEmitter.event().data(objectMapper.writeValueAsString(err)));
            } catch (Exception ignored) {}
            emitter.completeWithError(e);
        }
    }

    private void advanceDateDirect(int ssntYr) {
        ssntMapper.advanceDate(ssntYr);
    }

    private void applyStatusTransition(int ssntYr, LocalDate date) {
        SsntDao dao = ssntMapper.findByYear(ssntYr);
        if (dao == null) return;
        String status = dao.getSsntSttsCd();

        if ("PRE".equals(status) && dao.getRegSsntBgngDt() != null
                && !date.isBefore(dao.getRegSsntBgngDt())) {
            ssntMapper.updateSsntStatus(ssntYr, "REG");

        } else if ("REG".equals(status) && dao.getPstssntBgngDt() != null
                && !date.isBefore(dao.getPstssntBgngDt())) {
            ssntMapper.updateSsntStatus(ssntYr, "POST");

        } else if ("POST".equals(status) && dao.getSsntEndDt() != null
                && !date.isBefore(dao.getSsntEndDt())) {
            ssntMapper.updateSsntStatus(ssntYr, "OFF");
        }
    }

    private void emit(SseEmitter emitter, int processed, int total, String currentDate,
                      String targetDate, String message, boolean done) throws Exception {
        AdvanceWeekProgressDto dto = AdvanceWeekProgressDto.builder()
                .processedDays(processed).totalDays(total)
                .currentDate(currentDate).targetDate(targetDate)
                .message(message).done(done)
                .build();
        emitter.send(SseEmitter.event().data(objectMapper.writeValueAsString(dto)));
    }
}
