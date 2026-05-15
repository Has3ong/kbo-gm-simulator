package com.kbo.gm.domain.season.controller;

import com.kbo.gm.domain.season.service.AdvanceWeekService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/api/game")
@RequiredArgsConstructor
public class AdvanceWeekController {

    private final AdvanceWeekService advanceWeekService;

    @GetMapping(value = "/advance-week", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter advanceWeek(@RequestParam int ssntYr) {
        SseEmitter emitter = new SseEmitter(600_000L); // 10분
        new Thread(() -> advanceWeekService.advanceToNextMonday(ssntYr, emitter)).start();
        return emitter;
    }
}
