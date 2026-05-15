package com.kbo.gm.domain.staff.controller;

import com.kbo.gm.config.ApiResponse;
import com.kbo.gm.domain.staff.dto.StffCandidateDto;
import com.kbo.gm.domain.staff.dto.StffHireRequestDto;
import com.kbo.gm.domain.staff.service.StffHireService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staffs")
@RequiredArgsConstructor
public class StffHireController {

    private final StffHireService stffHireService;

    /** 현재 감독/코치 조회 */
    @GetMapping("/current")
    public ApiResponse<Map<String, List<Map<String, Object>>>> getCurrentStff() {
        return ApiResponse.ok(stffHireService.getCurrentStff());
    }

    /** 선임 후보 목록 조회 */
    @GetMapping("/candidates")
    public ApiResponse<Map<String, List<StffCandidateDto>>> getCandidates() {
        return ApiResponse.ok(stffHireService.getCandidates());
    }

    /** 감독/코치 선임 */
    @PostMapping("/hire")
    public ApiResponse<Void> hire(@RequestBody StffHireRequestDto req) {
        stffHireService.hire(req);
        return ApiResponse.ok(null);
    }
}
