package com.kbo.gm.common.code;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PlrTrtCode {
    // 신체·부상 관련
    IRON("IRON", "금강불괴", "Iron Body",           "부상 확률 크게 감소. IRK 히든 능력치 효과 무시"),
    GLAS("GLAS", "유리몸",   "Glass Body",          "부상 확률 크게 증가. 경미한 충돌에도 부상 가능"),
    RCVR("RCVR", "빠른 회복","Quick Recovery",      "부상 후 회복 기간 크게 단축"),
    LONG("LONG", "장수",     "Longevity",           "노화로 인한 능력치 하락 속도 둔화"),
    AGED("AGED", "노쇠화",   "Rapid Aging",         "능력치 하락 속도 빠름. 피크 이후 급격히 쇠퇴"),

    // 성장 관련
    ERLB("ERLB", "조숙",     "Early Bloomer",       "어린 나이에 빠르게 성장. 피크 도달 시기 빠름"),
    LATB("LATB", "만숙",     "Late Bloomer",        "늦게 성장. 커리어 후반까지 성장 가능"),

    // 투구 관련 (투수 전용)
    ACEM("ACEM", "에이스 기질",  "Ace Mentality",      "중요 경기(포스트시즌, 라이벌전)에서 투구 능력 상승"),
    CLSR("CLSR", "마무리 기질",  "Closer Mentality",   "세이브 상황·9회에서 투구 집중력·효율 상승"),
    WKHS("WKHS", "내구왕",      "Workhorse",          "많은 이닝 소화해도 구위 유지. STM 소모율 감소"),
    CTRL("CTRL", "극도의 제구",  "Control Artist",     "볼넷 확률 크게 감소. 제구(CTL) 능력치 추가 보너스"),
    STRK("STRK", "탈삼진 머신",  "Strikeout Machine",  "삼진 유도 확률 상승"),
    LHKL("LHKL", "좌타자 킬러", "Left-Hand Killer",   "좌타자 상대 효율 상승"),
    RHKL("RHKL", "우타자 킬러", "Right-Hand Killer",  "우타자 상대 효율 상승"),

    // 타격 관련 (타자 전용)
    CLTH("CLTH", "클러치 히터", "Clutch Hitter",      "득점권(1·2루, 만루)에서 타율·장타율 보너스"),
    PWRH("PWRH", "파워 히터",   "Power Hitter",       "홈런·장타 확률 추가 보너스. PWR 능력치 연산 강화"),
    CTMN("CTMN", "컨택 머신",   "Contact Machine",    "삼진 아웃 확률 크게 감소. 컨택(CNT) 능력치 연산 강화"),
    DSPY("DSPY", "선구안",      "Plate Discipline",   "볼넷 선택 능력 향상. 헛스윙 감소"),
    BDBL("BDBL", "배드볼 히터", "Bad Ball Hitter",    "스트라이크존 외 공에도 강한 타격"),
    SPDM("SPDM", "번개발",      "Speed Demon",        "도루 성공률·주루 능력 추가 보너스. RUN·STL 연산 강화"),

    // 정신·성격 관련
    COMP("COMP", "승부사",      "Competitor",         "중요 상황에서 집중력·결단력 상승. BGM 히든 능력치 효과 배가"),
    MNTL("MNTL", "멘탈 강자",   "Mental Giant",       "연패·역경 속에서도 능력치 유지. 압박에 강함"),
    TPLR("TPLR", "팀 플레이어", "Team Player",        "팀 사기·분위기에 긍정적 영향. LDR 히든 능력치 효과 보조"),
    GRND("GRND", "악바리",      "Grinder",            "체력·컨디션 낮아도 능력치 감소 폭 작음"),
    DRTY("DRTY", "더티 플레이어","Dirty Player",      "비매너 플레이 빈도 증가. DRT 히든 능력치 효과 배가"),
    SPRT("SPRT", "스포츠맨",    "Sportsman",          "항상 클린 플레이. 퇴장·경고 확률 0");

    private final String code;
    private final String krNm;
    private final String engNm;
    private final String desc;

    public static PlrTrtCode fromCode(String code) {
        for (PlrTrtCode v : values()) {
            if (v.code.equals(code)) return v;
        }
        return null;
    }
}
