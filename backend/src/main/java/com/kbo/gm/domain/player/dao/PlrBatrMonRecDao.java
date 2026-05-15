package com.kbo.gm.domain.player.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PlrBatrMonRecDao {
    private Long plrId;      // 선수 ID
    private Integer ssntYr;  // 시즌 연도
    private Integer mon;     // 월 (4~10)
    private Long tmId;       // 소속 팀 ID
    private String tmKrNm;   // 소속 팀 한국어 이름
    private Integer g;       // 출전 경기 수
    private Integer pa;      // 타석 수
    private Integer ab;      // 타수
    private Integer h;       // 안타
    private Integer hr;      // 홈런
    private Integer rbi;     // 타점
    private Integer bb;      // 볼넷
    private Integer so;      // 삼진
    private Integer sb;      // 도루 성공
    private Double ba;       // 타율 (소수 3자리)
    private Double obp;      // 출루율 (소수 3자리)
    private Double slg;      // 장타율 (소수 3자리)
    private Double ops;      // OPS = OBP + SLG (소수 3자리)
}
