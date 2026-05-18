package com.kbo.gm.domain.owner.service;

import com.kbo.gm.domain.owner.dao.TmOwnPrpnstDao;
import com.kbo.gm.domain.owner.dto.TmOwnPrpnstRequest;
import com.kbo.gm.domain.owner.dto.TmOwnPrpnstResponse;
import com.kbo.gm.domain.owner.mapper.TmOwnPrpnstMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class TmOwnPrpnstService {

    private final TmOwnPrpnstMapper mapper;

    public TmOwnPrpnstResponse findByTmId(Long tmId) {
        TmOwnPrpnstDao dao = mapper.findByTmId(tmId);
        return dao != null ? TmOwnPrpnstResponse.from(dao) : null;
    }

    public List<TmOwnPrpnstResponse> findAll() {
        return mapper.findAll().stream().map(TmOwnPrpnstResponse::from).toList();
    }

    public void upsert(Long tmId, TmOwnPrpnstRequest req) {
        mapper.upsert(req, tmId);
    }

    /** 시즌 시작 시 전체 팀 랜덤 생성. GameStartService에서 호출 예정. */
    public void randomizeAll(List<Long> tmIds) {
        Random rng = new Random();
        for (Long tmId : tmIds) {
            TmOwnPrpnstRequest req = TmOwnPrpnstRequest.builder()
                    .patience(20 + rng.nextInt(61))
                    .ambition(20 + rng.nextInt(61))
                    .financialStrictness(20 + rng.nextInt(61))
                    .investmentWillingness(20 + rng.nextInt(61))
                    .youthPreference(20 + rng.nextInt(61))
                    .starPreference(20 + rng.nextInt(61))
                    .loyaltyToGm(40 + rng.nextInt(41))
                    .rebuildTolerance(20 + rng.nextInt(61))
                    .winNowPreference(20 + rng.nextInt(61))
                    .analyticsPreference(20 + rng.nextInt(61))
                    .scoutingPreference(20 + rng.nextInt(61))
                    .fanPressureSensitivity(20 + rng.nextInt(61))
                    .mediaSensitivity(20 + rng.nextInt(61))
                    .localIdentityPreference(20 + rng.nextInt(61))
                    .veteranPreference(20 + rng.nextInt(61))
                    .foreignPlayerInvestment(20 + rng.nextInt(61))
                    .performanceOverPopularity(20 + rng.nextInt(61))
                    .riskTolerance(20 + rng.nextInt(61))
                    .facilityPreference(20 + rng.nextInt(61))
                    .staffInvestmentPreference(20 + rng.nextInt(61))
                    .currentSatisfaction(50)
                    .firingRisk(10)
                    .budgetFlexibility(20 + rng.nextInt(61))
                    .pitcherPreference(20 + rng.nextInt(61))
                    .batterPreference(20 + rng.nextInt(61))
                    .build();
            mapper.upsert(req, tmId);
        }
    }
}
