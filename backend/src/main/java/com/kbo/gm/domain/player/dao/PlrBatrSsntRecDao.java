package com.kbo.gm.domain.player.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PlrBatrSsntRecDao {
    private Long plrId;      // 선수 ID
    private Integer ssntYr;  // 시즌 연도
    private Long tmId;            // 소속 팀 ID
    private String tmKrNm;        // 소속 팀 한국어 이름
    private String tmShrtEngNm;   // 소속 팀 영문 약칭
    private Integer g;            // 출전 경기 수
    private Integer pa;      // 타석 수 (Plate Appearances)
    private Integer ab;      // 타수 (At Bats, 타석 중 볼넷·사구·희생 제외)
    private Integer h;       // 안타 (Hits)
    private Integer dobl;    // 2루타 (Doubles)
    private Integer trpl;    // 3루타 (Triples)
    private Integer hr;      // 홈런 (Home Runs)
    private Integer rbi;     // 타점 (Runs Batted In)
    private Integer r;       // 득점 (Runs Scored)
    private Integer bb;      // 볼넷 (Bases on Balls/Walks)
    private Integer so;      // 삼진 (Strikeouts)
    private Integer sb;      // 도루 성공 (Stolen Bases)
    private Integer cs;      // 도루 실패 (Caught Stealing)
    private Integer hbp;     // 사구 (Hit By Pitch)
    private Double ba;       // 타율 = H / AB (소수 3자리)
    private Double obp;      // 출루율 = (H+BB+HBP) / (AB+BB+HBP+SF) (소수 3자리)
    private Double slg;      // 장타율 = 루타 / AB (소수 3자리)
    private Double ops;      // OPS = OBP + SLG (소수 3자리)
}
