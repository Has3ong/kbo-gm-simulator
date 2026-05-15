package com.kbo.gm.domain.broadcast.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BrdcstSpnsrDao {
    private String brdcstCd;   // 방송국코드 (SBS/KBS/MBC)
    private String brdcstNm;   // 방송국명
    private Long cntrctFee;    // 계약금 (만원)
    private Integer winBonus;  // 경기 승리 수당 (만원/승)
    private Long postBonus;    // 포스트시즌 진출 수당 (만원)
    private Long ksBonus;      // 한국시리즈 우승 수당 (만원)
}
