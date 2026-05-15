package com.kbo.gm.util;

/**
 * 20~80 스케일 능력치를 S/A/B/C/D 등급 문자열로 변환
 * SQL 뷰(VW_PLR_ABLT)와 동일한 기준 적용
 *
 * 76~80 → S+   71~75 → S    66~70 → S-
 * 61~65 → A+   56~60 → A    51~55 → A-
 * 46~50 → B+   41~45 → B    36~40 → B-
 * 31~35 → C+   26~30 → C    23~25 → C-
 * 20~22 → D
 */
public final class AbilityGradeConverter {

    private AbilityGradeConverter() {}

    public static String toGrade(int val) {
        if (val >= 76) return "S+";
        if (val >= 71) return "S";
        if (val >= 66) return "S-";
        if (val >= 61) return "A+";
        if (val >= 56) return "A";
        if (val >= 51) return "A-";
        if (val >= 46) return "B+";
        if (val >= 41) return "B";
        if (val >= 36) return "B-";
        if (val >= 31) return "C+";
        if (val >= 26) return "C";
        if (val >= 23) return "C-";
        return "D";
    }
}
