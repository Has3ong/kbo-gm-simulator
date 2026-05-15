package com.kbo.gm.domain.player.dto;

import com.kbo.gm.util.AbilityGradeConverter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlrAbltResponse {
    private Long plrId;       // 선수 ID
    private String abltCd;    // 능력치 코드 (CNT: 타격, PWR: 파워, CTL: 제구 등)
    private String abltNm;    // 능력치 한국어 이름
    private String abltEngNm; // 능력치 영어 이름
    private Integer abltVal;  // 능력치 값 (20~80 스케일, 50이 KBO 평균)
    private String abltGrade; // 능력치 등급 (S+/S/S-/A+/.../D, AbilityGradeConverter로 계산)

    public static PlrAbltResponse withGrade(Long plrId, String abltCd, String abltNm, String abltEngNm, Integer abltVal) {
        return PlrAbltResponse.builder()
                .plrId(plrId)
                .abltCd(abltCd)
                .abltNm(abltNm)
                .abltEngNm(abltEngNm)
                .abltVal(abltVal)
                .abltGrade(abltVal != null ? AbilityGradeConverter.toGrade(abltVal) : null)
                .build();
    }

    public static PlrAbltResponse from(com.kbo.gm.domain.player.dao.PlrAbltDao dao) {
        return PlrAbltResponse.builder()
                .plrId(dao.getPlrId())
                .abltCd(dao.getAbltCd())
                .abltNm(dao.getAbltNm())
                .abltEngNm(dao.getAbltEngNm())
                .abltVal(dao.getAbltVal())
                .abltGrade(dao.getAbltVal() != null ? AbilityGradeConverter.toGrade(dao.getAbltVal()) : null)
                .build();
    }
}
