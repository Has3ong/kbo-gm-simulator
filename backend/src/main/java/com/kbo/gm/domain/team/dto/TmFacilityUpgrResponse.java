package com.kbo.gm.domain.team.dto;

import com.kbo.gm.domain.team.dao.TmFacilityUpgrDao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TmFacilityUpgrResponse {
    private Long upgrId;
    private Long tmId;
    private String fcltyTypeCd;
    private String fcltyTypeNm;
    private Integer fromLvl;
    private Integer toLvl;
    private Long upgrCost;
    private LocalDate upgrBgngDt;
    private LocalDate upgrEndDt;
    private String upgrSttsCd;

    public static TmFacilityUpgrResponse from(TmFacilityUpgrDao dao) {
        return TmFacilityUpgrResponse.builder()
                .upgrId(dao.getUpgrId())
                .tmId(dao.getTmId())
                .fcltyTypeCd(dao.getFcltyTypeCd())
                .fcltyTypeNm(dao.getFcltyTypeNm())
                .fromLvl(dao.getFromLvl())
                .toLvl(dao.getToLvl())
                .upgrCost(dao.getUpgrCost())
                .upgrBgngDt(dao.getUpgrBgngDt())
                .upgrEndDt(dao.getUpgrEndDt())
                .upgrSttsCd(dao.getUpgrSttsCd())
                .build();
    }
}
