package com.kbo.gm.domain.owner.controller;

import com.kbo.gm.config.ApiResponse;
import com.kbo.gm.domain.owner.dto.TmOwnPrpnstRequest;
import com.kbo.gm.domain.owner.dto.TmOwnPrpnstResponse;
import com.kbo.gm.domain.owner.service.TmOwnPrpnstService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/owner-prpnst")
@RequiredArgsConstructor
public class TmOwnPrpnstController {

    private final TmOwnPrpnstService service;

    @GetMapping
    public ApiResponse<List<TmOwnPrpnstResponse>> getAll() {
        return ApiResponse.ok(service.findAll());
    }

    @GetMapping("/{tmId}")
    public ApiResponse<TmOwnPrpnstResponse> getByTmId(@PathVariable Long tmId) {
        return ApiResponse.ok(service.findByTmId(tmId));
    }

    @PutMapping("/{tmId}")
    public ApiResponse<Void> upsert(@PathVariable Long tmId,
                                    @RequestBody TmOwnPrpnstRequest req) {
        service.upsert(tmId, req);
        return ApiResponse.ok(null);
    }
}
