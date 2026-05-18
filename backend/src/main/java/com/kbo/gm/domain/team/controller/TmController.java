package com.kbo.gm.domain.team.controller;

import com.kbo.gm.config.ApiResponse;
import com.kbo.gm.domain.season.dto.StndResponse;
import com.kbo.gm.domain.team.dto.*;
import com.kbo.gm.domain.team.service.TmService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TmController {

    private final TmService tmService;

    @GetMapping
    public ApiResponse<List<TmResponse>> getTeams() {
        return ApiResponse.ok(tmService.findAll());
    }

    @GetMapping("/{tmId}")
    public ApiResponse<TmResponse> getTeam(@PathVariable Long tmId) {
        return ApiResponse.ok(tmService.findById(tmId));
    }

    @GetMapping("/{tmId}/finance/{ssntYr}")
    public ApiResponse<TmFinanceResponse> getFinance(@PathVariable Long tmId, @PathVariable Integer ssntYr) {
        return ApiResponse.ok(tmService.findFinance(tmId, ssntYr));
    }

    @GetMapping("/{tmId}/finance-history")
    public ApiResponse<List<TmFinanceResponse>> getFinanceHistory(@PathVariable Long tmId) {
        return ApiResponse.ok(tmService.findFinanceHistory(tmId));
    }

    @GetMapping("/{tmId}/facility")
    public ApiResponse<List<TmFacilityResponse>> getFacilities(@PathVariable Long tmId) {
        return ApiResponse.ok(tmService.findFacilities(tmId));
    }

    @GetMapping("/{tmId}/facility-upgrades")
    public ApiResponse<List<TmFacilityUpgrResponse>> getFacilityUpgrades(@PathVariable Long tmId) {
        return ApiResponse.ok(tmService.findFacilityUpgrades(tmId));
    }

    @GetMapping("/{tmId}/market/{ssntYr}")
    public ApiResponse<TmMarketResponse> getMarket(@PathVariable Long tmId, @PathVariable Integer ssntYr) {
        return ApiResponse.ok(tmService.findMarket(tmId, ssntYr));
    }

    @GetMapping("/{tmId}/standings-history")
    public ApiResponse<List<StndResponse>> getStandingsHistory(@PathVariable Long tmId) {
        return ApiResponse.ok(tmService.findStandingsHistory(tmId));
    }

    @GetMapping("/{tmId}/facility-upgrade-costs")
    public ApiResponse<List<FcltyUpgrCostResponse>> getFcltyUpgrCosts(@PathVariable Long tmId) {
        return ApiResponse.ok(tmService.findFcltyUpgrCosts(tmId));
    }

    @PostMapping("/{tmId}/facility-upgrade")
    public ApiResponse<Void> upgradeFacility(@PathVariable Long tmId,
                                             @RequestBody TmFcltyUpgrRequest req) {
        tmService.upgradeFacility(tmId, req);
        return ApiResponse.ok(null);
    }

    @GetMapping("/{tmId}/stadium")
    public ApiResponse<StdmResponse> getStadium(@PathVariable Long tmId) {
        return ApiResponse.ok(tmService.findStadium(tmId));
    }

    @GetMapping("/{tmId}/stadium-expansion-history")
    public ApiResponse<List<StdmExpnResponse>> getStdmExpnHistory(@PathVariable Long tmId) {
        return ApiResponse.ok(tmService.findStdmExpnHistory(tmId));
    }

    @GetMapping("/stadium-expansion-costs")
    public ApiResponse<List<StdmExpnCostResponse>> getStdmExpnCosts() {
        return ApiResponse.ok(tmService.findStdmExpnCosts());
    }

    @PostMapping("/{tmId}/stadium-expansion")
    public ApiResponse<Void> expandStadium(@PathVariable Long tmId,
                                           @RequestBody StdmExpnRequest req) {
        tmService.expandStadium(tmId, req);
        return ApiResponse.ok(null);
    }

    @GetMapping("/{tmId}/finance-log")
    public ApiResponse<List<TmFinLogResponse>> getFinanceLog(@PathVariable Long tmId) {
        return ApiResponse.ok(tmService.findFinanceLog(tmId));
    }
}
