package com.kbo.gm.domain.player.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PlrPtchSsntRecDao {
    private Long plrId;      // 선수 ID
    private Integer ssntYr;  // 시즌 연도
    private Long tmId;            // 소속 팀 ID
    private String tmKrNm;        // 소속 팀 한국어 이름
    private String tmShrtEngNm;   // 소속 팀 영문 약칭
    private Integer g;            // 등판 경기 수
    private Integer gs;      // 선발 등판 수 (Games Started)
    private Integer ipOut;   // 투구 아웃카운트 (실제 이닝 × 3, 예: 9이닝=27)
    private Integer h;       // 피안타 (Hits Allowed)
    private Integer hr;      // 피홈런 (Home Runs Allowed)
    private Integer r;       // 실점 (Runs Allowed)
    private Integer er;      // 자책점 (Earned Runs)
    private Integer bb;      // 허용 볼넷 (Walks Allowed)
    private Integer so;      // 탈삼진 (Strikeouts)
    private Integer w;       // 승 (Wins)
    private Integer l;       // 패 (Losses)
    private Integer sv;      // 세이브 (Saves)
    private Integer hld;     // 홀드 (Holds)
    private Double era;      // 평균자책점 = ER × 9 / IP (소수 2자리)
    private Double whip;     // WHIP = (BB + H) / IP (소수 2자리)
}
