package com.kbo.gm.domain.game.mapper;

import com.kbo.gm.domain.game.dao.GameDao;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Mapper
public interface GameMapper {
    List<GameDao> findAll(@Param("ssntYr") Integer ssntYr,
                          @Param("mon") Integer mon,
                          @Param("gameDt") LocalDate gameDt,
                          @Param("tmId") Long tmId);
    GameDao findById(@Param("gameId") Long gameId);
    List<Map<String, Object>> findRotationPitchersByTeam(@Param("tmId") Long tmId, @Param("ssntYr") Integer ssntYr);
    List<Map<String, Object>> findBatterRecords(@Param("gameId") Long gameId);
    List<Map<String, Object>> findPitcherRecords(@Param("gameId") Long gameId);
}
