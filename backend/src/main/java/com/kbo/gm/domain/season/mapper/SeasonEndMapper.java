package com.kbo.gm.domain.season.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface SeasonEndMapper {

    // ----- Step 1: 조건 확인 -----
    Map<String, Object> findSsntInfo(@Param("ssntYr") int ssntYr);

    // ----- Step 2: 최종 순위 확정 -----
    List<Map<String, Object>> findCurrentStnd(@Param("ssntYr") int ssntYr);

    // ----- Step 3: 챔피언 결정 -----
    Map<String, Object> findChampion(@Param("ssntYr") int ssntYr);

    // ----- Step 4: 시즌 기록 확정 -----
    List<Map<String, Object>> aggregateBatterSeasonStats(@Param("ssntYr") int ssntYr);
    List<Map<String, Object>> aggregatePitcherSeasonStats(@Param("ssntYr") int ssntYr);

    // ----- Step 5: 골든글러브 -----
    Map<String, Object> findGoldenGlovePitcher(@Param("ssntYr") int ssntYr);
    List<Map<String, Object>> findGoldenGloveFielders(@Param("ssntYr") int ssntYr);

    // ----- Step 6: MVP -----
    Map<String, Object> findSeasonMvpBatter(@Param("ssntYr") int ssntYr);
    Map<String, Object> findSeasonMvpPitcher(@Param("ssntYr") int ssntYr);

    // ----- Step 7: 팬·구단주 평가 -----
    List<Map<String, Object>> findTeamFinalStnd(@Param("ssntYr") int ssntYr);
    List<Map<String, Object>> findTeamMktSsnt(@Param("ssntYr") int ssntYr);

    // ----- Step 8: 재정 최종 정산 -----
    List<Map<String, Object>> findTeamFinance(@Param("ssntYr") int ssntYr);

    // ----- Step 9: 선수 성장·노화 -----
    List<Map<String, Object>> findPlayersForGrowth();

    // ----- Step 10: 계약 만료·FA -----
    List<Map<String, Object>> findExpiredContracts(@Param("ssntEndDt") String ssntEndDt);

    // ----- Step 11: 은퇴 -----
    List<Map<String, Object>> findRetirementCandidates();

    // ----- 유저 팀 조회 -----
    Long findUserTmId();

    // ----- 유저 팀 시즌 최고 선수 -----
    Map<String, Object> findUserTeamSeasonBestBatter(
            @Param("tmId") Long tmId, @Param("ssntYr") int ssntYr);
    Map<String, Object> findUserTeamSeasonBestPitcher(
            @Param("tmId") Long tmId, @Param("ssntYr") int ssntYr);

    // ----- 유저 팀 재정 조회 -----
    Map<String, Object> findUserTeamFinance(
            @Param("tmId") Long tmId, @Param("ssntYr") int ssntYr);

    // ----- 이벤트 배치 삽입 -----
    void insertEvntBatch(@Param("list") List<Map<String, Object>> list);
}
