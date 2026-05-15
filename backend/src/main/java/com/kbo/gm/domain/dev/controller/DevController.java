package com.kbo.gm.domain.dev.controller;

import com.kbo.gm.config.ApiResponse;
import com.kbo.gm.domain.dev.dto.FcltyCostRow;
import com.kbo.gm.domain.dev.dto.FcltyCostUpdateRequest;
import com.kbo.gm.domain.dev.service.DevService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dev")
@RequiredArgsConstructor
public class DevController {

    private final DevService devService;

    /** 전체 시설 업그레이드 비용 설정 조회 */
    @GetMapping("/facility-costs")
    public ApiResponse<List<FcltyCostRow>> getFcltyCosts() {
        return ApiResponse.ok(devService.findAllFcltyCosts());
    }

    /** 시설 업그레이드 비용 일괄 수정 */
    @PutMapping("/facility-costs")
    public ApiResponse<Void> updateFcltyCosts(@RequestBody FcltyCostUpdateRequest req) {
        devService.updateFcltyCosts(req);
        return ApiResponse.ok(null);
    }
}
