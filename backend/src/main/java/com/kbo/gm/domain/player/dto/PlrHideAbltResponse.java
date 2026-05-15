package com.kbo.gm.domain.player.dto;

import com.kbo.gm.domain.player.dao.PlrHideAbltDao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlrHideAbltResponse {
    private Long plrId;
    private String hideAbltCd;
    private String hideAbltNm;
    private Integer hideAbltVal;

    public static PlrHideAbltResponse from(PlrHideAbltDao dao) {
        return PlrHideAbltResponse.builder()
                .plrId(dao.getPlrId())
                .hideAbltCd(dao.getHideAbltCd())
                .hideAbltNm(dao.getHideAbltNm())
                .hideAbltVal(dao.getHideAbltVal())
                .build();
    }
}
