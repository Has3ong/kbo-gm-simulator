package com.kbo.gm.domain.season.controller;

import com.kbo.gm.domain.season.service.SeasonEndService;
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
public class SeasonEndController {

    private final SeasonEndService seasonEndService;
    private final ExecutorService executor = Executors.newCachedThreadPool();

    /**
     * 시즌 종료 프로세스 실행 (SSE 스트리밍)
     *
     * @param ssntYr 시즌 연도
     * @param evntDt 이벤트 기준일 (게임 내 현재 날짜, 보통 11월 1일)
     */
    @GetMapping(value = "/season-end", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter seasonEnd(
            @RequestParam int ssntYr,
            @RequestParam(required = false) String evntDt
    ) {
        LocalDate date = (evntDt != null && !evntDt.isBlank())
                ? LocalDate.parse(evntDt)
                : LocalDate.of(ssntYr, 11, 1);

        SseEmitter emitter = new SseEmitter(300_000L); // 5분 타임아웃
        executor.execute(() -> seasonEndService.endSeason(ssntYr, date, emitter));
        return emitter;
    }
}
