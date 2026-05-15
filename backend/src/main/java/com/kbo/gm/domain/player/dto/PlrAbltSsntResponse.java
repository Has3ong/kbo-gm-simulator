package com.kbo.gm.domain.player.dto;

import com.kbo.gm.domain.player.dao.PlrAbltSsntDao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlrAbltSsntResponse {
    private Long plrId;       // 선수 ID
    private Integer ssntYr;   // 시즌 연도
    private String abltCd;    // 능력치 코드
    private String abltNm;    // 능력치 한국어 이름
    private Integer abltVal;  // 능력치 값 (20~80)
    private String abltGrade; // 능력치 등급 (S+~D)

    public static PlrAbltSsntResponse from(PlrAbltSsntDao dao) {
        return PlrAbltSsntResponse.builder()
                .plrId(dao.getPlrId())
                .ssntYr(dao.getSsntYr())
                .abltCd(dao.getAbltCd())
                .abltNm(dao.getAbltNm())
                .abltVal(dao.getAbltVal())
                .abltGrade(dao.getAbltGrade())
                .build();
    }
}
