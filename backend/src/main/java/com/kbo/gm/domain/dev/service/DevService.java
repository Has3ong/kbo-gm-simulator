package com.kbo.gm.domain.dev.service;

import com.kbo.gm.domain.dev.dto.FcltyCostRow;
import com.kbo.gm.domain.dev.dto.FcltyCostUpdateRequest;
import com.kbo.gm.domain.dev.mapper.DevMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DevService {

    private final DevMapper devMapper;
    private final JdbcTemplate jdbcTemplate;

    /** 전체 시설 업그레이드 비용 설정 조회 */
    public List<FcltyCostRow> findAllFcltyCosts() {
        return devMapper.findAllFcltyCosts();
    }

    /** 시설 업그레이드 비용 일괄 수정 */
    @Transactional
    public void updateFcltyCosts(FcltyCostUpdateRequest req) {
        for (FcltyCostRow row : req.getRows()) {
            devMapper.updateFcltyCost(
                    row.getFcltyTypeCd(),
                    row.getFromLvl(),
                    row.getUpgrCost(),
                    row.getUpgrDays()
            );
        }
    }

    /** 스프링 캠프 현재 상태 조회 */
    public Map<String, Object> getSpringCampStatus() {
        String done = cfgVal("SPRING_CAMP_DONE");
        String loc  = cfgVal("SPRING_CAMP_LOC");
        String curDt = null;
        Integer ssntYr = null;
        try {
            Map<String, Object> row = jdbcTemplate.queryForMap(
                "SELECT SSNT_YR, CUR_DT FROM SSNT ORDER BY SSNT_YR DESC LIMIT 1");
            curDt  = row.get("CUR_DT") != null ? row.get("CUR_DT").toString() : null;
            ssntYr = row.get("SSNT_YR") != null ? ((Number) row.get("SSNT_YR")).intValue() : null;
        } catch (Exception ignored) {}

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("done",   "1".equals(done));
        result.put("locCd",  loc);
        result.put("curDt",  curDt);
        result.put("ssntYr", ssntYr);
        return result;
    }

    /** 스프링 캠프 플래그 초기화 — CUR_DT를 2월 1일로 되돌리고 SPRING_CAMP_DONE=0 */
    @Transactional
    public void resetSpringCamp() {
        Integer ssntYr = null;
        try {
            ssntYr = jdbcTemplate.queryForObject(
                "SELECT SSNT_YR FROM SSNT ORDER BY SSNT_YR DESC LIMIT 1", Integer.class);
        } catch (Exception ignored) {}

        jdbcTemplate.update(
            "INSERT INTO GAME_CFG (CFG_KEY, CFG_VAL) VALUES ('SPRING_CAMP_DONE', '0') " +
            "ON DUPLICATE KEY UPDATE CFG_VAL = '0'");
        jdbcTemplate.update(
            "INSERT INTO GAME_CFG (CFG_KEY, CFG_VAL) VALUES ('SPRING_CAMP_LOC', '') " +
            "ON DUPLICATE KEY UPDATE CFG_VAL = ''");

        if (ssntYr != null) {
            String feb1 = LocalDate.of(ssntYr, 2, 1).toString();
            jdbcTemplate.update("UPDATE SSNT SET CUR_DT = ? WHERE SSNT_YR = ?", feb1, ssntYr);
        }
    }

    private String cfgVal(String key) {
        try {
            return jdbcTemplate.queryForObject(
                "SELECT CFG_VAL FROM GAME_CFG WHERE CFG_KEY = ?", String.class, key);
        } catch (Exception e) { return null; }
    }
}
