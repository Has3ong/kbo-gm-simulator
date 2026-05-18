package com.kbo.gm.common.code;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum StffTypeCode {
    MGR  ("MGR",   "감독",        "Manager",          "팀 전략·전술·인사 총괄"),
    HCCH ("HCCH",  "수석코치",    "Head Coach",       "감독 보좌, 코치진 조율"),
    COACH("COACH", "코치",        "Coach",            "타격·투수·주루 등 포지션별 지도"),
    SCUT ("SCUT",  "스카우터",    "Scout",            "선수 발굴·평가·입단 협상"),
    MED  ("MED",   "팀닥터",      "Team Doctor",      "부상 진단·치료·재활 관리"),
    SCI  ("SCI",   "스포츠과학자","Sports Scientist",  "체력·바이오메카닉스 분석·훈련 설계"),
    YUTH ("YUTH",  "유소년코치",  "Youth Coach",      "유소년·육성선수 지도"),
    ANLY ("ANLY",  "데이터분석가","Data Analyst",      "경기 데이터 분석·전략 보조");

    private final String code;
    private final String krNm;
    private final String engNm;
    private final String desc;

    public static StffTypeCode fromCode(String code) {
        for (StffTypeCode v : values()) {
            if (v.code.equals(code)) return v;
        }
        return null;
    }
}
