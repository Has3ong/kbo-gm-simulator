package com.kbo.gm.domain.roster.controller;

import com.kbo.gm.config.ApiResponse;
import com.kbo.gm.domain.roster.dto.RstrMoveRequest;
import com.kbo.gm.domain.roster.dto.RstrResponse;
import com.kbo.gm.domain.roster.service.RstrService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roster")
@RequiredArgsConstructor
public class RstrController {

    private final RstrService rstrService;

    // 전체 로스터 조회 (1군 + 2군)
    @GetMapping("/{tmId}")
    public ApiResponse<List<RstrResponse>> getRoster(
            @PathVariable Long tmId,
            @RequestParam Integer ssntYr) {
        return ApiResponse.ok(rstrService.getRoster(tmId, ssntYr));
    }

    // 1군 엔트리 조회 (28인)
    @GetMapping("/{tmId}/entry")
    public ApiResponse<List<RstrResponse>> getEntry(
            @PathVariable Long tmId,
            @RequestParam Integer ssntYr) {
        return ApiResponse.ok(rstrService.getEntry(tmId, ssntYr));
    }

    // 콜업 (2군 → 1군)
    @PostMapping("/{tmId}/callup")
    public ApiResponse<RstrResponse> callup(
            @PathVariable Long tmId,
            @RequestBody RstrMoveRequest req) {
        return ApiResponse.ok(rstrService.callup(tmId, req));
    }

    // 말소 (1군 → 2군)
    @PostMapping("/{tmId}/option")
    public ApiResponse<RstrResponse> option(
            @PathVariable Long tmId,
            @RequestBody RstrMoveRequest req) {
        return ApiResponse.ok(rstrService.option(tmId, req));
    }

    // 시즌 로스터 초기화 (전원 2군 등록)
    @PostMapping("/{tmId}/init")
    public ApiResponse<Void> init(
            @PathVariable Long tmId,
            @RequestParam Integer ssntYr) {
        rstrService.initRoster(tmId, ssntYr);
        return ApiResponse.ok(null);
    }
}
