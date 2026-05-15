package com.kbo.gm.domain.broadcast.dto;

import com.kbo.gm.domain.broadcast.dao.BrdcstSpnsrDao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrdcstSpnsrResponse {
    private String brdcstCd;   // 방송국코드
    private String brdcstNm;   // 방송국명
    private Long cntrctFee;    // 계약금 (만원)
    private Integer winBonus;  // 승리 수당 (만원/승)
    private Long postBonus;    // 포스트 수당 (만원)
    private Long ksBonus;      // 우승 수당 (만원)

    public static BrdcstSpnsrResponse from(BrdcstSpnsrDao dao) {
        return BrdcstSpnsrResponse.builder()
                .brdcstCd(dao.getBrdcstCd())
                .brdcstNm(dao.getBrdcstNm())
                .cntrctFee(dao.getCntrctFee())
                .winBonus(dao.getWinBonus())
                .postBonus(dao.getPostBonus())
                .ksBonus(dao.getKsBonus())
                .build();
    }
}
