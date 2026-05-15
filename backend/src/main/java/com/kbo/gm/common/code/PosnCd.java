package com.kbo.gm.common.code;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PosnCd {
    SP("10", "선발투수"),
    RP("11", "중간계투"),
    CP("12", "마무리"),
    C("20", "포수"),
    FIRST_BASE("21", "1루수"),
    SECOND_BASE("22", "2루수"),
    THIRD_BASE("23", "3루수"),
    SS("24", "유격수"),
    LF("25", "좌익수"),
    CF("26", "중견수"),
    RF("27", "우익수"),
    DH("28", "지명타자");

    private final String code;
    private final String krNm;

    public static boolean isPitcher(String posnCd) {
        return "10".equals(posnCd) || "11".equals(posnCd) || "12".equals(posnCd);
    }
}
