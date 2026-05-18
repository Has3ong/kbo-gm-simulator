package com.kbo.gm.domain.player.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter @Builder @NoArgsConstructor @AllArgsConstructor
public class PlrGrwthLogResponse {
    private Long    plrId;
    private Integer ssntYr;
    private String  grwthDt;
    private String  grwthType;
    private String  abltCd;
    private String  abltNm;      // 능력치 한글명 (CMN_CD 조인)
    private Integer abltValBfr;
    private Integer abltValAft;
    private Integer abltDiff;    // abltValAft - abltValBfr (계산 필드)
}
