package com.kbo.gm.domain.season.controller;

import com.kbo.gm.config.ApiResponse;
import com.kbo.gm.domain.season.service.FrgnPlrService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/frgn-plr")
@RequiredArgsConstructor
public class FrgnPlrController {

    private final FrgnPlrService frgnPlrService;

    @GetMapping("/candidates")
    public ApiResponse<List<Map<String, Object>>> getCandidates(@RequestParam int ssntYr) {
        return ApiResponse.ok(frgnPlrService.getCandidates(ssntYr));
    }

    @PostMapping("/offer")
    public ApiResponse<Void> makeOffer(@RequestParam long candId,
                                       @RequestParam int ssntYr,
                                       @RequestParam long offerSal) {
        frgnPlrService.makeOffer(candId, ssntYr, offerSal);
        return ApiResponse.ok(null);
    }

    @GetMapping("/signed-info")
    public ApiResponse<Map<String, Object>> getSignedInfo(@RequestParam int ssntYr) {
        return ApiResponse.ok(frgnPlrService.getSignedInfo(ssntYr));
    }

    @PostMapping("/stop")
    public ApiResponse<Void> stop(@RequestParam int ssntYr) {
        frgnPlrService.stopSigningPhase(ssntYr);
        return ApiResponse.ok(null);
    }
}
