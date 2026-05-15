package com.kbo.gm.domain.team.dto;

import com.kbo.gm.domain.team.dao.StdmDao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StdmResponse {
    private Long stdmId;
    private String stdmKrNm;
    private String stdmEngNm;
    private String stdmLoc;
    private String stdmEstblshDt;
    private Integer stdmSeatCnt;
    private Integer lfDist;
    private Integer lcfDist;
    private Integer cfDist;
    private Integer rcfDist;
    private Integer rfDist;
    private String turfTypeCd;
    private String turfTypeNm;

    public static StdmResponse from(StdmDao dao) {
        return StdmResponse.builder()
                .stdmId(dao.getStdmId())
                .stdmKrNm(dao.getStdmKrNm())
                .stdmEngNm(dao.getStdmEngNm())
                .stdmLoc(dao.getStdmLoc())
                .stdmEstblshDt(dao.getStdmEstblshDt() != null ? dao.getStdmEstblshDt() : null)
                .stdmSeatCnt(dao.getStdmSeatCnt())
                .lfDist(dao.getLfDist())
                .lcfDist(dao.getLcfDist())
                .cfDist(dao.getCfDist())
                .rcfDist(dao.getRcfDist())
                .rfDist(dao.getRfDist())
                .turfTypeCd(dao.getTurfTypeCd())
                .turfTypeNm(dao.getTurfTypeNm())
                .build();
    }
}
