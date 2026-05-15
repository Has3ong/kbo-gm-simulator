package com.kbo.gm.domain.staff.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface StffHireMapper {

    // ----- 후보 관리 -----
    void insertCandidates(@Param("list") List<Map<String, Object>> list);
    void insertCandAbltBatch(@Param("list") List<Map<String, Object>> list);
    List<Map<String, Object>> findCandidates(@Param("stffTypeCd") String stffTypeCd);
    List<Map<String, Object>> findCandAblt(@Param("candId") Long candId);
    Map<String, Object> findCandById(@Param("candId") Long candId);
    void clearCandidates();

    // ----- 스태프 조회 -----
    List<Map<String, Object>> findCurrentStff(@Param("tmId") Long tmId, @Param("stffTypeCd") String stffTypeCd);
    Long findUserTmId();
    Integer findCurrentSsntYr();
    String findCurrentDate();

    // ----- 스태프 채용 -----
    Long insertStff(@Param("stffNm") String stffNm, @Param("stffTypeCd") String stffTypeCd,
                    @Param("stffExpYr") int stffExpYr, @Param("anslSal") long anslSal,
                    @Param("tmId") Long tmId);
    void insertStffTm(@Param("stffId") Long stffId, @Param("tmId") Long tmId, @Param("bgngDt") String bgngDt);
    void insertStffCntrct(@Param("stffId") Long stffId, @Param("tmId") Long tmId,
                          @Param("bgngDt") String bgngDt, @Param("anslSal") long anslSal,
                          @Param("signBonus") long signBonus);
    void insertStffAbltBatch(@Param("list") List<Map<String, Object>> list);

    // ----- 기존 스태프 해임 -----
    void releaseStff(@Param("tmId") Long tmId, @Param("stffTypeCd") String stffTypeCd, @Param("endDt") String endDt);

    // ----- 재정 -----
    void deductSignBonus(@Param("tmId") Long tmId, @Param("ssntYr") int ssntYr, @Param("amount") long amount);

    // ----- GAME_CFG -----
    void upsertCfg(@Param("cfgKey") String cfgKey, @Param("cfgVal") String cfgVal);
    String findCfgVal(@Param("cfgKey") String cfgKey);

    // ----- 이벤트 -----
    void insertEvnt(@Param("evnt") Map<String, Object> evnt);

    // ----- 팀 목록 (AI) -----
    List<Map<String, Object>> findAllTmIds();

    // ----- 능력치 코드 목록 -----
    List<Map<String, Object>> findAbltCodes(@Param("cdId") String cdId);
}
