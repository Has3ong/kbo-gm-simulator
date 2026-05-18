package com.kbo.gm.common.controller;

import com.kbo.gm.common.entity.CmnCd;
import com.kbo.gm.common.service.CmnCdService;
import com.kbo.gm.config.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/common/codes")
@RequiredArgsConstructor
public class CmnCdController {

    private final CmnCdService cmnCdService;

    @GetMapping
    public ApiResponse<List<CmnCd>> getAllCodes() {
        return ApiResponse.ok(cmnCdService.findAll());
    }

    @GetMapping("/{cdId}")
    public ApiResponse<List<CmnCd>> getCodes(@PathVariable String cdId) {
        return ApiResponse.ok(cmnCdService.findByCdId(cdId));
    }

    @GetMapping("/{cdId}/{cdVal}")
    public ApiResponse<CmnCd> getCode(@PathVariable String cdId, @PathVariable String cdVal) {
        return ApiResponse.ok(cmnCdService.findByCdIdAndCdVal(cdId, cdVal));
    }

    @PutMapping("/{cdId}/{cdVal}")
    public ApiResponse<Void> updateCode(
            @PathVariable String cdId,
            @PathVariable String cdVal,
            @RequestBody Map<String, String> body) {
        cmnCdService.updateCode(cdId, cdVal,
                body.get("cdNm"), body.get("cdEngNm"), body.get("cdDesc"));
        return ApiResponse.ok(null);
    }

    @PostMapping
    public ApiResponse<Void> createCode(@RequestBody CmnCd code) {
        cmnCdService.insertCode(code);
        return ApiResponse.ok(null);
    }

    @DeleteMapping("/{cdId}/{cdVal}")
    public ApiResponse<Void> deleteCode(
            @PathVariable String cdId,
            @PathVariable String cdVal) {
        cmnCdService.deleteCode(cdId, cdVal);
        return ApiResponse.ok(null);
    }
}
