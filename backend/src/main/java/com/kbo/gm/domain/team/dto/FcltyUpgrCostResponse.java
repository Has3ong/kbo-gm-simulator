package com.kbo.gm.domain.team.dto;

import com.kbo.gm.domain.team.dao.FcltyUpgrCostCfgDao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FcltyUpgrCostResponse {
    private String fcltyTypeCd;  // 시설 종류코드
    private String fcltyTypeNm;  // 시설 한글명
    private String fcltyDesc;    // 효과 설명
    private Integer fromLvl;     // 현재 레벨
    private Integer toLvl;       // 업그레이드 후 레벨
    private Long upgrCost;       // 비용 (만원)
    private Integer upgrDays;    // 공사 기간 (일)
    private Boolean maxLevel;    // 최고 레벨 여부

    public static FcltyUpgrCostResponse from(FcltyUpgrCostCfgDao dao) {
        return FcltyUpgrCostResponse.builder()
                .fcltyTypeCd(dao.getFcltyTypeCd())
                .fcltyTypeNm(dao.getFcltyTypeNm())
                .fcltyDesc(dao.getFcltyDesc())
                .fromLvl(dao.getFromLvl())
                .toLvl(dao.getToLvl())
                .upgrCost(dao.getUpgrCost())
                .upgrDays(dao.getUpgrDays())
                .maxLevel(false)
                .build();
    }

    public static FcltyUpgrCostResponse maxLevel(String fcltyTypeCd, String fcltyTypeNm, String fcltyDesc, int currentLvl) {
        return FcltyUpgrCostResponse.builder()
                .fcltyTypeCd(fcltyTypeCd)
                .fcltyTypeNm(fcltyTypeNm)
                .fcltyDesc(fcltyDesc)
                .fromLvl(currentLvl)
                .toLvl(currentLvl)
                .maxLevel(true)
                .build();
    }
}
