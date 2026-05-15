package com.kbo.gm.domain.season.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface WeeklyEventMapper {
    Long findUserTmId();
    List<Map<String, Object>> findWeeklyTeamStats(@Param("ssntYr") int ssntYr, @Param("weekStart") String weekStart, @Param("weekEnd") String weekEnd);
    List<Map<String, Object>> findAllActivePlayersByTeam(@Param("tmId") long tmId);
    List<Map<String, Object>> findInjuredPlayers();
    List<Map<String, Object>> findDrftScutRpts();
    Map<String, Object> findTeamStaff(@Param("tmId") long tmId);
    void insertEvntBatch(@Param("list") List<Map<String, Object>> list);
}
