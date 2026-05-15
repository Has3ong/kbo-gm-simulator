package com.kbo.gm.domain.player.dto;

import com.kbo.gm.domain.player.dao.PlrPosnDao;
import com.kbo.gm.util.AbilityGradeConverter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlrPosnResponse {
    private Long plrId;           // 선수 ID
    private String posnCd;        // 포지션 코드 (SP: 선발투수, C: 포수, SS: 유격수 등)
    private String posnNm;        // 포지션 한국어 이름
    private Integer posnPrfcAblt; // 포지션 숙련도 능력치 (20~80, 해당 포지션 수비 적합도)
    private String posnPrfcGrade; // 포지션 숙련도 등급 (S+/S/.../D, AbilityGradeConverter로 계산)

    public static PlrPosnResponse from(PlrPosnDao dao) {
        return PlrPosnResponse.builder()
                .plrId(dao.getPlrId())
                .posnCd(dao.getPosnCd())
                .posnNm(dao.getPosnNm())
                .posnPrfcAblt(dao.getPosnPrfcAblt())
                .posnPrfcGrade(dao.getPosnPrfcAblt() != null ? AbilityGradeConverter.toGrade(dao.getPosnPrfcAblt()) : null)
                .build();
    }
}
