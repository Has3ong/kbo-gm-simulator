package com.kbo.gm.domain.player.dto;

import com.kbo.gm.domain.player.dao.PlrInjryHistDao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlrInjryHistResponse {
    private Long evntId;
    private Integer ssntYr;
    private LocalDate evntDt;
    private String evntTypeCd;
    private String evntTtlt;
    private String evntCnts;

    public static PlrInjryHistResponse from(PlrInjryHistDao dao) {
        return PlrInjryHistResponse.builder()
                .evntId(dao.getEvntId())
                .ssntYr(dao.getSsntYr())
                .evntDt(dao.getEvntDt())
                .evntTypeCd(dao.getEvntTypeCd())
                .evntTtlt(dao.getEvntTtlt())
                .evntCnts(dao.getEvntCnts())
                .build();
    }
}
