package com.kbo.gm.domain.season.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface GameResultMapper {
    List<Map<String, Object>> findGamesOnDate(@Param("ssntYr") int ssntYr, @Param("gameDt") String gameDt);
    List<Map<String, Object>> findLineup(@Param("tmId") long tmId, @Param("ssntYr") int ssntYr);
    Map<String, Object> findStarterWithAbilities(@Param("tmId") long tmId, @Param("ssntYr") int ssntYr);
    List<Map<String, Object>> findBullpenWithAbilities(@Param("tmId") long tmId, @Param("ssntYr") int ssntYr);
    List<Map<String, Object>> findEntrantPitchersWithAbilities(@Param("tmId") long tmId);
    Map<String, Object> findSpAbilitiesByPlrId(@Param("plrId") long plrId);
    List<Map<String, Object>> findRotationPitchersByTeam(@Param("tmId") long tmId, @Param("ssntYr") int ssntYr);
    List<Map<String, Object>> findRotation(@Param("tmId") long tmId);
    List<Map<String, Object>> findBullpen(@Param("tmId") long tmId, @Param("ssntYr") int ssntYr);
    List<Map<String, Object>> findPlrFatgCond(@Param("plrId") long plrId, @Param("ssntYr") int ssntYr);
    Long findUserTmId();
    Map<String, Object> findTeamMarketRow(@Param("tmId") long tmId, @Param("ssntYr") int ssntYr);
    Map<String, Object> findBrdcstWinBonus();
    void insertEvntBatch(@Param("list") List<Map<String, Object>> list);
}
