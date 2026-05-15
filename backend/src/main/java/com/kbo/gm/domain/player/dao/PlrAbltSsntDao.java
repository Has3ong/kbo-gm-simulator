package com.kbo.gm.domain.player.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PlrAbltSsntDao {
    private Long plrId;       // 선수 ID
    private Integer ssntYr;   // 시즌 연도 (스냅샷 기준 연도)
    private String abltCd;    // 능력치 코드 (CNT: 타격, PWR: 파워, CTL: 제구 등)
    private String abltNm;    // 능력치 한국어 이름
    private Integer abltVal;  // 능력치 값 (20~80 스케일, 50이 KBO 평균)
    private String abltGrade; // 능력치 등급 (S+/S/S-/A+/A/A-/B+/B/B-/C+/C/C-/D)
}
