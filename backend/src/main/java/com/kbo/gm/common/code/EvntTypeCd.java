package com.kbo.gm.common.code;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum EvntTypeCd {
    INJ("INJ", "부상"),
    RCV("RCV", "부상 회복"),
    TRD("TRD", "트레이드"),
    SIGN("SIGN", "계약"),
    REL("REL", "방출"),
    WARN("WARN", "구단주 경고"),
    FAN("FAN", "팬 반응"),
    CALL("CALL", "콜업 추천"),
    MVP("MVP", "월간 MVP"),
    POST("POST", "포스트시즌"),
    REC("REC", "기록 달성"),
    NEWS("NEWS", "일반 뉴스");

    private final String code;
    private final String krNm;
}
