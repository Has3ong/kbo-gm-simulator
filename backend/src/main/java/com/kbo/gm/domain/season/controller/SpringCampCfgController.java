package com.kbo.gm.domain.season.controller;

import com.kbo.gm.config.ApiResponse;
import com.kbo.gm.domain.season.dao.SpringCampCfgDao;
import com.kbo.gm.domain.season.service.SpringCampCfgService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/spring-camp-cfg")
@RequiredArgsConstructor
public class SpringCampCfgController {

    private final SpringCampCfgService springCampCfgService;

    @GetMapping
    public ApiResponse<List<SpringCampCfgDao>> getAll() {
        return ApiResponse.ok(springCampCfgService.findAll());
    }

    @PutMapping("/{campCd}")
    public ApiResponse<Void> update(
            @PathVariable String campCd,
            @RequestBody SpringCampCfgDao req) {
        springCampCfgService.update(new SpringCampCfgDao(
            campCd, req.getCampNm(), req.getCost(), req.getTier(),
            req.getGrowthAbltCnt(), req.getMaxGrowthPerAblt(), req.getMaxOvrlGrowth()));
        return ApiResponse.ok(null);
    }
}
