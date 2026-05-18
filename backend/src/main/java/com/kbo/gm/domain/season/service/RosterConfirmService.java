package com.kbo.gm.domain.season.service;

import com.kbo.gm.common.util.GameUtil;
import com.kbo.gm.domain.season.dto.RosterConfirmRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class RosterConfirmService {

    private final JdbcTemplate jdbcTemplate;

    // ============================================================
    // 공개 API
    // ============================================================

    /**
     * 유저 팀 전체 선수 및 현재 라인업/로테이션/불펜 데이터 반환.
     */
    public Map<String, Object> getRosterData() {
        Long    userTmId = GameUtil.getUserTmId(jdbcTemplate);
        Integer ssntYr   = GameUtil.getCurrentSsntYr(jdbcTemplate);
        if (userTmId == null || ssntYr == null) {
            throw new IllegalStateException("유저 팀 정보 또는 시즌 정보를 찾을 수 없습니다.");
        }

        // 선수 목록 — POSN_CD: PLR_POSN 최고 숙련도 포지션, REPR_POSN_CD: 투수/야수 구분용
        List<Map<String, Object>> players = jdbcTemplate.queryForList(
            "SELECT P.PLR_ID, P.PLR_NM, P.PLR_OVRL_ABLT, P.PLR_POT_ABLT, P.PLR_STTS_CD, P.PLR_FRGN_YN, " +
            "  COALESCE(C.REPR_POSN_CD, '9') AS REPR_POSN_CD, " +
            "  COALESCE(C.CNTRCT_TYPE_CD, '') AS CNTRCT_TYPE_CD, " +
            "  COALESCE(E.ENTY_LVL_CD, '2') AS ENTY_LVL_CD, " +
            "  ( SELECT PP.POSN_CD FROM PLR_POSN PP " +
            "    WHERE PP.PLR_ID = P.PLR_ID " +
            "    ORDER BY PP.POSN_PRFC_ABLT DESC LIMIT 1 ) AS POSN_CD " +
            "FROM PLR P " +
            "LEFT JOIN PLR_TM_CNTRCT C ON C.PLR_ID = P.PLR_ID AND C.TM_ID = ? " +
            "LEFT JOIN PLR_ENTY E ON E.PLR_ID = P.PLR_ID AND E.TM_ID = ? AND E.SSNT_YR = ? " +
            "WHERE P.TM_ID = ? AND P.PLR_STTS_CD = 'AT' " +
            "ORDER BY COALESCE(C.REPR_POSN_CD,'9'), P.PLR_OVRL_ABLT DESC",
            userTmId, userTmId, ssntYr, userTmId);

        // 현재 라인업
        List<Map<String, Object>> currentLineup = jdbcTemplate.queryForList(
            "SELECT TM_ID, SSNT_YR, LINEUP_NO, PLR_ID, POSN_CD " +
            "FROM TM_LINEUP WHERE TM_ID = ? AND SSNT_YR = ? ORDER BY LINEUP_NO",
            userTmId, ssntYr);

        // 현재 선발 로테이션
        List<Map<String, Object>> currentRotation = jdbcTemplate.queryForList(
            "SELECT TM_ID, SSNT_YR, ROT_ORD, PLR_ID " +
            "FROM TM_ROTATION WHERE TM_ID = ? AND SSNT_YR = ? ORDER BY ROT_ORD",
            userTmId, ssntYr);

        // 현재 불펜
        List<Map<String, Object>> currentBullpen = jdbcTemplate.queryForList(
            "SELECT TM_ID, SSNT_YR, PLR_ID, ROLE_CD " +
            "FROM TM_BULLPEN WHERE TM_ID = ? AND SSNT_YR = ?",
            userTmId, ssntYr);

        // 선수 능력치 맵 (PLR_ID → 능력치 목록)
        if (!players.isEmpty()) {
            List<Long> plrIds = players.stream()
                .map(p -> ((Number) p.get("PLR_ID")).longValue())
                .toList();
            String inClause = plrIds.stream().map(String::valueOf).collect(java.util.stream.Collectors.joining(","));
            List<Map<String, Object>> ablts = jdbcTemplate.queryForList(
                "SELECT PLR_ID, ABLT_CD, ABLT_VAL FROM PLR_ABLT WHERE PLR_ID IN (" + inClause + ")");
            java.util.Map<Long, java.util.Map<String, Integer>> abltMap = new java.util.HashMap<>();
            for (Map<String, Object> a : ablts) {
                long pid = ((Number) a.get("PLR_ID")).longValue();
                String cd = (String) a.get("ABLT_CD");
                int val = ((Number) a.get("ABLT_VAL")).intValue();
                abltMap.computeIfAbsent(pid, k -> new java.util.LinkedHashMap<>()).put(cd, val);
            }
            for (Map<String, Object> p : players) {
                long pid = ((Number) p.get("PLR_ID")).longValue();
                p.put("ABLTS", abltMap.getOrDefault(pid, java.util.Collections.emptyMap()));
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("players",         players);
        result.put("currentLineup",   currentLineup);
        result.put("currentRotation", currentRotation);
        result.put("currentBullpen",  currentBullpen);
        return result;
    }

    /**
     * 로스터 확정 처리.
     * 1군/2군 엔트리 갱신, 라인업·로테이션·불펜 재설정, ROSTER_CONFIRMED 플래그 저장.
     */
    @Transactional
    public void confirmRoster(RosterConfirmRequest req) {
        Long    userTmId = GameUtil.getUserTmId(jdbcTemplate);
        Integer ssntYr   = GameUtil.getCurrentSsntYr(jdbcTemplate);
        if (userTmId == null || ssntYr == null) {
            throw new IllegalStateException("유저 팀 정보 또는 시즌 정보를 찾을 수 없습니다.");
        }

        List<Long> rosterIds = req.getRosterPlrIds();

        // --- 유효성 검사 ---
        if (rosterIds == null || rosterIds.size() < 20 || rosterIds.size() > 29) {
            throw new IllegalArgumentException(
                "1군 선수는 20명 이상 29명 이하여야 합니다. 현재: " +
                (rosterIds == null ? 0 : rosterIds.size()) + "명");
        }

        // 외국인 선수 수 검증
        if (!rosterIds.isEmpty()) {
            int frCount = 0;
            for (Long plrId : rosterIds) {
                String cntrctType = null;
                try {
                    cntrctType = jdbcTemplate.queryForObject(
                        "SELECT CNTRCT_TYPE_CD FROM PLR_TM_CNTRCT " +
                        "WHERE PLR_ID = ? AND TM_ID = ? " +
                        "ORDER BY CNTRCT_BGNG_DT DESC LIMIT 1",
                        String.class, plrId, userTmId);
                } catch (Exception ignored) {}
                if ("FR".equals(cntrctType)) frCount++;
            }
            if (frCount > 3) {
                throw new IllegalArgumentException(
                    "외국인 선수는 최대 3명까지 1군 등록 가능합니다. 현재: " + frCount + "명");
            }
        }

        // --- 1. PLR_ENTY 갱신: 1군/2군 구분 ---
        // 해당 팀·시즌의 전체 선수를 2군으로 초기화
        jdbcTemplate.update(
            "UPDATE PLR_ENTY SET ENTY_LVL_CD = '2' WHERE TM_ID = ? AND SSNT_YR = ?",
            userTmId, ssntYr);

        // 1군 선수 목록을 1군으로 갱신 (없으면 INSERT)
        for (Long plrId : rosterIds) {
            jdbcTemplate.update(
                "INSERT INTO PLR_ENTY (PLR_ID, TM_ID, SSNT_YR, ENTY_DT, ENTY_LVL_CD) " +
                "VALUES (?, ?, ?, CURDATE(), '1') " +
                "ON DUPLICATE KEY UPDATE ENTY_LVL_CD = '1'",
                plrId, userTmId, ssntYr);
        }

        // --- 2. TM_LINEUP 갱신 ---
        jdbcTemplate.update(
            "DELETE FROM TM_LINEUP WHERE TM_ID = ? AND SSNT_YR = ?",
            userTmId, ssntYr);

        if (req.getBattingOrder() != null) {
            for (RosterConfirmRequest.BattingOrderItem item : req.getBattingOrder()) {
                jdbcTemplate.update(
                    "INSERT INTO TM_LINEUP (TM_ID, SSNT_YR, LINEUP_NO, PLR_ID, POSN_CD) " +
                    "VALUES (?, ?, ?, ?, ?)",
                    userTmId, ssntYr, item.getBtngOrd(), item.getPlrId(), item.getPosnCd());
            }
        }

        // --- 3. TM_ROTATION 갱신 ---
        jdbcTemplate.update(
            "DELETE FROM TM_ROTATION WHERE TM_ID = ? AND SSNT_YR = ?",
            userTmId, ssntYr);

        if (req.getRotation() != null) {
            for (RosterConfirmRequest.RotationItem item : req.getRotation()) {
                jdbcTemplate.update(
                    "INSERT INTO TM_ROTATION (TM_ID, SSNT_YR, ROT_ORD, PLR_ID) " +
                    "VALUES (?, ?, ?, ?)",
                    userTmId, ssntYr, item.getRotnOrd(), item.getPlrId());
            }
        }

        // --- 4. TM_BULLPEN 갱신 ---
        jdbcTemplate.update(
            "DELETE FROM TM_BULLPEN WHERE TM_ID = ? AND SSNT_YR = ?",
            userTmId, ssntYr);

        if (req.getBullpen() != null) {
            for (RosterConfirmRequest.BullpenItem item : req.getBullpen()) {
                jdbcTemplate.update(
                    "INSERT INTO TM_BULLPEN (TM_ID, SSNT_YR, PLR_ID, ROLE_CD) " +
                    "VALUES (?, ?, ?, ?)",
                    userTmId, ssntYr, item.getPlrId(), item.getBullRoleCd());
            }
        }

        // --- 5. ROSTER_CONFIRMED 플래그 저장 ---
        jdbcTemplate.update(
            "INSERT INTO GAME_CFG (CFG_KEY, CFG_VAL) VALUES (?, ?) " +
            "ON DUPLICATE KEY UPDATE CFG_VAL = ?",
            "ROSTER_CONFIRMED", "1", "1");

        log.info("로스터 확정 완료: tmId={} ssntYr={} 1군={}명", userTmId, ssntYr, rosterIds.size());
    }

    @Transactional
    public void releaseForeign(long plrId) {
        Long userTmId = GameUtil.getUserTmId(jdbcTemplate);
        Integer ssntYr = GameUtil.getCurrentSsntYr(jdbcTemplate);
        if (userTmId == null) throw new IllegalStateException("유저 팀 정보 없음");

        // 외국인 선수인지 확인
        String cntrctType;
        try {
            cntrctType = jdbcTemplate.queryForObject(
                "SELECT CNTRCT_TYPE_CD FROM PLR_TM_CNTRCT WHERE PLR_ID = ? AND TM_ID = ? ORDER BY CNTRCT_BGNG_DT DESC LIMIT 1",
                String.class, plrId, userTmId);
        } catch (Exception e) {
            throw new IllegalArgumentException("해당 선수의 계약 정보를 찾을 수 없습니다.");
        }
        if (!"FR".equals(cntrctType)) {
            throw new IllegalArgumentException("외국인 선수만 이 방법으로 방출할 수 있습니다.");
        }

        // 방출 처리: 2군으로 이동 (완전 방출 대신 ENTY_LVL_CD='2'로 변경)
        if (ssntYr != null) {
            jdbcTemplate.update(
                "UPDATE PLR_ENTY SET ENTY_LVL_CD = '2' WHERE PLR_ID = ? AND TM_ID = ? AND SSNT_YR = ?",
                plrId, userTmId, ssntYr);
        }

        log.info("외국인 선수 2군 강등: plrId={} tmId={}", plrId, userTmId);
    }
}
