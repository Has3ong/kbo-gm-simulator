package com.kbo.gm.common.code;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CntrctTypeCd {
    FA("FA", "FA 계약"),
    RC("RC", "재계약"),
    NK("NK", "신인 계약"),
    FR("FR", "외국인 계약");

    private final String code;
    private final String krNm;
}
