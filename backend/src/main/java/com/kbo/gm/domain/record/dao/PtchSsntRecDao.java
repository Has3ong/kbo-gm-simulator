package com.kbo.gm.domain.record.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PtchSsntRecDao {
    private Long plrId;     // 선수 ID
    private String plrNm;   // 선수 한국어 이름
    private Long tmId;      // 팀 ID
    private String tmKrNm;  // 팀 한국어 이름
    private Integer ssntYr; // 시즌 연도
    private Integer ipOut;  // 투구 아웃카운트 (3 = 1이닝, Innings Pitched × 3)
    private Integer bf;     // 상대 타자 수 (Batters Faced)
    private Integer h;      // 피안타 (Hits Allowed)
    private Integer dobl;   // 피2루타 (Doubles Allowed)
    private Integer trpl;   // 피3루타 (Triples Allowed)
    private Integer hr;     // 피홈런 (Home Runs Allowed)
    private Integer r;      // 실점 (Runs Allowed)
    private Integer er;     // 자책점 (Earned Runs)
    private Integer bb;     // 볼넷 (Walks)
    private Integer ibb;    // 고의사구 (Intentional Walks)
    private Integer so;     // 탈삼진 (Strikeouts)
    private Integer hbp;    // 사구 (Hit By Pitch)
    private Integer w;      // 승 (Wins)
    private Integer l;      // 패 (Losses)
    private Integer sv;     // 세이브 (Saves)
    private Integer hld;    // 홀드 (Holds)
    private Integer bsv;    // 블론세이브 (Blown Saves)
    private Integer cg;     // 완투 (Complete Games)
    private Integer sho;    // 완봉 (Shutouts)
    private Integer pitches; // 총 투구수
    // 파생 지표 — DB에 저장하지 않고 SQL에서 계산하여 반환
    private Double era;     // 평균자책점 (ERA) = ER × 27 / IP_OUT
    private Double whip;    // 이닝당 출루허용 (WHIP) = (BB + H) × 3 / IP_OUT
    private Double kPer9;   // 9이닝당 탈삼진 (K/9) = SO × 27 / IP_OUT
    private Double bbPer9;  // 9이닝당 볼넷 (BB/9) = BB × 27 / IP_OUT
}
