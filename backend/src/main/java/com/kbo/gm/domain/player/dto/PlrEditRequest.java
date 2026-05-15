package com.kbo.gm.domain.player.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Map;

@Getter
@NoArgsConstructor
public class PlrEditRequest {
    private Integer ssntYr;                  // 피로도/컨디션 시즌연도
    private Integer fatg;                    // 피로도 (1~100)
    private Integer cond;                    // 컨디션 (1~100)
    private Integer potAblt;                 // 잠재능력치 (20~80)
    private Map<String, Integer> abilities;  // abltCd → abltVal (20~80)
    private Map<String, Integer> positions;  // posnCd → posnPrfcAblt (20~80)
}
