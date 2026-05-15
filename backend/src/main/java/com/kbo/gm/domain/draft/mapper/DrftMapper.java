package com.kbo.gm.domain.draft.mapper;

import com.kbo.gm.domain.draft.dao.*;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface DrftMapper {

    // ── Draft event ──────────────────────────────────
    DrftDao findByYear(@Param("ssntYr") Integer ssntYr);
    DrftDao findById(@Param("drftId") Long drftId, @Param("userTmId") Long userTmId);
    void insertDrft(DrftDao dao);
    void updateStatus(@Param("drftId") Long drftId, @Param("sttsCd") String sttsCd);

    // ── Draft players ────────────────────────────────
    List<DrftPlrDao> findPlayers(@Param("drftId") Long drftId, @Param("tmId") Long tmId);
    DrftPlrDao findPlayer(@Param("drftPlrId") Long drftPlrId, @Param("tmId") Long tmId);
    void insertPlayers(@Param("list") List<DrftPlrDao> list);
    void markPlayerPicked(@Param("drftPlrId") Long drftPlrId, @Param("plrId") Long plrId);
    List<DrftPlrDao> findAvailablePlayersForAi(@Param("drftId") Long drftId,
                                                @Param("tmId") Long tmId);
    List<TmPosnStrengthDao> findTeamPosnStrength(@Param("tmId") Long tmId);

    // ── Scouting reports ─────────────────────────────
    void insertScoutingReports(@Param("list") List<DrftScutRptDao> list);

    // ── Draft order ──────────────────────────────────
    List<DrftOrdDao> findOrder(@Param("drftId") Long drftId);
    DrftOrdDao findCurrentPick(@Param("drftId") Long drftId);
    void insertOrders(@Param("list") List<DrftOrdDao> list);
    void updatePick(@Param("drftId") Long drftId, @Param("pickNo") Integer pickNo,
                    @Param("drftPlrId") Long drftPlrId, @Param("plrId") Long plrId);

    // ── Draft board ──────────────────────────────────
    List<DrftBoardDao> findBoard(@Param("drftId") Long drftId, @Param("tmId") Long tmId);
    void upsertBoardEntry(DrftBoardDao dao);
    void deleteBoardEntry(@Param("drftId") Long drftId, @Param("drftPlrId") Long drftPlrId,
                          @Param("tmId") Long tmId);

    // ── Standings for draft order ────────────────────
    List<Long> findPrevSeasonStndOrder(@Param("ssntYr") Integer ssntYr);
    List<Long> findAllTeamIds();

    // ── Game config ──────────────────────────────────
    Long findUserTmId();

    // ── Player signing (into PLR tables) ────────────
    void insertPlr(Map<String, Object> params);
    void insertPlrTm(Map<String, Object> params);
    void insertPlrCntrct(Map<String, Object> params);
    void insertPlrPosn(Map<String, Object> params);
    void insertPlrAblts(@Param("plrId") Long plrId,
                        @Param("list") List<Map<String, Object>> ablts);
    void insertPlrEnty(Map<String, Object> params);
}
