package com.kbo.gm.domain.season.controller;

import com.kbo.gm.common.dto.PageResult;
import com.kbo.gm.config.ApiResponse;
import com.kbo.gm.domain.season.dto.SsntEvntResponse;
import com.kbo.gm.domain.season.dto.SsntResponse;
import com.kbo.gm.domain.season.dto.StndResponse;
import com.kbo.gm.domain.season.service.SsntService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seasons")
@RequiredArgsConstructor
public class SsntController {

    private final SsntService ssntService;

    @GetMapping
    public ApiResponse<List<SsntResponse>> getSeasons() {
        return ApiResponse.ok(ssntService.findAll());
    }

    @GetMapping("/{ssntYr}")
    public ApiResponse<SsntResponse> getSeason(@PathVariable Integer ssntYr) {
        return ApiResponse.ok(ssntService.findByYear(ssntYr));
    }

    @GetMapping("/{ssntYr}/standings")
    public ApiResponse<List<StndResponse>> getStandings(@PathVariable Integer ssntYr) {
        return ApiResponse.ok(ssntService.findStandings(ssntYr));
    }

    @PutMapping("/{ssntYr}/events/{evntId}/read")
    public ApiResponse<Void> markRead(@PathVariable Integer ssntYr, @PathVariable Long evntId) {
        ssntService.markEventRead(evntId);
        return ApiResponse.ok(null);
    }

    @GetMapping("/{ssntYr}/advance-check")
    public ApiResponse<Map<String, Object>> advanceCheck(@PathVariable Integer ssntYr) {
        return ApiResponse.ok(ssntService.checkAdvance(ssntYr));
    }

    @PostMapping("/{ssntYr}/advance")
    public ApiResponse<SsntResponse> advance(@PathVariable Integer ssntYr) {
        return ApiResponse.ok(ssntService.advanceDate(ssntYr));
    }

    @PostMapping("/{ssntYr}/advance-to-spring")
    public ApiResponse<SsntResponse> advanceToSpring(@PathVariable Integer ssntYr) {
        return ApiResponse.ok(ssntService.advanceToSpring(ssntYr));
    }

    @GetMapping("/{ssntYr}/spring-camp-growth")
    public ApiResponse<List<Map<String, Object>>> getSpringCampGrowth(@PathVariable Integer ssntYr) {
        return ApiResponse.ok(ssntService.findSpringCampGrowth(ssntYr));
    }

    @GetMapping("/{ssntYr}/season-reload")
    public ApiResponse<PageResult<SsntEvntResponse>> seasonReload(
            @PathVariable Integer ssntYr,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(ssntService.findEvents(ssntYr, null, null, page, size));
    }
}
