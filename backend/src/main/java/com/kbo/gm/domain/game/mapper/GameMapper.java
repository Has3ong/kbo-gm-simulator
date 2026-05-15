package com.kbo.gm.domain.game.mapper;

import com.kbo.gm.domain.game.dao.GameDao;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface GameMapper {
    List<GameDao> findAll(@Param("ssntYr") Integer ssntYr,
                          @Param("mon") Integer mon,
                          @Param("gameDt") LocalDate gameDt,
                          @Param("tmId") Long tmId);
    GameDao findById(@Param("gameId") Long gameId);
}
