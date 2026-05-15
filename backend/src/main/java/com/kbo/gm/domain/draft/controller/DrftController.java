package com.kbo.gm.domain.draft.controller;

import com.kbo.gm.config.ApiResponse;
import com.kbo.gm.domain.draft.dto.*;
import com.kbo.gm.domain.draft.service.DrftService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/draft")
@RequiredArgsConstructor
public class DrftController {

    private final DrftService drftService;

    // 드래프트 생성
    @PostMapping
    public ApiResponse<DrftResponse> create(
            @RequestParam Integer ssntYr,
            @RequestParam Long userTmId,
            @RequestParam(defaultValue = "") String drftDt) {
        LocalDate date = drftDt.isBlank() ? LocalDate.now() : LocalDate.parse(drftDt);
        return ApiResponse.ok(drftService.createDrft(ssntYr, userTmId, date));
    }

    // 드래프트 조회 (연도별)
    @GetMapping("/{ssntYr}")
    public ApiResponse<DrftResponse> getByYear(
            @PathVariable Integer ssntYr,
            @RequestParam Long userTmId) {
        return ApiResponse.ok(drftService.getByYear(ssntYr, userTmId));
    }

    // 드래프트 풀 생성 (선수 + 스카우팅 리포트 + 지명 순서 일괄 생성)
    @PostMapping("/{drftId}/generate")
    public ApiResponse<DrftResponse> generatePool(
            @PathVariable Long drftId,
            @RequestParam Long userTmId) {
        return ApiResponse.ok(drftService.generatePool(drftId, userTmId));
    }

    // 드래프트 시작 (상태 → IN_PROGRESS)
    @PostMapping("/{drftId}/start")
    public ApiResponse<DrftResponse> start(
            @PathVariable Long drftId,
            @RequestParam Long userTmId) {
        return ApiResponse.ok(drftService.startDraft(drftId, userTmId));
    }

    // 드래프트 후보 목록 조회 (스카우팅 리포트 포함)
    @GetMapping("/{drftId}/players")
    public ApiResponse<List<DrftPlrResponse>> getPlayers(
            @PathVariable Long drftId,
            @RequestParam Long tmId) {
        return ApiResponse.ok(drftService.findPlayers(drftId, tmId));
    }

    // 드래프트 후보 상세 조회
    @GetMapping("/{drftId}/players/{drftPlrId}")
    public ApiResponse<DrftPlrResponse> getPlayer(
            @PathVariable Long drftId,
            @PathVariable Long drftPlrId,
            @RequestParam Long tmId) {
        return ApiResponse.ok(drftService.findPlayer(drftId, drftPlrId, tmId));
    }

    // 지명 순서 조회
    @GetMapping("/{drftId}/order")
    public ApiResponse<List<DrftOrdResponse>> getOrder(@PathVariable Long drftId) {
        return ApiResponse.ok(drftService.findOrder(drftId));
    }

    // 유저 픽 지명
    @PostMapping("/{drftId}/pick")
    public ApiResponse<DrftOrdResponse> pick(
            @PathVariable Long drftId,
            @RequestParam Long userTmId,
            @RequestBody DrftPickRequest req) {
        return ApiResponse.ok(drftService.pick(drftId, userTmId, req));
    }

    // 유저 픽까지 AI 자동 진행
    @PostMapping("/{drftId}/simulate")
    public ApiResponse<List<DrftOrdResponse>> simulateUntilUserPick(
            @PathVariable Long drftId,
            @RequestParam Long userTmId) {
        return ApiResponse.ok(drftService.simulateUntilUserPick(drftId, userTmId));
    }

    // 드래프트 보드 조회
    @GetMapping("/{drftId}/board")
    public ApiResponse<List<DrftBoardResponse>> getBoard(
            @PathVariable Long drftId,
            @RequestParam Long tmId) {
        return ApiResponse.ok(drftService.findBoard(drftId, tmId));
    }

    // 드래프트 보드 등록/수정
    @PutMapping("/{drftId}/board/{drftPlrId}")
    public ApiResponse<Void> upsertBoard(
            @PathVariable Long drftId,
            @PathVariable Long drftPlrId,
            @RequestParam Long tmId,
            @RequestBody DrftBoardUpsertRequest req) {
        drftService.upsertBoardEntry(drftId, drftPlrId, tmId, req);
        return ApiResponse.ok(null);
    }

    // 드래프트 보드 항목 삭제
    @DeleteMapping("/{drftId}/board/{drftPlrId}")
    public ApiResponse<Void> deleteBoard(
            @PathVariable Long drftId,
            @PathVariable Long drftPlrId,
            @RequestParam Long tmId) {
        drftService.deleteBoardEntry(drftId, drftPlrId, tmId);
        return ApiResponse.ok(null);
    }
}
