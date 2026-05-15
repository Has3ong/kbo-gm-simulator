package com.kbo.gm.domain.player.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PlrAbltDao {
    private Long plrId;       // 선수 ID
    private String abltCd;    // 능력치 코드 (CNT: 타격, PWR: 파워, CTL: 제구 등)
    private String abltNm;    // 능력치 한국어 이름
    private String abltEngNm; // 능력치 영어 이름
    private Integer abltVal;  // 능력치 값 (20~80 스케일, 50이 KBO 평균)
}
