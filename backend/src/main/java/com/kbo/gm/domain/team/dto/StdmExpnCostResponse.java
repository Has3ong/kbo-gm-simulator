package com.kbo.gm.domain.team.dto;

import com.kbo.gm.domain.team.dao.StdmExpnCostCfgDao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StdmExpnCostResponse {
    private Integer expnStep;
    private Integer addSeatCnt;
    private Long expnCost;
    private Integer expnDays;
    private String expnDesc;

    public static StdmExpnCostResponse from(StdmExpnCostCfgDao dao) {
        return StdmExpnCostResponse.builder()
                .expnStep(dao.getExpnStep())
                .addSeatCnt(dao.getAddSeatCnt())
                .expnCost(dao.getExpnCost())
                .expnDays(dao.getExpnDays())
                .expnDesc(dao.getExpnDesc())
                .build();
    }
}
