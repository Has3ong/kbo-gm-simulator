package com.kbo.gm.common.code;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum HideAbltCode {
    FCN("FCN", "집중력",    "Focus",          "한 경기 내에서의 일관성. 높을수록 경기 중 집중력이 지속됨"),
    DRV("DRV", "승부욕",    "Drive",          "승리에 대한 헌신도 및 경기 중 결단력"),
    LDR("LDR", "리더십",    "Leadership",     "다른 선수에게 미치는 긍정적 영향력"),
    IRK("IRK", "부상위험도", "Injury Risk",    "부상 빈도 및 확률. 높을수록 부상에 취약(유리몸)"),
    CST("CST", "일관성",    "Consistency",    "일정 경기 동안 얼마나 꾸준히 활약할 수 있는가"),
    DRT("DRT", "더티플레이", "Dirty Play",     "비매너 행동 빈도. 상대를 흥분시켜 실수·카드를 유도하는 능력"),
    BGM("BGM", "중요경기",  "Big Game",       "중요경기에서 긴장하지 않는 능력"),
    AMB("AMB", "야망",      "Ambition",       "더 큰 것을 바라는 정도. 높으면 성장 빠르나 이적·연봉 요구 분쟁 가능"),
    PRF("PRF", "프로의식",  "Professionalism","필드 안팎 프로의식. 높으면 성장 빠르고 노화 속도 둔화"),
    SPT("SPT", "스포츠맨십","Sportsmanship",  "필드 내 정정당당함의 수치"),
    PAT("PAT", "참을성",    "Patience",       "동료·감독·연봉 협상 상황에서의 인내심");

    private final String code;
    private final String krNm;
    private final String engNm;
    private final String desc;

    public static HideAbltCode fromCode(String code) {
        for (HideAbltCode v : values()) {
            if (v.code.equals(code)) return v;
        }
        return null;
    }
}
