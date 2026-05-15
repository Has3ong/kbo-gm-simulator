package com.kbo.gm.domain.team.service;

import com.kbo.gm.domain.season.dto.StndResponse;
import com.kbo.gm.domain.season.mapper.SsntMapper;
import com.kbo.gm.domain.team.dao.*;
import com.kbo.gm.domain.team.dto.*;
import com.kbo.gm.domain.team.mapper.TmMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TmService {

    private final TmMapper tmMapper;
    private final SsntMapper ssntMapper;

    public List<TmResponse> findAll() {
        return tmMapper.findAll().stream().map(TmResponse::from).toList();
    }

    public TmResponse findById(Long tmId) {
        TmDao dao = tmMapper.findById(tmId);
        if (dao == null) throw new IllegalArgumentException("팀을 찾을 수 없습니다: " + tmId);
        return TmResponse.from(dao);
    }

    public TmFinanceResponse findFinance(Long tmId, Integer ssntYr) {
        TmFinanceDao dao = tmMapper.findFinance(tmId, ssntYr);
        return dao != null ? TmFinanceResponse.from(dao) : null;
    }

    public List<TmFinanceResponse> findFinanceHistory(Long tmId) {
        return tmMapper.findFinanceHistory(tmId).stream().map(TmFinanceResponse::from).toList();
    }

    public List<TmFacilityResponse> findFacilities(Long tmId) {
        return tmMapper.findFacilities(tmId).stream().map(TmFacilityResponse::from).toList();
    }

    public List<TmFacilityUpgrResponse> findFacilityUpgrades(Long tmId) {
        return tmMapper.findFacilityUpgrades(tmId).stream().map(TmFacilityUpgrResponse::from).toList();
    }

    public TmMarketResponse findMarket(Long tmId, Integer ssntYr) {
        TmMarketDao dao = tmMapper.findMarket(tmId, ssntYr);
        return dao != null ? TmMarketResponse.from(dao) : null;
    }

    public List<StndResponse> findStandingsHistory(Long tmId) {
        return ssntMapper.findStandingsByTeam(tmId).stream().map(StndResponse::from).toList();
    }

    // ===== 시설 업그레이드 =====

    public List<FcltyUpgrCostResponse> findFcltyUpgrCosts(Long tmId) {
        return tmMapper.findFcltyUpgrCosts(tmId).stream().map(dao -> {
            if (dao.getUpgrCost() == null) {
                // 최고 레벨 (FCLTY_UPGR_COST_CFG에 해당 레벨 없음)
                return FcltyUpgrCostResponse.maxLevel(
                        dao.getFcltyTypeCd(), dao.getFcltyTypeNm(), dao.getFcltyDesc(), dao.getFromLvl());
            }
            return FcltyUpgrCostResponse.from(dao);
        }).toList();
    }

    @Transactional
    public void upgradeFacility(Long tmId, TmFcltyUpgrRequest req) {
        String fcltyTypeCd = req.getFcltyTypeCd();

        if (tmMapper.countOngoingUpgr(tmId, fcltyTypeCd) > 0)
            throw new IllegalStateException("이미 진행 중인 업그레이드가 있습니다.");

        // 현재 레벨과 비용 조회
        FcltyUpgrCostCfgDao cost = tmMapper.findFcltyUpgrCosts(tmId).stream()
                .filter(d -> fcltyTypeCd.equals(d.getFcltyTypeCd()) && d.getUpgrCost() != null)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("업그레이드 불가: 최고 레벨이거나 시설을 찾을 수 없습니다."));

        int fromLvl = cost.getFromLvl();
        int toLvl = cost.getToLvl();
        long upgrCost = cost.getUpgrCost();
        LocalDate today = LocalDate.now();
        LocalDate endDt = today.plusDays(cost.getUpgrDays());

        // 재정 검사 + 원자적 차감 (CUR_CASH >= upgrCost 조건이면 1행 업데이트, 부족 시 0행)
        int updated = tmMapper.deductFcltyCash(tmId, upgrCost);
        if (updated == 0) {
            Long curCash = tmMapper.findCurCashCurSsnt(tmId);
            throw new IllegalStateException(String.format(
                    "재정이 부족하여 업그레이드할 수 없습니다. (필요: %,d만원 / 보유: %s만원)",
                    upgrCost,
                    curCash != null ? String.format("%,d", curCash) : "0"));
        }

        tmMapper.updateFcltyLvl(tmId, fcltyTypeCd, toLvl);
        tmMapper.insertFcltyUpgr(tmId, fcltyTypeCd, fromLvl, toLvl, upgrCost, today, endDt);
    }

    // ===== 경기장 조회 / 증축 =====

    public StdmResponse findStadium(Long tmId) {
        StdmDao dao = tmMapper.findStadium(tmId);
        return dao != null ? StdmResponse.from(dao) : null;
    }

    public List<StdmExpnResponse> findStdmExpnHistory(Long tmId) {
        return tmMapper.findStdmExpnHistory(tmId).stream().map(StdmExpnResponse::from).toList();
    }

    public List<StdmExpnCostResponse> findStdmExpnCosts() {
        return tmMapper.findStdmExpnCosts().stream().map(StdmExpnCostResponse::from).toList();
    }

    @Transactional
    public void expandStadium(Long tmId, StdmExpnRequest req) {
        if (tmMapper.countOngoingExpn(tmId) > 0)
            throw new IllegalStateException("이미 진행 중인 증축 공사가 있습니다.");

        StdmDao stdm = tmMapper.findStadium(tmId);
        if (stdm == null) throw new IllegalArgumentException("경기장 정보를 찾을 수 없습니다.");

        StdmExpnCostCfgDao cost = tmMapper.findStdmExpnCosts().stream()
                .filter(d -> d.getExpnStep().equals(req.getExpnStep()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 증축 단계입니다."));

        int bfrSeat = stdm.getStdmSeatCnt();
        int aftSeat = bfrSeat + cost.getAddSeatCnt();
        LocalDate today = LocalDate.now();
        LocalDate endDt = today.plusDays(cost.getExpnDays());

        tmMapper.updateStdmSeatCnt(stdm.getStdmId(), aftSeat);
        tmMapper.insertStdmExpn(stdm.getStdmId(), tmId, bfrSeat, aftSeat, cost.getExpnCost(), today, endDt);
    }
}
