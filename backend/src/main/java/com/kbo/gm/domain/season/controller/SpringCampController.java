package com.kbo.gm.domain.season.controller;

import com.kbo.gm.config.ApiResponse;
import com.kbo.gm.domain.season.service.SpringCampService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/spring-camp")
@RequiredArgsConstructor
public class SpringCampController {

    private final SpringCampService springCampService;

    @GetMapping("/locations")
    public ApiResponse<List<Map<String, Object>>> getLocations() {
        return ApiResponse.ok(springCampService.getLocations());
    }

    @PostMapping("/select")
    public ApiResponse<Void> selectCamp(@RequestParam String locationCode) {
        springCampService.selectCamp(locationCode);
        return ApiResponse.ok(null);
    }
}
