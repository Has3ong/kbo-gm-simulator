package com.kbo.gm.domain.record.controller;

import com.kbo.gm.config.ApiResponse;
import com.kbo.gm.domain.record.dto.BatrSsntRecResponse;
import com.kbo.gm.domain.record.dto.PtchSsntRecResponse;
import com.kbo.gm.domain.record.service.RecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/records")
@RequiredArgsConstructor
public class RecordController {

    private final RecordService recordService;

    @GetMapping("/batters")
    public ApiResponse<List<BatrSsntRecResponse>> getBatterStats(
            @RequestParam(required = false) Integer ssntYr,
            @RequestParam(required = false) Long tmId) {
        return ApiResponse.ok(recordService.findBatterStats(ssntYr, tmId));
    }

    @GetMapping("/pitchers")
    public ApiResponse<List<PtchSsntRecResponse>> getPitcherStats(
            @RequestParam(required = false) Integer ssntYr,
            @RequestParam(required = false) Long tmId) {
        return ApiResponse.ok(recordService.findPitcherStats(ssntYr, tmId));
    }
}
