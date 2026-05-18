package com.kbo.gm.domain.codes;

import com.kbo.gm.common.code.HideAbltCode;
import com.kbo.gm.common.code.PlrTrtCode;
import com.kbo.gm.common.code.StffTypeCode;
import com.kbo.gm.config.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@RestController
@RequestMapping("/api/codes")
public class CodesController {

    @GetMapping("/hide-ablt-types")
    public ApiResponse<List<Map<String, String>>> getHideAbltTypes() {
        return ApiResponse.ok(
            Stream.of(HideAbltCode.values())
                .map(c -> Map.of("code", c.getCode(), "krNm", c.getKrNm(), "engNm", c.getEngNm(), "desc", c.getDesc()))
                .collect(Collectors.toList())
        );
    }

    @GetMapping("/plr-trt-types")
    public ApiResponse<List<Map<String, String>>> getPlrTrtTypes() {
        return ApiResponse.ok(
            Stream.of(PlrTrtCode.values())
                .map(c -> Map.of("code", c.getCode(), "krNm", c.getKrNm(), "engNm", c.getEngNm(), "desc", c.getDesc()))
                .collect(Collectors.toList())
        );
    }

    @GetMapping("/stff-types")
    public ApiResponse<List<Map<String, String>>> getStffTypes() {
        return ApiResponse.ok(
            Stream.of(StffTypeCode.values())
                .map(c -> Map.of("code", c.getCode(), "krNm", c.getKrNm(), "engNm", c.getEngNm(), "desc", c.getDesc()))
                .collect(Collectors.toList())
        );
    }
}
