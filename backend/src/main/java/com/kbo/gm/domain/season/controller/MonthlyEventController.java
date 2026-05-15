package com.kbo.gm.domain.season.controller;

import com.kbo.gm.domain.season.service.MonthlyEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDate;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@RestController
@RequestMapping("/api/game")
@RequiredArgsConstructor
public class MonthlyEventController {

    private final MonthlyEventService monthlyEventService;
    private final ExecutorService executor = Executors.newCachedThreadPool();

    /**
     * 월간 정산 이벤트 실행 (SSE 스트리밍)
     *
     * @param ssntYr 시즌 연도
     * @param mon    정산 대상 월 (이전 달, 예: 5월 1일이면 mon=4)
     * @param evntDt 이벤트 기준일 (게임 내 현재 날짜, 기본: 오늘)
     */
    @GetMapping(value = "/monthly-settle", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter monthlySettle(
            @RequestParam int ssntYr,
            @RequestParam int mon,
            @RequestParam(required = false) String evntDt
    ) {
        LocalDate date = (evntDt != null && !evntDt.isBlank())
                ? LocalDate.parse(evntDt)
                : LocalDate.of(ssntYr, mon < 12 ? mon + 1 : 1, 1);

        SseEmitter emitter = new SseEmitter(120_000L); // 2분 타임아웃
        executor.execute(() -> monthlyEventService.settle(ssntYr, mon, date, emitter));
        return emitter;
    }
}
