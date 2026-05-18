package com.kbo.gm.domain.team.mapper;

import com.kbo.gm.domain.team.dao.*;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface TmMapper {
    List<TmDao> findAll();
    TmDao findById(@Param("tmId") Long tmId);
    TmFinanceDao findFinance(@Param("tmId") Long tmId, @Param("ssntYr") Integer ssntYr);
    List<TmFinanceDao> findFinanceHistory(@Param("tmId") Long tmId);
    List<TmFacilityDao> findFacilities(@Param("tmId") Long tmId);
    List<TmFacilityUpgrDao> findFacilityUpgrades(@Param("tmId") Long tmId);
    TmMarketDao findMarket(@Param("tmId") Long tmId, @Param("ssntYr") Integer ssntYr);

    // 시설 업그레이드 비용 조회 (팀의 현재 레벨 기준)
    List<FcltyUpgrCostCfgDao> findFcltyUpgrCosts(@Param("tmId") Long tmId);
    // 진행 중인 업그레이드 수 (동일 시설 중복 업그레이드 방지용)
    int countOngoingUpgr(@Param("tmId") Long tmId, @Param("fcltyTypeCd") String fcltyTypeCd);
    // 현재 시즌 보유 현금 조회 (만원)
    Long findCurCashCurSsnt(@Param("tmId") Long tmId);
    // 시설 업그레이드 비용 차감 (CUR_CASH >= 비용일 때만 1행 수정; 부족 시 0 반환)
    int deductFcltyCash(@Param("tmId") Long tmId, @Param("upgrCost") long upgrCost);
    // 시설 레벨 업데이트
    void updateFcltyLvl(@Param("tmId") Long tmId, @Param("fcltyTypeCd") String fcltyTypeCd, @Param("newLvl") int newLvl);
    // 업그레이드 이력 삽입
    void insertFcltyUpgr(@Param("tmId") Long tmId, @Param("fcltyTypeCd") String fcltyTypeCd,
                         @Param("fromLvl") int fromLvl, @Param("toLvl") int toLvl,
                         @Param("upgrCost") long upgrCost,
                         @Param("bgngDt") LocalDate bgngDt, @Param("endDt") LocalDate endDt);

    // 경기장 조회 (팀ID → 경기장)
    StdmDao findStadium(@Param("tmId") Long tmId);
    // 경기장 증축 이력
    List<StdmExpnDao> findStdmExpnHistory(@Param("tmId") Long tmId);
    // 증축 비용 옵션
    List<StdmExpnCostCfgDao> findStdmExpnCosts();
    // 진행 중인 증축 수
    int countOngoingExpn(@Param("tmId") Long tmId);
    // 경기장 좌석수 업데이트
    void updateStdmSeatCnt(@Param("stdmId") Long stdmId, @Param("seatCnt") int seatCnt);
    // 증축 이력 삽입
    void insertStdmExpn(@Param("stdmId") Long stdmId, @Param("tmId") Long tmId,
                        @Param("bfrSeatCnt") int bfrSeatCnt, @Param("aftSeatCnt") int aftSeatCnt,
                        @Param("expnCost") long expnCost,
                        @Param("bgngDt") LocalDate bgngDt, @Param("endDt") LocalDate endDt);

    // 재정 상세 이력 조회
    List<TmFinLogDao> findFinanceLog(@Param("tmId") Long tmId);

    // 재정 이력 등록
    void insertFinanceLog(@Param("tmId") Long tmId, @Param("ssntYr") int ssntYr,
                          @Param("logDt") String logDt, @Param("logTypeCd") String logTypeCd,
                          @Param("logCtgrCd") String logCtgrCd, @Param("amount") long amount,
                          @Param("memo") String memo);
}
