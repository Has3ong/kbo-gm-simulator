package com.kbo.gm.domain.staff.controller;

import com.kbo.gm.config.ApiResponse;
import com.kbo.gm.domain.staff.dto.StffAbltResponse;
import com.kbo.gm.domain.staff.dto.StffResponse;
import com.kbo.gm.domain.staff.service.StffService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staffs")
@RequiredArgsConstructor
public class StffController {

    private final StffService stffService;

    @GetMapping
    public ApiResponse<List<StffResponse>> getStaffs(
            @RequestParam(required = false) Long tmId,
            @RequestParam(required = false) String stffTypeCd) {
        return ApiResponse.ok(stffService.findAll(tmId, stffTypeCd));
    }

    @GetMapping("/{stffId}")
    public ApiResponse<StffResponse> getStaff(@PathVariable Long stffId) {
        return ApiResponse.ok(stffService.findById(stffId));
    }

    @GetMapping("/{stffId}/abilities")
    public ApiResponse<List<StffAbltResponse>> getAbilities(@PathVariable Long stffId) {
        return ApiResponse.ok(stffService.findAbilities(stffId));
    }
}
