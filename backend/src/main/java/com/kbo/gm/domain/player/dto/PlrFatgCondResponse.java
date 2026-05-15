package com.kbo.gm.domain.player.dto;

import com.kbo.gm.domain.player.dao.PlrFatgCondDao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlrFatgCondResponse {
    private Long plrId;
    private Integer ssntYr;
    private Integer fatg; // 피로도 (1~100)
    private Integer cond; // 컨디션 (1~100)

    public static PlrFatgCondResponse from(PlrFatgCondDao dao) {
        return PlrFatgCondResponse.builder()
                .plrId(dao.getPlrId())
                .ssntYr(dao.getSsntYr())
                .fatg(dao.getFatg())
                .cond(dao.getCond())
                .build();
    }
}
