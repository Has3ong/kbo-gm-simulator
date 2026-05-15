package com.kbo.gm.domain.player.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PlrAbltMonDao {
    private Long plrId;       // 선수 ID
    private Integer ssntYr;   // 시즌 연도
    private Integer mon;      // 월 (1~12)
    private String abltCd;    // 능력치 코드
    private String abltNm;    // 능력치 한국어 이름
    private Integer abltVal;  // 능력치 값 (20~80)
    private String abltGrade; // 능력치 등급
}
