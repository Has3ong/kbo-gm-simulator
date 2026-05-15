package com.kbo.gm.domain.team.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class StdmExpnCostCfgDao {
    private Integer expnStep;    // 증축 단계
    private Integer addSeatCnt;  // 증가 좌석수
    private Long expnCost;       // 증축 비용 (만원)
    private Integer expnDays;    // 공사 기간 (일)
    private String expnDesc;     // 설명
}
