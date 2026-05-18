package com.kbo.gm.domain.season.dao;

import lombok.*;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpringCampCfgDao {
    private String campCd;           // 캠프 코드 (DOMESTIC, JEJU, ...)
    private String campNm;           // 캠프 명칭
    private long   cost;             // 비용 (만원)
    private int    tier;             // 티어 (1~7)
    private int    growthAbltCnt;    // 성장 능력치 수
    private int    maxGrowthPerAblt; // 능력치당 최대 성장량
    private int    maxOvrlGrowth;    // 종합 능력치 최대 성장량
}
