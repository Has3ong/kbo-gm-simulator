package com.kbo.gm.domain.player.mapper;

import com.kbo.gm.domain.player.dao.*;
import com.kbo.gm.domain.player.dao.PlrInjryHistDao;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PlrMapper {
    List<PlrDao> findAll(@Param("tmId") Long tmId, @Param("plrSttsCd") String plrSttsCd);
    PlrDao findById(@Param("plrId") Long plrId);
    List<PlrAbltDao> findAbilities(@Param("plrId") Long plrId);
    List<PlrPosnDao> findPositions(@Param("plrId") Long plrId);
    List<PlrTrtDao> findTraits(@Param("plrId") Long plrId);
    PlrCntrctDao findCurrentContract(@Param("plrId") Long plrId);

    List<PlrCntrctHistDao> findContractHistory(@Param("plrId") Long plrId);
    List<PlrAnslSalHistDao> findSalaryHistory(@Param("plrId") Long plrId);
    List<PlrAbltSsntDao> findAbilityHistory(@Param("plrId") Long plrId);
    List<PlrBatrSsntRecDao> findBatterSeasonStats(@Param("plrId") Long plrId);
    List<PlrPtchSsntRecDao> findPitcherSeasonStats(@Param("plrId") Long plrId);
    List<PlrBatrMonRecDao> findBatterMonthlyStats(@Param("plrId") Long plrId, @Param("ssntYr") Integer ssntYr);
    List<PlrPtchMonRecDao> findPitcherMonthlyStats(@Param("plrId") Long plrId, @Param("ssntYr") Integer ssntYr);
    List<PlrAbltMonDao> findAbilityMonthlyHistory(@Param("plrId") Long plrId, @Param("ssntYr") Integer ssntYr);

    // 히든 능력치
    List<PlrHideAbltDao> findHideAbilities(@Param("plrId") Long plrId);

    // 피로도/컨디션
    PlrFatgCondDao findFatgCond(@Param("plrId") Long plrId, @Param("ssntYr") Integer ssntYr);
    void upsertFatgCond(@Param("plrId") Long plrId, @Param("ssntYr") Integer ssntYr,
                        @Param("fatg") Integer fatg, @Param("cond") Integer cond);

    // 부상 이력
    List<PlrInjryHistDao> findInjuryHistory(@Param("plrId") Long plrId);

    // 선수 정보 수정
    void updateAblt(@Param("plrId") Long plrId, @Param("abltCd") String abltCd, @Param("abltVal") Integer abltVal);
    void updatePosnPrfcAblt(@Param("plrId") Long plrId, @Param("posnCd") String posnCd, @Param("posnPrfcAblt") Integer posnPrfcAblt);
    void updatePotAblt(@Param("plrId") Long plrId, @Param("potAblt") Integer potAblt);
    void recalcOvrlAblt(@Param("plrId") Long plrId);
}
