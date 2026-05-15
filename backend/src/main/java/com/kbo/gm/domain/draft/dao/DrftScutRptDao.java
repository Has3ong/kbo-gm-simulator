package com.kbo.gm.domain.draft.dao;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DrftScutRptDao {
    private Long drftPlrId;    // 드래프트 선수 ID
    private Long tmId;         // 팀 ID
    private Integer estOvrlAblt; // 추정 현재 능력치
    private Integer estPotAblt;  // 추정 잠재 능력치
    private Integer estRnd;      // 예상 지명 라운드
    private Integer accrcy;      // 스카우팅 정확도 (1~10)
    private String grade;        // 평가 등급
    private String cmnt;         // 스카우트 코멘트
}
