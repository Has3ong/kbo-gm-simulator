package com.kbo.gm.domain.season.controller;

import com.kbo.gm.config.ApiResponse;
import com.kbo.gm.domain.season.dto.RosterConfirmRequest;
import com.kbo.gm.domain.season.service.RosterConfirmService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/roster-confirm")
@RequiredArgsConstructor
public class RosterConfirmController {

    private final RosterConfirmService rosterConfirmService;

    /**
     * 유저 팀 선수 전체 목록 및 현재 라인업/로테이션/불펜 조회.
     * GET /api/roster-confirm/roster-data
     */
    @GetMapping("/roster-data")
    public ApiResponse<Map<String, Object>> getRosterData() {
        return ApiResponse.ok(rosterConfirmService.getRosterData());
    }

    /**
     * 1군 로스터 확정 처리.
     * POST /api/roster-confirm/confirm
     */
    @PostMapping("/confirm")
    public ApiResponse<Void> confirmRoster(@RequestBody RosterConfirmRequest req) {
        rosterConfirmService.confirmRoster(req);
        return ApiResponse.ok(null);
    }

    /**
     * 로스터 편집 가능 여부 조회.
     * GET /api/roster-confirm/can-edit
     */
    @GetMapping("/can-edit")
    public ApiResponse<Map<String, Object>> canEdit() {
        return ApiResponse.ok(Map.of("canEdit", true));
    }

    /**
     * 외국인 선수 2군 강등 처리 (외국인 초과 시 해소용).
     * POST /api/roster-confirm/release-foreign?plrId={id}
     */
    @PostMapping("/release-foreign")
    public ApiResponse<Void> releaseForeign(@RequestParam long plrId) {
        rosterConfirmService.releaseForeign(plrId);
        return ApiResponse.ok(null);
    }
}
