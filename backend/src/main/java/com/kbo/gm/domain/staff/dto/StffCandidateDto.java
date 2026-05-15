package com.kbo.gm.domain.staff.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StffCandidateDto {
    private Long   candId;
    private String stffTypeCd;
    private String stffNm;
    private int    stffExpYr;
    private int    ovrlRtg;
    private long   signBonus;
    private long   anslSal;
    private List<AbltItem> abilities;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AbltItem {
        private String stffAbltCd;
        private String stffAbltNm;
        private int    stffAbltVal;
    }
}
