package com.kbo.gm.domain.roster.service;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RosterStatsService {

    private final JdbcTemplate jdbcTemplate;

    /**
     * 팀 소속 전체 선수의 시즌 기록 반환.
     * batters: REPR_POSN_CD != '10' (야수), pitchers: REPR_POSN_CD = '10' (투수)
     */
    public Map<String, Object> getSeasonStats(Long tmId, Integer ssntYr) {

        List<Map<String, Object>> batters = jdbcTemplate.queryForList(
            "SELECT P.PLR_ID, P.PLR_NM, P.PLR_OVRL_ABLT, " +
            "  COALESCE(C.REPR_POSN_CD, '9') AS REPR_POSN_CD, " +
            "  ( SELECT PP.POSN_CD FROM PLR_POSN PP " +
            "    WHERE PP.PLR_ID = P.PLR_ID ORDER BY PP.POSN_PRFC_ABLT DESC LIMIT 1 ) AS POSN_CD, " +
            "  COALESCE(B.G,   0) AS G,   COALESCE(B.PA,  0) AS PA,  COALESCE(B.AB, 0) AS AB, " +
            "  COALESCE(B.H,   0) AS H,   COALESCE(B.DOBL,0) AS DOBL,COALESCE(B.TRPL,0) AS TRPL, " +
            "  COALESCE(B.HR,  0) AS HR,  COALESCE(B.RBI, 0) AS RBI, COALESCE(B.R,  0) AS R, " +
            "  COALESCE(B.BB,  0) AS BB,  COALESCE(B.SO,  0) AS SO,  COALESCE(B.SB, 0) AS SB, " +
            "  COALESCE(B.CS,  0) AS CS,  COALESCE(B.HBP, 0) AS HBP, " +
            "  B.BA, B.OBP, B.SLG, B.OPS " +
            "FROM PLR P " +
            "LEFT JOIN PLR_TM_CNTRCT C ON C.PLR_ID = P.PLR_ID AND C.TM_ID = ? " +
            "LEFT JOIN PLR_BATR_SSNT_REC B ON B.PLR_ID = P.PLR_ID AND B.SSNT_YR = ? " +
            "WHERE P.TM_ID = ? AND P.PLR_STTS_CD = 'AT' " +
            "  AND COALESCE(C.REPR_POSN_CD, '9') != '10' " +
            "ORDER BY PA DESC, P.PLR_OVRL_ABLT DESC",
            tmId, ssntYr, tmId);

        List<Map<String, Object>> pitchers = jdbcTemplate.queryForList(
            "SELECT P.PLR_ID, P.PLR_NM, P.PLR_OVRL_ABLT, " +
            "  ( SELECT PP.POSN_CD FROM PLR_POSN PP " +
            "    WHERE PP.PLR_ID = P.PLR_ID ORDER BY PP.POSN_PRFC_ABLT DESC LIMIT 1 ) AS POSN_CD, " +
            "  COALESCE(PT.G,      0) AS G,    COALESCE(PT.GS,   0) AS GS, " +
            "  COALESCE(PT.IP_OUT, 0) AS IP_OUT, " +
            "  COALESCE(PT.H,      0) AS H,    COALESCE(PT.HR,   0) AS HR, " +
            "  COALESCE(PT.R,      0) AS R,    COALESCE(PT.ER,   0) AS ER, " +
            "  COALESCE(PT.BB,     0) AS BB,   COALESCE(PT.SO,   0) AS SO, " +
            "  COALESCE(PT.W,      0) AS W,    COALESCE(PT.L,    0) AS L, " +
            "  COALESCE(PT.SV,     0) AS SV,   COALESCE(PT.HLD,  0) AS HLD, " +
            "  COALESCE(PT.QS,     0) AS QS,   COALESCE(PT.CG,   0) AS CG, " +
            "  COALESCE(PT.SHO,    0) AS SHO,  COALESCE(PT.NH,   0) AS NH, " +
            "  COALESCE(PT.PG,     0) AS PG, " +
            "  PT.ERA, PT.WHIP " +
            "FROM PLR P " +
            "LEFT JOIN PLR_TM_CNTRCT C ON C.PLR_ID = P.PLR_ID AND C.TM_ID = ? " +
            "LEFT JOIN PLR_PTCH_SSNT_REC PT ON PT.PLR_ID = P.PLR_ID AND PT.SSNT_YR = ? " +
            "WHERE P.TM_ID = ? AND P.PLR_STTS_CD = 'AT' " +
            "  AND COALESCE(C.REPR_POSN_CD, '10') = '10' " +
            "ORDER BY IP_OUT DESC, P.PLR_OVRL_ABLT DESC",
            tmId, ssntYr, tmId);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("batters",  batters);
        result.put("pitchers", pitchers);
        return result;
    }
}
