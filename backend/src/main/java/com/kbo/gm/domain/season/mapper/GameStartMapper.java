package com.kbo.gm.domain.season.mapper;

import com.kbo.gm.domain.season.dao.PlrForStartDao;
import com.kbo.gm.domain.season.dao.TmForStartDao;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Mapper
public interface GameStartMapper {

    // ----- 팀 조회 -----
    TmForStartDao findTeamById(@Param("tmId") Long tmId);
    List<TmForStartDao> findAllTeams();

    // ----- 선수 조회 -----
    List<PlrForStartDao> findAllContractedPlayers();

    // ----- SSNT 삽입/갱신 -----
    void insertSsnt(@Param("ssntYr") int ssntYr,
                    @Param("ssntBgngDt") LocalDate ssntBgngDt,
                    @Param("regSsntBgngDt") LocalDate regSsntBgngDt,
                    @Param("regSsntEndDt") LocalDate regSsntEndDt,
                    @Param("pstssntBgngDt") LocalDate pstssntBgngDt,
                    @Param("pstssntEndDt") LocalDate pstssntEndDt,
                    @Param("ssntEndDt") LocalDate ssntEndDt,
                    @Param("curDt") LocalDate curDt);

    // ----- GAME_CFG 저장 -----
    void upsertGameCfg(@Param("cfgKey") String cfgKey, @Param("cfgVal") String cfgVal);

    // ----- STND 배치 삽입 -----
    void insertStndBatch(@Param("list") List<Map<String, Object>> list);

    // ----- PLR_ENTY 배치 삽입 -----
    void insertEntyBatch(@Param("list") List<Map<String, Object>> list);

    // ----- TM_LINEUP 배치 삽입 -----
    void insertLineupBatch(@Param("list") List<Map<String, Object>> list);

    // ----- TM_ROTATION 배치 삽입 -----
    void insertRotationBatch(@Param("list") List<Map<String, Object>> list);

    // ----- TM_BULLPEN 배치 삽입 -----
    void insertBullpenBatch(@Param("list") List<Map<String, Object>> list);

    // ----- GAME 배치 삽입 -----
    void insertGameBatch(@Param("list") List<Map<String, Object>> list);

    // ----- SSNT_EVNT 배치 삽입 -----
    void insertSsntEvntBatch(@Param("list") List<Map<String, Object>> list);
}
