package com.kbo.gm.domain.broadcast.controller;

import com.kbo.gm.config.ApiResponse;
import com.kbo.gm.domain.broadcast.dto.BrdcstSpnsrResponse;
import com.kbo.gm.domain.broadcast.service.BrdcstSpnsrService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/broadcast-sponsors")
@RequiredArgsConstructor
public class BrdcstSpnsrController {

    private final BrdcstSpnsrService service;

    @GetMapping
    public ApiResponse<List<BrdcstSpnsrResponse>> getAll() {
        return ApiResponse.ok(service.findAll());
    }

    @GetMapping("/current")
    public ApiResponse<BrdcstSpnsrResponse> getCurrent() {
        return ApiResponse.ok(service.findSelected());
    }

    @PostMapping("/select")
    public ApiResponse<Void> select(@RequestBody Map<String, String> body) {
        service.select(body.get("brdcstCd"));
        return ApiResponse.ok(null);
    }

    @DeleteMapping("/current")
    public ApiResponse<Void> deleteCurrent() {
        service.deleteSelection();
        return ApiResponse.ok(null);
    }
}
