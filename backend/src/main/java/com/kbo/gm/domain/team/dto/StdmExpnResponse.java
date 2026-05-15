package com.kbo.gm.domain.team.dto;

import com.kbo.gm.domain.team.dao.StdmExpnDao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StdmExpnResponse {
    private Long expnId;
    private Long stdmId;
    private Long tmId;
    private Integer bfrSeatCnt;
    private Integer aftSeatCnt;
    private Long expnCost;
    private LocalDate expnBgngDt;
    private LocalDate expnEndDt;
    private String expnSttsCd;
    private String expnSttsNm;

    public static StdmExpnResponse from(StdmExpnDao dao) {
        return StdmExpnResponse.builder()
                .expnId(dao.getExpnId())
                .stdmId(dao.getStdmId())
                .tmId(dao.getTmId())
                .bfrSeatCnt(dao.getBfrSeatCnt())
                .aftSeatCnt(dao.getAftSeatCnt())
                .expnCost(dao.getExpnCost())
                .expnBgngDt(dao.getExpnBgngDt())
                .expnEndDt(dao.getExpnEndDt())
                .expnSttsCd(dao.getExpnSttsCd())
                .expnSttsNm(dao.getExpnSttsNm())
                .build();
    }
}
