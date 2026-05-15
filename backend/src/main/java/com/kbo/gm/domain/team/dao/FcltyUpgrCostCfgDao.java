package com.kbo.gm.domain.team.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class FcltyUpgrCostCfgDao {
    private String fcltyTypeCd;  // 시설 종류코드
    private String fcltyTypeNm;  // 시설 한글명
    private String fcltyDesc;    // 시설 효과 설명
    private Integer fromLvl;     // 현재 레벨
    private Integer toLvl;       // 업그레이드 후 레벨
    private Long upgrCost;       // 업그레이드 비용 (만원)
    private Integer upgrDays;    // 공사 기간 (일)
}
