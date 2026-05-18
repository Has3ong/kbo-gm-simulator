package com.kbo.gm.domain.fan.service;

import com.kbo.gm.domain.fan.dao.TmFanPrpnstDao;
import com.kbo.gm.domain.fan.dto.TmFanPrpnstRequest;
import com.kbo.gm.domain.fan.dto.TmFanPrpnstResponse;
import com.kbo.gm.domain.fan.mapper.TmFanPrpnstMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class TmFanPrpnstService {

    private final TmFanPrpnstMapper mapper;

    public TmFanPrpnstResponse findByTmId(Long tmId) {
        TmFanPrpnstDao dao = mapper.findByTmId(tmId);
        return dao != null ? TmFanPrpnstResponse.from(dao) : null;
    }

    public List<TmFanPrpnstResponse> findAll() {
        return mapper.findAll().stream().map(TmFanPrpnstResponse::from).toList();
    }

    public void upsert(Long tmId, TmFanPrpnstRequest req) {
        mapper.upsert(req, tmId);
    }

    /** 시즌 시작 시 전체 팀 랜덤 생성. GameStartService에서 호출 예정. */
    public void randomizeAll(List<Long> tmIds) {
        Random rng = new Random();
        for (Long tmId : tmIds) {
            TmFanPrpnstRequest req = TmFanPrpnstRequest.builder()
                    .fanLoyalty(20 + rng.nextInt(61))
                    .fanSatisfaction(50)
                    .expectationLevel(20 + rng.nextInt(61))
                    .performanceSensitivity(20 + rng.nextInt(61))
                    .rebuildPatience(20 + rng.nextInt(61))
                    .starPlayerPreference(20 + rng.nextInt(61))
                    .franchisePlayerAttachment(20 + rng.nextInt(61))
                    .prospectPreference(20 + rng.nextInt(61))
                    .veteranPreference(20 + rng.nextInt(61))
                    .foreignPlayerExpectation(20 + rng.nextInt(61))
                    .localIdentity(20 + rng.nextInt(61))
                    .traditionPreference(20 + rng.nextInt(61))
                    .supportIntensity(20 + rng.nextInt(61))
                    .rivalryIntensity(20 + rng.nextInt(61))
                    .attendancePower(20 + rng.nextInt(61))
                    .merchandiseAffinity(20 + rng.nextInt(61))
                    .ticketPriceSensitivity(20 + rng.nextInt(61))
                    .seasonTicketLoyalty(20 + rng.nextInt(61))
                    .awayFanPower(20 + rng.nextInt(61))
                    .mediaAmplification(20 + rng.nextInt(61))
                    .criticismTendency(20 + rng.nextInt(61))
                    .patience(20 + rng.nextInt(61))
                    .emotionalVolatility(20 + rng.nextInt(61))
                    .offensePreference(20 + rng.nextInt(61))
                    .pitchingPreference(20 + rng.nextInt(61))
                    .defensePreference(20 + rng.nextInt(61))
                    .aggressiveManagementPreference(20 + rng.nextInt(61))
                    .currentPopularity(30 + rng.nextInt(41))
                    .averageAttendance(5000 + rng.nextInt(15001))
                    .seasonTicketHolders(500 + rng.nextInt(4501))
                    .fanDiscontent(10 + rng.nextInt(31))
                    .demandLevel(20 + rng.nextInt(41))
                    .build();
            mapper.upsert(req, tmId);
        }
    }
}
