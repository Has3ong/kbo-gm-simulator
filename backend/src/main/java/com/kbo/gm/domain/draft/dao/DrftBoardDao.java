package com.kbo.gm.domain.draft.dao;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DrftBoardDao {
    private Long drftId;         // 드래프트 ID
    private Long drftPlrId;      // 드래프트 선수 ID
    private Long tmId;           // 팀 ID (보드 소유 팀)
    private Integer prioOrd;     // 우선순위 (낮을수록 우선, null=미분류)
    private String doNotPick;    // 지명 제외 여부 (Y/N)
    private String memo;         // 메모

    // DRFT_PLR 조인
    private String plrNm;        // 선수명
    private String posnCd;       // 주 포지션코드
    private String reprPosnCd;   // 대표 포지션코드
    private String isPickYn;     // 지명 여부

    // DRFT_SCUT_RPT 조인
    private Integer estOvrlAblt; // 추정 현재 능력치
    private Integer estPotAblt;  // 추정 잠재 능력치
    private String grade;        // 평가 등급
}
