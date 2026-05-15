package com.kbo.gm.domain.season.controller;

import com.kbo.gm.domain.season.service.GameResultService;
import com.kbo.gm.domain.season.service.WeeklyEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@RestController
@RequestMapping("/api/game")
@RequiredArgsConstructor
public class GameResultController {

    private final GameResultService gameResultService;
    private final WeeklyEventService weeklyEventService;
    private final ExecutorService executor = Executors.newCachedThreadPool();

    @GetMapping(value = "/simulate", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter simulateGames(
            @RequestParam int ssntYr,
            @RequestParam String gameDt
    ) {
        SseEmitter emitter = new SseEmitter(120_000L);
        executor.execute(() -> gameResultService.processGames(ssntYr, gameDt, emitter));
        return emitter;
    }

    @GetMapping(value = "/weekly-process", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter weeklyProcess(
            @RequestParam int ssntYr,
            @RequestParam String weekDt
    ) {
        SseEmitter emitter = new SseEmitter(120_000L);
        executor.execute(() -> weeklyEventService.process(ssntYr, weekDt, emitter));
        return emitter;
    }
}
