package com.kbo.gm.domain.season.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FrgnPlrReleaseResponse {
    private String plrNm;
    private Long plrAnslSal;   // 해지된 선수 연봉 (만원)
    private String releaseDt;  // 방출일
    private int remainingFrgnSlots; // 남은 외국인 선수 슬롯
}
