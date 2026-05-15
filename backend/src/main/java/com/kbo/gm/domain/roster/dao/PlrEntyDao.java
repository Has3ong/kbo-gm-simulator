package com.kbo.gm.domain.roster.dao;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlrEntyDao {
    private Long plrId;              // 선수 ID
    private Integer ssntYr;          // 시즌 연도
    private Long tmId;               // 소속 팀 ID
    private String entyLvlCd;        // 엔트리 레벨 코드 ('1' = 1군, '2' = 2군)
    private LocalDate entyDt;        // 마지막 엔트리 변경일

    // PLR 테이블에서 JOIN
    private String plrNm;            // 선수 한국어 이름
    private String plrFrgnYn;        // 외국인 선수 여부 (Y/N)
    private String plrSttsCd;        // 선수 상태 코드 (AT: 활동, INJ: 부상, RET: 은퇴)
    private String plrBatPtchHandCd; // 투타 코드
    private Integer plrOvrlAblt;     // 종합 능력치 (20~80)
    private Long plrAnslSal;         // 연봉 (만원)

    // PLR_POSN / PLR_TM_CNTRCT 에서 JOIN
    private String posnCd;           // 주 포지션 코드 (10: 선발투수, 20: 포수 등)
    private String reprPosnCd;       // 대표 포지션 코드 (10: 투수, 20: 포수, 21: 내야수, 22: 외야수)

    // PLR_FATG_COND 에서 JOIN
    private Integer fatg;            // 피로도 (1~100)
    private Integer cond;            // 컨디션 (1~100)
}
