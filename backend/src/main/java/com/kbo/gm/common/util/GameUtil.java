package com.kbo.gm.common.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class GameUtil {

    public static Long getUserTmId(JdbcTemplate jdbc) {
        try {
            String val = jdbc.queryForObject(
                "SELECT CFG_VAL FROM GAME_CFG WHERE CFG_KEY = 'USER_TM_ID'", String.class);
            return val != null ? Long.parseLong(val) : null;
        } catch (Exception e) { return null; }
    }

    public static Integer getCurrentSsntYr(JdbcTemplate jdbc) {
        try {
            return jdbc.queryForObject(
                "SELECT SSNT_YR FROM SSNT ORDER BY SSNT_YR DESC LIMIT 1", Integer.class);
        } catch (Exception e) { return null; }
    }

    public static String getCfgVal(JdbcTemplate jdbc, String key) {
        try {
            return jdbc.queryForObject(
                "SELECT CFG_VAL FROM GAME_CFG WHERE CFG_KEY = ?", String.class, key);
        } catch (Exception e) { return null; }
    }

    public static void upsertCfg(JdbcTemplate jdbc, String key, String value) {
        jdbc.update(
            "INSERT INTO GAME_CFG (CFG_KEY, CFG_VAL) VALUES (?, ?) ON DUPLICATE KEY UPDATE CFG_VAL = ?",
            key, value, value);
    }

    /**
     * 만원 단위 금액을 표준 표기로 변환한다.
     * 1억 미만: "X,XXX만원"
     * 1억 이상, 잔액 없음: "X억원"
     * 1억 이상, 잔액 있음: "X억 X,XXX만원"
     */
    public static String fmtMan(long manAmt) {
        if (manAmt >= 10000) {
            long eok = manAmt / 10000;
            long man = manAmt % 10000;
            if (man == 0) return eok + "억원";
            return String.format("%d억 %,d만원", eok, man);
        }
        return String.format("%,d만원", manAmt);
    }
}
