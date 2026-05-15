package com.kbo.gm.domain.season.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface MonthlyEventMapper {

    // ----- Step 1: 팀 성적 집계 -----
    /** 전월 완료 경기를 팀별로 집계한 결과 조회 */
    List<Map<String, Object>> aggregateTeamMonthlyStats(
            @Param("ssntYr") int ssntYr, @Param("mon") int mon);

    /** 팀 월간 기록 배치 저장 */
    void upsertTmMonRecBatch(@Param("list") List<Map<String, Object>> list);

    // STND 갱신은 MonthlyEventService에서 JdbcTemplate으로 직접 처리

    // ----- Step 2: 선수 기록 집계 -----
    /** 전월 타자 게임 기록 → 월간 집계 */
    List<Map<String, Object>> aggregateBatterMonthlyStats(
            @Param("ssntYr") int ssntYr, @Param("mon") int mon);

    /** 전월 투수 게임 기록 → 월간 집계 */
    List<Map<String, Object>> aggregatePitcherMonthlyStats(
            @Param("ssntYr") int ssntYr, @Param("mon") int mon);

    /** 타자 월간 기록 배치 저장 */
    void upsertBatterMonRecBatch(@Param("list") List<Map<String, Object>> list);

    /** 투수 월간 기록 배치 저장 */
    void upsertPitcherMonRecBatch(@Param("list") List<Map<String, Object>> list);

    // ----- Step 3: 월간 MVP -----
    /** 월간 MVP 타자 조회 (OPS 최고, PA >= 40) */
    Map<String, Object> findMonthlyMvpBatter(
            @Param("ssntYr") int ssntYr, @Param("mon") int mon);

    /** 월간 MVP 투수 조회 (ERA 최저, IP_OUT >= 45) */
    Map<String, Object> findMonthlyMvpPitcher(
            @Param("ssntYr") int ssntYr, @Param("mon") int mon);

    // ----- Step 4: 재정 정산 -----
    /** 팀별 마케팅·시장 정보 조회 (관중·인기 기반 수입 계산용) */
    List<Map<String, Object>> findTeamMarketInfo(
            @Param("ssntYr") int ssntYr);

    /** 팀별 선수 연봉 합계 조회 (월 비용 계산용) */
    List<Map<String, Object>> findTeamSalarySum();

    /** 팀별 당월 홈 경기 수 조회 */
    List<Map<String, Object>> findTeamHomeGameCount(
            @Param("ssntYr") int ssntYr, @Param("mon") int mon);

    /** 팀 재정 배치 UPSERT */
    void upsertTmFncSsntBatch(@Param("list") List<Map<String, Object>> list);

    /** 계약된 방송국의 승리 수당 조회 (만원/승) — 미선택 시 null */
    Long findBrdcstWinBonus();

    // ----- Step 5: 만족도 변화 -----
    /** 팀별 당월 성적 조회 (만족도 계산용) */
    List<Map<String, Object>> findTeamMonthlyRecord(
            @Param("ssntYr") int ssntYr, @Param("mon") int mon);

    /** 팀 MKT 시즌 정보 조회 (팬 충성도 등) */
    List<Map<String, Object>> findTeamMktSsnt(
            @Param("ssntYr") int ssntYr);

    /** 팀 MKT 배치 UPSERT (만족도 갱신) */
    void upsertTmMktSsntBatch(@Param("list") List<Map<String, Object>> list);

    // ----- Step 6: 유저 팀 조회 -----
    /** GAME_CFG에서 유저 팀 ID 조회 */
    Long findUserTmId();

    /** 유저 팀 월간 기록 조회 */
    Map<String, Object> findUserTeamMonthlyRecord(
            @Param("tmId") Long tmId, @Param("ssntYr") int ssntYr, @Param("mon") int mon);

    /** 유저 팀 이달의 선수 조회 (타자/투수) */
    Map<String, Object> findUserTeamBestBatter(
            @Param("tmId") Long tmId, @Param("ssntYr") int ssntYr, @Param("mon") int mon);

    Map<String, Object> findUserTeamBestPitcher(
            @Param("tmId") Long tmId, @Param("ssntYr") int ssntYr, @Param("mon") int mon);

    /** 유저 팀 재정 조회 */
    Map<String, Object> findUserTeamFinance(
            @Param("tmId") Long tmId, @Param("ssntYr") int ssntYr);

    /** 시즌 이벤트 배치 삽입 */
    void insertEvntBatch(@Param("list") List<Map<String, Object>> list);

    /** 현재 STND 순위 조회 (정렬 후 순위 재부여용) */
    List<Map<String, Object>> findCurrentStnd(@Param("ssntYr") int ssntYr);
}
