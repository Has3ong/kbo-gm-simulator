package com.kbo.gm.domain.team.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Tm {
    private Long tmId;
    private String tmKrNm;
    private String tmEngNm;
    private String tmShrtKrNm;
    private String tmShrtEngNm;
    private LocalDate tmEstblshDt;
    private String cityCd;
    private Long stdmId;
}
