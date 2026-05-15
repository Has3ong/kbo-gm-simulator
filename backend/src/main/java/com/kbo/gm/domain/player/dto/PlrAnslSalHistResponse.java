package com.kbo.gm.domain.player.dto;

import com.kbo.gm.domain.player.dao.PlrAnslSalHistDao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlrAnslSalHistResponse {
    private Long plrId;      // 선수 ID
    private Integer ssntYr;  // 시즌 연도
    private Long anslSal;    // 해당 시즌 연봉 (만원)

    public static PlrAnslSalHistResponse from(PlrAnslSalHistDao dao) {
        return PlrAnslSalHistResponse.builder()
                .plrId(dao.getPlrId())
                .ssntYr(dao.getSsntYr())
                .anslSal(dao.getAnslSal())
                .build();
    }
}
