package com.kbo.gm.domain.dev.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FcltyCostRow {
    private String fcltyTypeCd;  // 시설 종류코드
    private Integer fromLvl;     // 현재 레벨
    private Integer toLvl;       // 업그레이드 후 레벨
    private Long upgrCost;       // 업그레이드 비용 (만원)
    private Integer upgrDays;    // 공사 기간 (일)
}
