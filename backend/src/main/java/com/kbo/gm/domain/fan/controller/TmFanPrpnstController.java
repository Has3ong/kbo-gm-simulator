package com.kbo.gm.domain.fan.controller;

import com.kbo.gm.config.ApiResponse;
import com.kbo.gm.domain.fan.dto.TmFanPrpnstRequest;
import com.kbo.gm.domain.fan.dto.TmFanPrpnstResponse;
import com.kbo.gm.domain.fan.service.TmFanPrpnstService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fan-prpnst")
@RequiredArgsConstructor
public class TmFanPrpnstController {

    private final TmFanPrpnstService service;

    @GetMapping
    public ApiResponse<List<TmFanPrpnstResponse>> getAll() {
        return ApiResponse.ok(service.findAll());
    }

    @GetMapping("/{tmId}")
    public ApiResponse<TmFanPrpnstResponse> getByTmId(@PathVariable Long tmId) {
        return ApiResponse.ok(service.findByTmId(tmId));
    }

    @PutMapping("/{tmId}")
    public ApiResponse<Void> upsert(@PathVariable Long tmId,
                                    @RequestBody TmFanPrpnstRequest req) {
        service.upsert(tmId, req);
        return ApiResponse.ok(null);
    }
}
