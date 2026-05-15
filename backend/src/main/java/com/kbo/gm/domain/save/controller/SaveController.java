package com.kbo.gm.domain.save.controller;

import com.kbo.gm.config.ApiResponse;
import com.kbo.gm.domain.save.service.SaveService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/saves")
@RequiredArgsConstructor
public class SaveController {

    private final SaveService saveService;

    @DeleteMapping("/{ssntYr}")
    public ApiResponse<Void> deleteSave(@PathVariable Integer ssntYr) {
        saveService.deleteSave(ssntYr);
        return ApiResponse.ok(null);
    }
}
