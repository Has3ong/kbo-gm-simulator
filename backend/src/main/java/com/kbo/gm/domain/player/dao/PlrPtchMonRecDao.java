package com.kbo.gm.domain.player.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PlrPtchMonRecDao {
    private Long plrId;      // 선수 ID
    private Integer ssntYr;  // 시즌 연도
    private Integer mon;     // 월 (4~10)
    private Long tmId;       // 소속 팀 ID
    private String tmKrNm;   // 소속 팀 한국어 이름
    private Integer g;       // 등판 경기 수
    private Integer gs;      // 선발 등판 수
    private Integer ipOut;   // 투구 아웃카운트
    private Integer h;       // 피안타
    private Integer hr;      // 피홈런
    private Integer r;       // 실점
    private Integer er;      // 자책점
    private Integer bb;      // 허용 볼넷
    private Integer so;      // 탈삼진
    private Integer w;       // 승
    private Integer l;       // 패
    private Integer sv;      // 세이브
    private Integer hld;     // 홀드
    private Double era;      // 평균자책점 (소수 2자리)
    private Double whip;     // WHIP (소수 2자리)
}
