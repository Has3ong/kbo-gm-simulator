package com.kbo.gm.domain.season.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PlrForStartDao {
    private Long plrId;        // 선수 ID
    private Long tmId;         // 소속 팀 ID
    private Integer ovrlAblt;  // 종합 능력치 (20~80)
    private String reprPosnCd; // 대표 포지션 코드 (10: 투수, 20: 포수, 21: 내야수, 22: 외야수)
    private String posnCd;     // 주 포지션 코드 (10: 선발투수, 11: 중간계투, 12: 마무리, 20: 포수 등)
}
