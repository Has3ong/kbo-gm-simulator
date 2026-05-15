package com.kbo.gm.common.code;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PlrSttsCd {
    AT("AT", "활동"),
    INJ("INJ", "부상"),
    RET("RET", "은퇴"),
    FA("FA", "자유계약");

    private final String code;
    private final String krNm;
}
