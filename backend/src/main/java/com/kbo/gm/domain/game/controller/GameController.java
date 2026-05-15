package com.kbo.gm.domain.game.controller;

import com.kbo.gm.config.ApiResponse;
import com.kbo.gm.domain.game.dto.GameResponse;
import com.kbo.gm.domain.game.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/games")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    @GetMapping
    public ApiResponse<List<GameResponse>> getGames(
            @RequestParam(required = false) Integer ssntYr,
            @RequestParam(required = false) Integer mon,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate gameDt,
            @RequestParam(required = false) Long tmId) {
        return ApiResponse.ok(gameService.findAll(ssntYr, mon, gameDt, tmId));
    }

    @GetMapping("/{gameId}")
    public ApiResponse<GameResponse> getGame(@PathVariable Long gameId) {
        return ApiResponse.ok(gameService.findById(gameId));
    }
}
