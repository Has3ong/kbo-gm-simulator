package com.kbo.gm.domain.player.controller;

import com.kbo.gm.config.ApiResponse;
import com.kbo.gm.domain.player.dto.*;
import com.kbo.gm.domain.player.service.PlrService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@RestController
@RequestMapping("/api/players")
@RequiredArgsConstructor
public class PlrController {

    private final PlrService plrService;

    @GetMapping
    public ApiResponse<List<PlrResponse>> getPlayers(
            @RequestParam(required = false) Long tmId,
            @RequestParam(required = false) String plrSttsCd) {
        return ApiResponse.ok(plrService.findAll(tmId, plrSttsCd));
    }

    @GetMapping("/{plrId}")
    public ApiResponse<PlrResponse> getPlayer(@PathVariable Long plrId) {
        return ApiResponse.ok(plrService.findById(plrId));
    }

    @GetMapping("/{plrId}/abilities")
    public ApiResponse<List<PlrAbltResponse>> getAbilities(@PathVariable Long plrId) {
        return ApiResponse.ok(plrService.findAbilities(plrId));
    }

    @GetMapping("/{plrId}/positions")
    public ApiResponse<List<PlrPosnResponse>> getPositions(@PathVariable Long plrId) {
        return ApiResponse.ok(plrService.findPositions(plrId));
    }

    @GetMapping("/{plrId}/traits")
    public ApiResponse<List<PlrTrtResponse>> getTraits(@PathVariable Long plrId) {
        return ApiResponse.ok(plrService.findTraits(plrId));
    }

    @GetMapping("/{plrId}/contract")
    public ApiResponse<PlrCntrctResponse> getContract(@PathVariable Long plrId) {
        return ApiResponse.ok(plrService.findCurrentContract(plrId));
    }

    @GetMapping("/{plrId}/contract-history")
    public ApiResponse<List<PlrCntrctHistResponse>> getContractHistory(@PathVariable Long plrId) {
        return ApiResponse.ok(plrService.findContractHistory(plrId));
    }

    @GetMapping("/{plrId}/salary-history")
    public ApiResponse<List<PlrAnslSalHistResponse>> getSalaryHistory(@PathVariable Long plrId) {
        return ApiResponse.ok(plrService.findSalaryHistory(plrId));
    }

    @GetMapping("/{plrId}/ability-history")
    public ApiResponse<List<PlrAbltSsntResponse>> getAbilityHistory(@PathVariable Long plrId) {
        return ApiResponse.ok(plrService.findAbilityHistory(plrId));
    }

    @GetMapping("/{plrId}/season-stats/batter")
    public ApiResponse<List<PlrBatrSsntRecResponse>> getBatterSeasonStats(@PathVariable Long plrId) {
        return ApiResponse.ok(plrService.findBatterSeasonStats(plrId));
    }

    @GetMapping("/{plrId}/season-stats/pitcher")
    public ApiResponse<List<PlrPtchSsntRecResponse>> getPitcherSeasonStats(@PathVariable Long plrId) {
        return ApiResponse.ok(plrService.findPitcherSeasonStats(plrId));
    }

    @GetMapping("/{plrId}/monthly-stats/batter")
    public ApiResponse<List<PlrBatrMonRecResponse>> getBatterMonthlyStats(
            @PathVariable Long plrId,
            @RequestParam Integer ssntYr) {
        return ApiResponse.ok(plrService.findBatterMonthlyStats(plrId, ssntYr));
    }

    @GetMapping("/{plrId}/monthly-stats/pitcher")
    public ApiResponse<List<PlrPtchMonRecResponse>> getPitcherMonthlyStats(
            @PathVariable Long plrId,
            @RequestParam Integer ssntYr) {
        return ApiResponse.ok(plrService.findPitcherMonthlyStats(plrId, ssntYr));
    }

    @GetMapping("/{plrId}/ability-history/monthly")
    public ApiResponse<List<PlrAbltMonResponse>> getAbilityMonthlyHistory(
            @PathVariable Long plrId,
            @RequestParam Integer ssntYr) {
        return ApiResponse.ok(plrService.findAbilityMonthlyHistory(plrId, ssntYr));
    }

    @GetMapping("/{plrId}/hidden-abilities")
    public ApiResponse<List<PlrHideAbltResponse>> getHiddenAbilities(@PathVariable Long plrId) {
        return ApiResponse.ok(plrService.findHideAbilities(plrId));
    }

    @GetMapping("/{plrId}/fatigue-condition")
    public ApiResponse<PlrFatgCondResponse> getFatgCond(
            @PathVariable Long plrId,
            @RequestParam Integer ssntYr) {
        return ApiResponse.ok(plrService.findFatgCond(plrId, ssntYr));
    }

    @PutMapping("/{plrId}/fatigue-condition")
    public ApiResponse<Void> updateFatgCond(
            @PathVariable Long plrId,
            @RequestParam Integer ssntYr,
            @RequestParam Integer fatg,
            @RequestParam Integer cond) {
        plrService.upsertFatgCond(plrId, ssntYr, fatg, cond);
        return ApiResponse.ok(null);
    }

    @GetMapping("/{plrId}/injury-history")
    public ApiResponse<List<PlrInjryHistResponse>> getInjuryHistory(@PathVariable Long plrId) {
        return ApiResponse.ok(plrService.findInjuryHistory(plrId));
    }

    @PutMapping("/{plrId}/player-edit")
    public ApiResponse<Void> editPlayer(
            @PathVariable Long plrId,
            @RequestBody PlrEditRequest req) {
        plrService.editPlayer(plrId, req);
        return ApiResponse.ok(null);
    }
}
