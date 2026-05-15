package com.kbo.gm.domain.player.dto;

import com.kbo.gm.domain.player.dao.PlrCntrctHistDao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlrCntrctHistResponse {
    private Long plrId;              // 선수 ID
    private Long tmId;               // 계약 팀 ID
    private String tmKrNm;           // 계약 팀 한국어 이름
    private Integer histSeq;         // 이력 순번
    private LocalDate histDt;        // 이력 기록 일자
    private LocalDate faCntrctBgngDt; // FA 계약 시작일
    private LocalDate faCntrctEndDt;  // FA 계약 종료일
    private Long faAmt;              // FA 계약 총액 (만원)
    private String reprPosnCd;       // 계약 시 대표 포지션 코드
    private String cntrctTypeCd;     // 계약 유형 코드
    private String cntrctTypeNm;     // 계약 유형 한국어 이름

    public static PlrCntrctHistResponse from(PlrCntrctHistDao dao) {
        return PlrCntrctHistResponse.builder()
                .plrId(dao.getPlrId())
                .tmId(dao.getTmId())
                .tmKrNm(dao.getTmKrNm())
                .histSeq(dao.getHistSeq())
                .histDt(dao.getHistDt())
                .faCntrctBgngDt(dao.getFaCntrctBgngDt())
                .faCntrctEndDt(dao.getFaCntrctEndDt())
                .faAmt(dao.getFaAmt())
                .reprPosnCd(dao.getReprPosnCd())
                .cntrctTypeCd(dao.getCntrctTypeCd())
                .cntrctTypeNm(dao.getCntrctTypeNm())
                .build();
    }
}
