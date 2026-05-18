package com.kbo.gm.domain.roster.dto;

import com.kbo.gm.domain.roster.dao.PlrEntyDao;
import com.kbo.gm.util.AbilityGradeConverter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RstrResponse {
    private Long plrId;
    private String plrNm;
    private String plrFrgnYn;
    private String plrSttsCd;
    private String plrBatPtchHandCd;
    private Integer plrOvrlAblt;
    private String ovrlGrade;
    private Long plrAnslSal;
    private String posnCd;
    private String reprPosnCd;
    private String entyLvlCd;
    private LocalDate entyDt;
    private Integer fatg; // 피로도 (1~100, null=데이터 없음)
    private Integer cond; // 컨디션 (1~100, null=데이터 없음)

    // 능력치 (PLR_ABLT 서브쿼리)
    private Integer vel; // 구속 (투수)
    private Integer ctl; // 제구 (투수)
    private Integer brk; // 변화구 (투수)
    private Integer cnt; // 컨택 (야수)
    private Integer pwr; // 파워 (야수)
    private Integer run; // 주루 (야수)
    private Integer thr; // 송구 (야수)
    private Integer stl; // 도루 (야수)

    public static RstrResponse from(PlrEntyDao dao) {
        return RstrResponse.builder()
                .plrId(dao.getPlrId())
                .plrNm(dao.getPlrNm())
                .plrFrgnYn(dao.getPlrFrgnYn())
                .plrSttsCd(dao.getPlrSttsCd())
                .plrBatPtchHandCd(dao.getPlrBatPtchHandCd())
                .plrOvrlAblt(dao.getPlrOvrlAblt())
                .ovrlGrade(dao.getPlrOvrlAblt() != null
                        ? AbilityGradeConverter.toGrade(dao.getPlrOvrlAblt()) : null)
                .plrAnslSal(dao.getPlrAnslSal())
                .posnCd(dao.getPosnCd())
                .reprPosnCd(dao.getReprPosnCd())
                .entyLvlCd(dao.getEntyLvlCd())
                .entyDt(dao.getEntyDt())
                .fatg(dao.getFatg())
                .cond(dao.getCond())
                .vel(dao.getVel())
                .ctl(dao.getCtl())
                .brk(dao.getBrk())
                .cnt(dao.getCnt())
                .pwr(dao.getPwr())
                .run(dao.getRun())
                .thr(dao.getThr())
                .stl(dao.getStl())
                .build();
    }
}
