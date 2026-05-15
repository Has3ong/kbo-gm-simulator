package com.kbo.gm.domain.season.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kbo.gm.common.util.GameUtil;
import com.kbo.gm.domain.season.dao.PlrForStartDao;
import com.kbo.gm.domain.season.dao.TmForStartDao;
import com.kbo.gm.domain.season.dto.GameStartProgressDto;
import com.kbo.gm.domain.season.mapper.GameStartMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameStartService {

    private static final int TOTAL_STEPS = 14;

    private final GameStartMapper mapper;
    private final ObjectMapper objectMapper;
    private final JdbcTemplate jdbcTemplate;

    public void start(Long tmId, int ssntYr, SseEmitter emitter) {
        try {
            // Step 1: 팀 유효성 확인
            emit(emitter, 1, "팀 유효성 확인 중...", false, null);
            TmForStartDao userTeam = mapper.findTeamById(tmId);
            if (userTeam == null) throw new IllegalArgumentException("유효하지 않은 팀입니다: " + tmId);

            // Step 2: 비기초 데이터 삭제 (실제 기록 1982~2025 유지)
            emit(emitter, 2, "기존 게임 데이터 초기화 중...", false, null);
            deleteNonBaseData(ssntYr);

            // Step 3: 시즌 마스터 생성
            emit(emitter, 3, "시즌 데이터 생성 중...", false, null);
            LocalDate preStart  = LocalDate.of(ssntYr, 2, 1);  // 스프링캠프 2월 1일
            LocalDate regStart  = LocalDate.of(ssntYr, 4, 1);  // 정규시즌 개막 4월 1일
            LocalDate regEnd    = LocalDate.of(ssntYr, 9, 30); // 정규시즌 종료 9월 30일
            LocalDate pstStart  = LocalDate.of(ssntYr, 10, 7); // 포스트시즌 개막 10월 7일
            LocalDate pstEnd    = LocalDate.of(ssntYr, 10, 31);// 포스트시즌 종료 10월 31일
            LocalDate ssntEnd   = LocalDate.of(ssntYr, 11, 1); // 시즌 종료·오프시즌 시작 11월 1일
            mapper.insertSsnt(ssntYr, preStart, regStart, regEnd, pstStart, pstEnd, ssntEnd, preStart);

            // Step 4: 유저 팀 저장
            emit(emitter, 4, "유저 팀 정보 저장 중...", false, null);
            mapper.upsertGameCfg("USER_TM_ID", String.valueOf(tmId));

            // Step 5: 전체 팀 시즌 순위·시작 예산 초기화
            emit(emitter, 5, "팀 시즌 상태·예산 초기화 중...", false, null);
            List<TmForStartDao> allTeams = mapper.findAllTeams();
            List<Map<String, Object>> stndList = new ArrayList<>();
            List<Map<String, Object>> fncList = new ArrayList<>();
            final long startingCashManwon = 1_000_000L; // 100억원 = 1,000,000 만원
            for (int i = 0; i < allTeams.size(); i++) {
                Long tmIdLoop = allTeams.get(i).getTmId();
                Map<String, Object> stnd = new HashMap<>();
                stnd.put("tmId", tmIdLoop);
                stnd.put("ssntYr", ssntYr);
                stnd.put("rank", i + 1);
                stndList.add(stnd);

                Map<String, Object> fnc = new HashMap<>();
                fnc.put("tmId", tmIdLoop);
                fnc.put("ssntYr", ssntYr);
                fnc.put("cash", startingCashManwon);
                fncList.add(fnc);
            }
            mapper.insertStndBatch(stndList);
            mapper.insertTmFncInitBatch(fncList);

            // Step 6: 전체 선수 엔트리 초기화
            emit(emitter, 6, "로스터 초기화 중...", false, null);
            List<PlrForStartDao> allPlayers = mapper.findAllContractedPlayers();
            List<Map<String, Object>> entyList = new ArrayList<>();
            for (PlrForStartDao p : allPlayers) {
                Map<String, Object> row = new HashMap<>();
                row.put("plrId", p.getPlrId());
                row.put("ssntYr", ssntYr);
                row.put("tmId", p.getTmId());
                row.put("entyDt", regStart);
                entyList.add(row);
            }
            if (!entyList.isEmpty()) mapper.insertEntyBatch(entyList);

            // Step 7: 라인업 자동 생성
            emit(emitter, 7, "라인업 자동 생성 중...", false, null);
            Map<Long, List<PlrForStartDao>> playersByTeam = groupByTeam(allPlayers);
            List<Map<String, Object>> lineupList = buildLineups(playersByTeam, ssntYr);
            if (!lineupList.isEmpty()) mapper.insertLineupBatch(lineupList);

            // Step 8: 선발 로테이션 자동 생성
            emit(emitter, 8, "선발 로테이션 생성 중...", false, null);
            List<Map<String, Object>> rotationList = buildRotations(playersByTeam, ssntYr);
            if (!rotationList.isEmpty()) mapper.insertRotationBatch(rotationList);

            // Step 9: 불펜 역할 자동 생성
            emit(emitter, 9, "불펜 역할 배정 중...", false, null);
            List<Map<String, Object>> bullpenList = buildBullpen(playersByTeam, ssntYr);
            if (!bullpenList.isEmpty()) mapper.insertBullpenBatch(bullpenList);

            // Step 10: 정규시즌 일정 생성
            emit(emitter, 10, "정규시즌 일정 생성 중 (720경기)...", false, null);
            Map<Long, Long> homeStadiums = new HashMap<>();
            for (TmForStartDao t : allTeams) homeStadiums.put(t.getTmId(), t.getHomeStdmId());
            List<Map<String, Object>> gameList = buildSchedule(ssntYr, allTeams, homeStadiums);
            if (!gameList.isEmpty()) mapper.insertGameBatch(gameList);

            // Step 11: 시즌 캘린더 확인 (일정 생성으로 대체)
            emit(emitter, 11, "시즌 캘린더 구성 완료...", false, null);
            // 캘린더는 GAME 테이블의 GAME_DT 목록이 곧 캘린더

            // Step 12: 현재 날짜를 개막일로 설정 (Step 3에서 이미 CUR_DT = regStart로 설정)
            emit(emitter, 12, "현재 날짜 설정 중...", false, null);

            // Step 13: 시작 이벤트/뉴스 생성
            emit(emitter, 13, "시작 이벤트 생성 중...", false, null);
            List<Map<String, Object>> evntList = buildStartEvents(ssntYr, tmId, userTeam.getTmKrNm(), regStart);
            if (!evntList.isEmpty()) mapper.insertSsntEvntBatch(evntList);

            // Step 14: 완료
            emit(emitter, 14, "시즌 시작 완료!", true, null);
            emitter.complete();

        } catch (Exception e) {
            log.error("시즌 시작 실패", e);
            try {
                GameStartProgressDto err = GameStartProgressDto.builder()
                        .step(0).total(TOTAL_STEPS)
                        .message("오류: " + e.getMessage())
                        .done(false).error(e.getMessage())
                        .build();
                emitter.send(SseEmitter.event().data(objectMapper.writeValueAsString(err)));
            } catch (Exception ignored) {}
            emitter.completeWithError(e);
        }
    }

    // ----- 헬퍼: SSE 이벤트 전송 -----

    private void emit(SseEmitter emitter, int step, String message, boolean done, Long userTmId) throws Exception {
        GameStartProgressDto dto = GameStartProgressDto.builder()
                .step(step).total(TOTAL_STEPS)
                .message(message).done(done)
                .userTmId(userTmId)
                .build();
        emitter.send(SseEmitter.event().data(objectMapper.writeValueAsString(dto)));
    }

    // ----- 헬퍼: 팀별 선수 그룹화 -----

    private Map<Long, List<PlrForStartDao>> groupByTeam(List<PlrForStartDao> players) {
        Map<Long, List<PlrForStartDao>> map = new LinkedHashMap<>();
        for (PlrForStartDao p : players) {
            map.computeIfAbsent(p.getTmId(), k -> new ArrayList<>()).add(p);
        }
        return map;
    }

    // ----- Step 7: 라인업 생성 -----
    // 각 포지션(포수~지명타자)에 숙련 능력치 기준 최적 선수를 배정한다.
    // 배정 불가 포지션은 여분 선수로 채운다.

    private static final List<String> BATTER_POSN_CODES = List.of(
            "20", "21", "22", "23", "24", "25", "26", "27", "28"
            // 포수, 1루수, 2루수, 3루수, 유격수, 좌익수, 중견수, 우익수, 지명타자
    );

    private List<Map<String, Object>> buildLineups(Map<Long, List<PlrForStartDao>> playersByTeam, int ssntYr) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<Long, List<PlrForStartDao>> entry : playersByTeam.entrySet()) {
            Long tmId = entry.getKey();
            List<PlrForStartDao> batters = new ArrayList<>();
            for (PlrForStartDao p : entry.getValue()) {
                if (!"10".equals(p.getReprPosnCd())) batters.add(p);
            }

            // 포지션별 최적 선수 배정 (중복 배정 방지)
            Set<Long> usedPlrIds = new HashSet<>();
            Map<String, Long> posnToPlr = new LinkedHashMap<>();
            for (String posnCd : BATTER_POSN_CODES) {
                for (PlrForStartDao p : batters) {
                    if (!usedPlrIds.contains(p.getPlrId()) && posnCd.equals(p.getPosnCd())) {
                        posnToPlr.put(posnCd, p.getPlrId());
                        usedPlrIds.add(p.getPlrId());
                        break;
                    }
                }
            }
            // 배정 못한 포지션은 여분 타자로 채우기
            for (String posnCd : BATTER_POSN_CODES) {
                if (!posnToPlr.containsKey(posnCd)) {
                    for (PlrForStartDao p : batters) {
                        if (!usedPlrIds.contains(p.getPlrId())) {
                            posnToPlr.put(posnCd, p.getPlrId());
                            usedPlrIds.add(p.getPlrId());
                            break;
                        }
                    }
                }
            }

            int lineupNo = 1;
            for (Map.Entry<String, Long> e2 : posnToPlr.entrySet()) {
                if (lineupNo > 9) break;
                Map<String, Object> row = new HashMap<>();
                row.put("tmId", tmId);
                row.put("ssntYr", ssntYr);
                row.put("lineupNo", lineupNo++);
                row.put("plrId", e2.getValue());
                row.put("posnCd", e2.getKey());
                result.add(row);
            }
        }
        return result;
    }

    // ----- Step 8: 선발 로테이션 생성 -----
    // 투수 중 능력치 상위 5명을 선발로 배정한다.

    private List<Map<String, Object>> buildRotations(Map<Long, List<PlrForStartDao>> playersByTeam, int ssntYr) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<Long, List<PlrForStartDao>> entry : playersByTeam.entrySet()) {
            Long tmId = entry.getKey();
            List<PlrForStartDao> starters = entry.getValue().stream()
                    .filter(p -> "10".equals(p.getReprPosnCd()) && "10".equals(p.getPosnCd()))
                    .limit(5)
                    .toList();
            // 선발투수(posnCd='10')가 부족하면 일반 투수 추가
            if (starters.size() < 5) {
                Set<Long> used = new HashSet<>();
                starters.forEach(p -> used.add(p.getPlrId()));
                List<PlrForStartDao> extra = entry.getValue().stream()
                        .filter(p -> "10".equals(p.getReprPosnCd()) && !used.contains(p.getPlrId()))
                        .limit(5 - starters.size())
                        .toList();
                starters = new ArrayList<>(starters);
                starters.addAll(extra);
            }
            for (int i = 0; i < starters.size(); i++) {
                Map<String, Object> row = new HashMap<>();
                row.put("tmId", tmId);
                row.put("ssntYr", ssntYr);
                row.put("rotOrd", i + 1);
                row.put("plrId", starters.get(i).getPlrId());
                result.add(row);
            }
        }
        return result;
    }

    // ----- Step 9: 불펜 역할 생성 -----
    // 선발 5명을 제외한 나머지 투수에 역할을 배정한다.
    // 마무리(CL) 1명 → 셋업맨(SU) 2명 → 나머지 중간계투(MR)

    private List<Map<String, Object>> buildBullpen(Map<Long, List<PlrForStartDao>> playersByTeam, int ssntYr) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<Long, List<PlrForStartDao>> entry : playersByTeam.entrySet()) {
            Long tmId = entry.getKey();
            // 이미 선발로 배정된 상위 5명을 제외
            List<PlrForStartDao> allPitchers = entry.getValue().stream()
                    .filter(p -> "10".equals(p.getReprPosnCd()))
                    .toList();
            List<PlrForStartDao> starters = allPitchers.stream()
                    .filter(p -> "10".equals(p.getPosnCd()))
                    .limit(5)
                    .toList();
            Set<Long> starterIds = new HashSet<>();
            starters.forEach(p -> starterIds.add(p.getPlrId()));

            List<PlrForStartDao> relievers = allPitchers.stream()
                    .filter(p -> !starterIds.contains(p.getPlrId()))
                    .toList();

            for (int i = 0; i < relievers.size(); i++) {
                String roleCd;
                if (i == 0) roleCd = "CL";          // 마무리 (능력치 최고 불펜)
                else if (i <= 2) roleCd = "SU";     // 셋업맨
                else roleCd = "MR";                  // 중간계투

                Map<String, Object> row = new HashMap<>();
                row.put("tmId", tmId);
                row.put("ssntYr", ssntYr);
                row.put("plrId", relievers.get(i).getPlrId());
                row.put("roleCd", roleCd);
                result.add(row);
            }
        }
        return result;
    }

    // ----- Step 2: 비기초 데이터 일괄 삭제 -----
    // 팀·선수·구장 기초 데이터(TM, PLR, STDM 계열)는 유지한다.
    // 1982~2025 실제 기록(PLR_BATR/PTCH_SSNT_REC, PLR_ABLT_SSNT)은 기초 데이터로 유지한다.

    private static final List<String> NON_BASE_TABLES = List.of(
            "TM_BULLPEN", "TM_ROTATION", "TM_LINEUP", "GAME_CFG",
            "PLR_ENTY_HIST", "PLR_ENTY",
            "PLR_BATR_GAME_REC", "PLR_PTCH_GAME_REC",
            "PLR_BATR_MON_REC", "PLR_PTCH_MON_REC",
            "PLR_BATR_TM_SSNT_REC", "PLR_PTCH_TM_SSNT_REC",
            "TM_MON_REC", "TM_SSNT_REC",
            "SSNT_EVNT", "PSTSSNT_GAME", "PSTSSNT_SRS", "GAME", "STND",
            "PLR_POSN_SSNT", "PLR_ANSL_SAL_HIST",
            "TM_FNC_SSNT", "TM_MKT_SSNT",
            // 드래프트 (사용자 요청: 시즌 시작 시 초기화)
            "DRFT_BOARD", "DRFT_ORD", "DRFT_SCUT_RPT", "DRFT_PLR", "DRFT",
            // 외국인 후보·오퍼 (게임 중 생성)
            "FRGN_PLR_OFFER", "FRGN_PLR_CAND_STAT", "FRGN_PLR_CAND_ABLT", "FRGN_PLR_CAND",
            // 방송국 계약 (게임 중 체결)
            "TM_BRDCST",
            // 스태프 (게임 중 선임)
            "STFF_CAND_ABLT", "STFF_CAND", "STFF_TM_CNTRCT", "STFF_TM", "STFF_ABLT", "STFF",
            // 게임 중 누적 상태
            "PLR_TM_CNTRCT_HIST", "PLR_FATG_COND", "PLR_GRWTH_LOG", "PLR_ABLT_MON",
            "TM_FCLTY_UPGR", "STDM_EXPN",
            "SSNT"
    );

    // 기초 데이터 포함 테이블: 게임 시즌 연도(2026+) 레코드만 삭제
    private static final List<String> HIST_TABLES_WITH_SSNT_YR = List.of(
            "PLR_BATR_SSNT_REC", "PLR_PTCH_SSNT_REC", "PLR_ABLT_SSNT"
    );

    private void deleteNonBaseData(int ssntYr) {
        // 방송국/스태프/스프링캠프 선택 초기화 (새 게임 시작 시 재선택 필요)
        try {
            jdbcTemplate.update(
                "DELETE FROM GAME_CFG WHERE CFG_KEY IN ('BRDCST_SPNSR','STFF_HIRED','SPRING_CAMP_DONE','SPRING_CAMP_LOC')");
        } catch (Exception e) {
            log.warn("게임 설정 초기화 건너뜀: {}", e.getMessage());
        }

        for (String table : NON_BASE_TABLES) {
            try {
                jdbcTemplate.execute("DELETE FROM " + table);
            } catch (Exception e) {
                log.warn("삭제 건너뜀: {} — {}", table, e.getMessage());
            }
        }
        // 1982~2025 실제 기록은 유지, 게임 시즌 연도 이상만 삭제
        for (String table : HIST_TABLES_WITH_SSNT_YR) {
            try {
                jdbcTemplate.update("DELETE FROM " + table + " WHERE SSNT_YR >= ?", ssntYr);
            } catch (Exception e) {
                log.warn("게임 기록 삭제 건너뜀: {} — {}", table, e.getMessage());
            }
        }

        // PLR/PLR_TM/PLR_TM_CNTRCT — 시드 데이터와 in-game 데이터가 혼재하므로 날짜 기준 정리
        resetInGameContracts(ssntYr);
    }

    /**
     * 시즌 시작 기준일({ssntYr}-02-01) 이후에 발생한 PLR/PLR_TM/PLR_TM_CNTRCT 변경을 되돌린다.
     * - in-game에 추가된 선수(외국인 영입·드래프트 픽)는 종속 데이터까지 cascade 삭제
     * - 시드 선수의 in-game 신규 계약·이적은 행 삭제, in-game 방출은 종료일 복원
     * - PLR.PLR_STTS_CD='REL'(in-game 방출)을 'AT'로 복원하고 TM_ID 재연결
     */
    private void resetInGameContracts(int ssntYr) {
        final String gameStart = ssntYr + "-02-01";

        // 1. in-game에 신규 등장한 PLR_ID 식별 (첫 PLR_TM 기록이 시즌 시작 이후)
        List<Long> ingameIds;
        try {
            ingameIds = jdbcTemplate.queryForList(
                "SELECT x.PLR_ID FROM (" +
                "  SELECT PLR_ID, MIN(TM_BGNG_DT) AS first_dt FROM PLR_TM GROUP BY PLR_ID" +
                ") x WHERE x.first_dt >= ?", Long.class, gameStart);
        } catch (Exception e) {
            log.warn("in-game PLR 식별 실패: {}", e.getMessage());
            ingameIds = java.util.Collections.emptyList();
        }

        if (!ingameIds.isEmpty()) {
            String idsCsv = ingameIds.stream()
                    .map(String::valueOf)
                    .collect(java.util.stream.Collectors.joining(","));
            // 종속 테이블에서 먼저 제거 (FK가 있어도 안전하게)
            for (String tbl : List.of(
                    "PLR_ABLT", "PLR_POSN", "PLR_TRT", "PLR_HIDE_ABLT",
                    "PLR_TM_CNTRCT", "PLR_TM")) {
                try {
                    jdbcTemplate.execute("DELETE FROM " + tbl + " WHERE PLR_ID IN (" + idsCsv + ")");
                } catch (Exception e) {
                    log.warn("in-game PLR 종속 데이터 삭제 건너뜀: {} — {}", tbl, e.getMessage());
                }
            }
            try {
                jdbcTemplate.execute("DELETE FROM PLR WHERE PLR_ID IN (" + idsCsv + ")");
                log.info("in-game 신규 PLR {}건 삭제 완료", ingameIds.size());
            } catch (Exception e) {
                log.warn("in-game PLR 삭제 건너뜀: {}", e.getMessage());
            }
        }

        // 2. 시드 선수의 in-game 계약 변경 정리
        // 2a. in-game 시작된 PLR_TM 행 삭제 (FA 신규 영입 등)
        try {
            int deleted = jdbcTemplate.update("DELETE FROM PLR_TM WHERE TM_BGNG_DT >= ?", gameStart);
            if (deleted > 0) log.info("in-game 시작 PLR_TM {}건 삭제", deleted);
        } catch (Exception e) {
            log.warn("PLR_TM 삭제 건너뜀: {}", e.getMessage());
        }
        // 2b. in-game 종료된 PLR_TM 종료일 NULL로 복원 (방출 되돌리기)
        try {
            int updated = jdbcTemplate.update("UPDATE PLR_TM SET TM_END_DT = NULL WHERE TM_END_DT >= ?", gameStart);
            if (updated > 0) log.info("in-game 종료 PLR_TM 종료일 {}건 복원", updated);
        } catch (Exception e) {
            log.warn("PLR_TM 종료일 복원 건너뜀: {}", e.getMessage());
        }

        // 2c. PLR_TM_CNTRCT — in-game 시작 행 삭제, in-game 방출에 의한 종료일 복원
        try {
            int deleted = jdbcTemplate.update(
                "DELETE FROM PLR_TM_CNTRCT WHERE FA_CNTRCT_BGNG_DT >= ?", gameStart);
            if (deleted > 0) log.info("in-game 시작 PLR_TM_CNTRCT {}건 삭제", deleted);
        } catch (Exception e) {
            log.warn("PLR_TM_CNTRCT 삭제 건너뜀: {}", e.getMessage());
        }
        try {
            int updated = jdbcTemplate.update(
                "UPDATE PLR_TM_CNTRCT SET FA_CNTRCT_END_DT = NULL " +
                "WHERE FA_CNTRCT_END_DT >= ? " +
                "  AND PLR_ID IN (SELECT PLR_ID FROM PLR WHERE PLR_STTS_CD = 'REL')",
                gameStart);
            if (updated > 0) log.info("in-game 방출 계약 종료일 {}건 복원", updated);
        } catch (Exception e) {
            log.warn("PLR_TM_CNTRCT 종료일 복원 건너뜀: {}", e.getMessage());
        }

        // 3. PLR.PLR_STTS_CD='REL' (in-game 방출된 선수)을 'AT'로 복원 + TM_ID 재연결
        try {
            int updated = jdbcTemplate.update(
                "UPDATE PLR p " +
                "INNER JOIN (" +
                "  SELECT PLR_ID, MAX(TM_ID) AS TM_ID FROM PLR_TM WHERE TM_END_DT IS NULL GROUP BY PLR_ID" +
                ") pt ON pt.PLR_ID = p.PLR_ID " +
                "SET p.PLR_STTS_CD = 'AT', p.TM_ID = pt.TM_ID " +
                "WHERE p.PLR_STTS_CD = 'REL'");
            if (updated > 0) log.info("in-game 방출 선수 {}건 상태/팀 복원", updated);
        } catch (Exception e) {
            log.warn("PLR 상태 복원 건너뜀: {}", e.getMessage());
        }
    }

    // ----- Step 10: 정규시즌 일정 생성 -----
    // 10개 팀, 팀당 144경기(9개 상대팀 × 16경기).
    // 화~일 6일(월요일 제외), 매일 5경기(전체 팀 동시 출전) 편성.

    private List<Map<String, Object>> buildSchedule(int ssntYr, List<TmForStartDao> allTeams,
                                                     Map<Long, Long> homeStadiums) {
        List<Long> teamIds = allTeams.stream().map(TmForStartDao::getTmId).toList();
        int n = teamIds.size(); // 10

        // 모든 팀 쌍에 대해 홈/원정 16경기씩 생성 (8홈 + 8원정)
        List<long[]> matchups = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                Long t1 = teamIds.get(i), t2 = teamIds.get(j);
                for (int k = 0; k < 8; k++) {
                    matchups.add(new long[]{t1, t2}); // t1 홈
                    matchups.add(new long[]{t2, t1}); // t2 홈
                }
            }
        }
        Collections.shuffle(matchups, new Random(ssntYr)); // 시즌 연도로 시드 고정

        // 날짜별 5경기 배정 (같은 팀이 하루 2번 출전하지 않도록)
        List<Map<String, Object>> games = new ArrayList<>();
        List<long[]> remaining = new ArrayList<>(matchups);
        LocalDate curDate = LocalDate.of(ssntYr, 4, 1); // 4월 1일 개막

        while (!remaining.isEmpty()) {
            // 월요일 건너뜀 (화~일 경기)
            if (curDate.getDayOfWeek() == DayOfWeek.MONDAY) {
                curDate = curDate.plusDays(1);
                continue;
            }

            Set<Long> usedToday = new HashSet<>();
            List<long[]> todaysGames = new ArrayList<>();
            List<long[]> next = new ArrayList<>();

            for (long[] m : remaining) {
                if (todaysGames.size() < 5 && !usedToday.contains(m[0]) && !usedToday.contains(m[1])) {
                    todaysGames.add(m);
                    usedToday.add(m[0]);
                    usedToday.add(m[1]);
                } else {
                    next.add(m);
                }
            }

            if (todaysGames.isEmpty()) {
                curDate = curDate.plusDays(1);
                continue;
            }

            for (long[] m : todaysGames) {
                Map<String, Object> row = new HashMap<>();
                row.put("ssntYr", ssntYr);
                row.put("gameDt", curDate);
                row.put("homeTmId", m[0]);
                row.put("awayTmId", m[1]);
                row.put("stdmId", homeStadiums.get(m[0]));
                games.add(row);
            }

            remaining = next;
            curDate = curDate.plusDays(1);
        }
        return games;
    }

    // ----- Step 13: 시작 이벤트 생성 -----
    // 방송국 스폰서 선택 안내 (HTML) + 유저 팀 개막 환영 이벤트를 생성한다.

    private List<Map<String, Object>> buildStartEvents(int ssntYr, Long userTmId, String userTmNm,
                                                        LocalDate regStart) {
        List<Map<String, Object>> list = new ArrayList<>();
        LocalDate preStart = LocalDate.of(ssntYr, 2, 1);

        // 방송국 스폰서 선택 안내 이벤트 (HTML, 프리시즌 시작일)
        List<Map<String, Object>> broadcasters = jdbcTemplate.queryForList(
                "SELECT BRDCST_CD, BRDCST_NM, CNTRCT_FEE, WIN_BONUS, POST_BONUS, KS_BONUS " +
                "FROM BRDCST_SPNSR ORDER BY CNTRCT_FEE DESC");

        Map<String, Object> brdcstEvnt = new HashMap<>();
        brdcstEvnt.put("ssntYr", ssntYr);
        brdcstEvnt.put("evntDt", preStart);
        brdcstEvnt.put("tmId", userTmId);
        brdcstEvnt.put("evntTypeCd", "BRDCST");
        brdcstEvnt.put("evntTtlt", ssntYr + "년 방송국 스폰서를 선택하세요");
        brdcstEvnt.put("evntCnts", buildBrdcstHtml(broadcasters));
        list.add(brdcstEvnt);

        // 유저 팀 전용 환영 이벤트 (개막일)
        Map<String, Object> welcome = new HashMap<>();
        welcome.put("ssntYr", ssntYr);
        welcome.put("evntDt", regStart);
        welcome.put("tmId", userTmId);
        welcome.put("evntTypeCd", "NEWS");
        welcome.put("evntTtlt", ssntYr + "년 시즌 개막");
        welcome.put("evntCnts",
                userTmNm + " 단장님, " + ssntYr + "년 KBO 정규시즌이 개막했습니다! "
                        + "144경기를 통해 포스트시즌 진출을 목표로 팀을 이끌어 주세요.");
        list.add(welcome);
        return list;
    }

    private String buildBrdcstHtml(List<Map<String, Object>> broadcasters) {
        Map<String, String> colors = new HashMap<>();
        colors.put("SBS", "#2563EB");
        colors.put("KBS", "#DC2626");
        colors.put("MBC", "#16A34A");

        StringBuilder sb = new StringBuilder();
        sb.append("<div style=\"font-family:sans-serif\">");
        sb.append("<p style=\"color:#777;margin:0 0 16px 0\">")
          .append("계약금이 높을수록 안정적이지만 성과 수당이 낮습니다. 시즌 중 변경 불가합니다.")
          .append("</p>");
        sb.append("<table style=\"width:100%;border-collapse:collapse;font-size:14px\">");
        sb.append("<thead><tr style=\"background:#f5f5f5;border-bottom:2px solid #ddd\">");
        sb.append("<th style=\"padding:10px 12px;text-align:left\">방송국</th>");
        sb.append("<th style=\"padding:10px 12px;text-align:right\">계약금</th>");
        sb.append("<th style=\"padding:10px 12px;text-align:right\">승리 수당</th>");
        sb.append("<th style=\"padding:10px 12px;text-align:right\">포스트시즌 수당</th>");
        sb.append("<th style=\"padding:10px 12px;text-align:right\">한국시리즈 수당</th>");
        sb.append("</tr></thead><tbody>");

        for (Map<String, Object> row : broadcasters) {
            String cd  = (String) row.get("BRDCST_CD");
            String nm  = (String) row.get("BRDCST_NM");
            long fee   = row.get("CNTRCT_FEE") instanceof Number n ? n.longValue() : 0L;
            long win   = row.get("WIN_BONUS")  instanceof Number n ? n.longValue() : 0L;
            long post  = row.get("POST_BONUS") instanceof Number n ? n.longValue() : 0L;
            long ks    = row.get("KS_BONUS")   instanceof Number n ? n.longValue() : 0L;
            String color = colors.getOrDefault(cd, "#555");

            sb.append("<tr style=\"border-bottom:1px solid #eee\">");
            sb.append(String.format(
                "<td style=\"padding:10px 12px\"><span style=\"color:%s;font-weight:bold;font-size:16px\">%s</span></td>",
                color, nm));
            sb.append(String.format(
                "<td style=\"padding:10px 12px;text-align:right;font-weight:bold\">%s</td>",
                GameUtil.fmtMan(fee)));
            sb.append(String.format(
                "<td style=\"padding:10px 12px;text-align:right\">%s/승</td>",
                GameUtil.fmtMan(win)));
            sb.append(String.format(
                "<td style=\"padding:10px 12px;text-align:right\">%s</td>",
                GameUtil.fmtMan(post)));
            sb.append(String.format(
                "<td style=\"padding:10px 12px;text-align:right\">%s</td>",
                GameUtil.fmtMan(ks)));
            sb.append("</tr>");
        }
        sb.append("</tbody></table>");
        sb.append("<p style=\"margin:16px 0 0 0;color:#999;font-size:12px\">")
          .append("※ 화면 상단의 방송국 스폰서 카드에서 선택해주세요.")
          .append("</p></div>");
        return sb.toString();
    }

}
