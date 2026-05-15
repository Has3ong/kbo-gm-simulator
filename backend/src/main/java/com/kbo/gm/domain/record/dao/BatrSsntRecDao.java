package com.kbo.gm.domain.record.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BatrSsntRecDao {
    private Long plrId;     // 선수 ID
    private String plrNm;   // 선수 한국어 이름
    private Long tmId;      // 팀 ID
    private String tmKrNm;  // 팀 한국어 이름
    private Integer ssntYr; // 시즌 연도
    private Integer pa;     // 타석 (Plate Appearance)
    private Integer ab;     // 타수 (At Bat) — 타석에서 볼넷·사구·희생번트·희생플라이 제외
    private Integer h;      // 안타 (Hit)
    private Integer dobl;   // 2루타 (Double)
    private Integer trpl;   // 3루타 (Triple)
    private Integer hr;     // 홈런 (Home Run)
    private Integer rbi;    // 타점 (Run Batted In)
    private Integer r;      // 득점 (Run)
    private Integer bb;     // 볼넷 (Base on Balls)
    private Integer ibb;    // 고의사구 (Intentional Base on Balls)
    private Integer so;     // 삼진 (Strike Out)
    private Integer sb;     // 도루 (Stolen Base)
    private Integer cs;     // 도루실패 (Caught Stealing)
    private Integer hbp;    // 사구 (Hit By Pitch)
    private Integer sac;    // 희생번트 (Sacrifice Bunt)
    private Integer sf;     // 희생플라이 (Sacrifice Fly)
    private Integer gidp;   // 병살타 (Grounded Into Double Play)
    // 파생 지표 — DB에 저장하지 않고 SQL에서 계산하여 반환
    private Double ba;      // 타율 (Batting Average) = H / AB
    private Double obp;     // 출루율 (On-Base Percentage) = (H + BB + HBP) / (AB + BB + HBP + SF)
    private Double slg;     // 장타율 (Slugging Percentage) = 총루타 / AB
    private Double ops;     // OPS (On-base Plus Slugging) = OBP + SLG
}
