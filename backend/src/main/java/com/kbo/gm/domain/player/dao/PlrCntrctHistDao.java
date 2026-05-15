package com.kbo.gm.domain.player.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PlrCntrctHistDao {
    private Long plrId;              // 선수 ID
    private Long tmId;               // 계약 팀 ID
    private String tmKrNm;           // 계약 팀 한국어 이름
    private Integer histSeq;         // 이력 순번 (같은 선수 내 순서)
    private LocalDate histDt;        // 이력 기록 일자
    private LocalDate faCntrctBgngDt; // FA 계약 시작일
    private LocalDate faCntrctEndDt;  // FA 계약 종료일
    private Long faAmt;              // FA 계약 총액 (만원)
    private String reprPosnCd;       // 계약 시 대표 포지션 코드
    private String cntrctTypeCd;     // 계약 유형 코드 (FA: FA계약, RC: 재계약, NK: 신인, FR: 외국인)
    private String cntrctTypeNm;     // 계약 유형 한국어 이름
}
