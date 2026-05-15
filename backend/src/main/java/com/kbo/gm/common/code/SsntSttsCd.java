package com.kbo.gm.common.code;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SsntSttsCd {
    PRE("PRE", "프리시즌"),
    REG("REG", "정규시즌"),
    POST("POST", "포스트시즌"),
    OFF("OFF", "오프시즌"),
    CMPL("CMPL", "완료");

    private final String code;
    private final String krNm;
}
