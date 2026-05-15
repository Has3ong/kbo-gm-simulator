package com.kbo.gm.domain.season.controller;

import com.kbo.gm.domain.season.service.GameStartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDate;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@RestController
@RequestMapping("/api/game")
@RequiredArgsConstructor
public class GameStartController {

    private final GameStartService gameStartService;

    // SSE는 GET만 지원하는 EventSource를 사용하므로 tmId를 쿼리 파라미터로 받는다.
    // 단일 사용자 앱이므로 인증 없이 GET으로 시즌 시작을 허용한다.
    private final ExecutorService executor = Executors.newCachedThreadPool();

    @GetMapping(value = "/start", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter startGame(
            @RequestParam Long tmId,
            @RequestParam(defaultValue = "0") int ssntYr) {

        int year = ssntYr > 0 ? ssntYr : LocalDate.now().getYear();
        SseEmitter emitter = new SseEmitter(300_000L); // 5분 타임아웃

        executor.execute(() -> gameStartService.start(tmId, year, emitter));

        return emitter;
    }
}
