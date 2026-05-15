package com.kbo.gm.common.code;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum StffTypeCd {
    MGR("MGR", "감독"),
    COACH("COACH", "코치"),
    SCUT("SCUT", "스카우터"),
    MED("MED", "의무·트레이너"),
    ANLY("ANLY", "분석가");

    private final String code;
    private final String krNm;
}
