package com.kbo.gm.common.code;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum GameTypeCd {
    REG("REG", "정규시즌"),
    WC("WC", "와일드카드"),
    SP("SP", "준플레이오프"),
    PO("PO", "플레이오프"),
    KS("KS", "한국시리즈");

    private final String code;
    private final String krNm;
}
