package com.kbo.gm.common.code;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum FcltyTypeCd {
    TRNG("TRNG", "훈련 시설"),
    RHLB("RHLB", "재활 시설"),
    SCTG("SCTG", "스카우팅 시설"),
    ANLY("ANLY", "분석 시설"),
    STDM("STDM", "구장 시설");

    private final String code;
    private final String krNm;
}
