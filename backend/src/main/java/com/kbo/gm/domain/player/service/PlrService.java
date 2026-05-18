package com.kbo.gm.domain.player.service;

import com.kbo.gm.domain.player.dao.PlrCntrctDao;
import com.kbo.gm.domain.player.dao.PlrDao;
import com.kbo.gm.domain.player.dto.*;
import com.kbo.gm.domain.player.mapper.PlrMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PlrService {

    private final PlrMapper plrMapper;

    public List<PlrResponse> findAll(Long tmId, String plrSttsCd) {
        return plrMapper.findAll(tmId, plrSttsCd).stream().map(PlrResponse::from).toList();
    }

    public PlrResponse findById(Long plrId) {
        PlrDao dao = plrMapper.findById(plrId);
        if (dao == null) throw new IllegalArgumentException("선수를 찾을 수 없습니다: " + plrId);
        return PlrResponse.from(dao);
    }

    public List<PlrAbltResponse> findAbilities(Long plrId) {
        return plrMapper.findAbilities(plrId).stream().map(PlrAbltResponse::from).toList();
    }

    public List<PlrPosnResponse> findPositions(Long plrId) {
        return plrMapper.findPositions(plrId).stream().map(PlrPosnResponse::from).toList();
    }

    public List<PlrTrtResponse> findTraits(Long plrId) {
        return plrMapper.findTraits(plrId).stream().map(PlrTrtResponse::from).toList();
    }

    public PlrCntrctResponse findCurrentContract(Long plrId) {
        PlrCntrctDao dao = plrMapper.findCurrentContract(plrId);
        return dao != null ? PlrCntrctResponse.from(dao) : null;
    }

    public List<PlrCntrctHistResponse> findContractHistory(Long plrId) {
        return plrMapper.findContractHistory(plrId).stream().map(PlrCntrctHistResponse::from).toList();
    }

    public List<PlrAnslSalHistResponse> findSalaryHistory(Long plrId) {
        return plrMapper.findSalaryHistory(plrId).stream().map(PlrAnslSalHistResponse::from).toList();
    }

    public List<PlrAbltSsntResponse> findAbilityHistory(Long plrId) {
        return plrMapper.findAbilityHistory(plrId).stream().map(PlrAbltSsntResponse::from).toList();
    }

    public List<PlrBatrSsntRecResponse> findBatterSeasonStats(Long plrId) {
        return plrMapper.findBatterSeasonStats(plrId).stream().map(PlrBatrSsntRecResponse::from).toList();
    }

    public List<PlrPtchSsntRecResponse> findPitcherSeasonStats(Long plrId) {
        return plrMapper.findPitcherSeasonStats(plrId).stream().map(PlrPtchSsntRecResponse::from).toList();
    }

    public List<PlrBatrMonRecResponse> findBatterMonthlyStats(Long plrId, Integer ssntYr) {
        return plrMapper.findBatterMonthlyStats(plrId, ssntYr).stream().map(PlrBatrMonRecResponse::from).toList();
    }

    public List<PlrPtchMonRecResponse> findPitcherMonthlyStats(Long plrId, Integer ssntYr) {
        return plrMapper.findPitcherMonthlyStats(plrId, ssntYr).stream().map(PlrPtchMonRecResponse::from).toList();
    }

    public List<PlrAbltMonResponse> findAbilityMonthlyHistory(Long plrId, Integer ssntYr) {
        return plrMapper.findAbilityMonthlyHistory(plrId, ssntYr).stream().map(PlrAbltMonResponse::from).toList();
    }

    public List<PlrHideAbltResponse> findHideAbilities(Long plrId) {
        return plrMapper.findHideAbilities(plrId).stream().map(PlrHideAbltResponse::from).toList();
    }

    public PlrFatgCondResponse findFatgCond(Long plrId, Integer ssntYr) {
        var dao = plrMapper.findFatgCond(plrId, ssntYr);
        return dao != null ? PlrFatgCondResponse.from(dao) : null;
    }

    public void upsertFatgCond(Long plrId, Integer ssntYr, Integer fatg, Integer cond) {
        plrMapper.upsertFatgCond(plrId, ssntYr, fatg, cond);
    }

    public List<PlrInjryHistResponse> findInjuryHistory(Long plrId) {
        return plrMapper.findInjuryHistory(plrId).stream().map(PlrInjryHistResponse::from).toList();
    }

    public List<PlrGrwthLogResponse> getGrowthLog(Long plrId) {
        return plrMapper.findGrowthLog(plrId);
    }

    public List<PlrResponse> searchPlayers(String plrNm, String reprPosnCd, String plrOrgnCd,
            String plrFrgnYn, Integer minOvrl, Integer maxOvrl, Integer minAge, Integer maxAge, String plrSttsCd) {
        return plrMapper.searchPlayers(plrNm, reprPosnCd, plrOrgnCd, plrFrgnYn,
            minOvrl, maxOvrl, minAge, maxAge, plrSttsCd)
            .stream().map(PlrResponse::from).toList();
    }

    @Transactional
    public void editPlayer(Long plrId, PlrEditRequest req) {
        if (req.getSsntYr() != null && req.getFatg() != null && req.getCond() != null) {
            plrMapper.upsertFatgCond(plrId, req.getSsntYr(), req.getFatg(), req.getCond());
        }
        if (req.getPotAblt() != null) {
            plrMapper.updatePotAblt(plrId, req.getPotAblt());
        }
        if (req.getAbilities() != null && !req.getAbilities().isEmpty()) {
            // 종합능력치(평균)가 잠재능력치를 초과하면 거부
            int potAblt = req.getPotAblt() != null
                    ? req.getPotAblt()
                    : plrMapper.findById(plrId).getPlrPotAblt();
            double avgAblt = req.getAbilities().values().stream()
                    .mapToInt(Integer::intValue).average().orElse(0);
            if ((int) Math.round(avgAblt) > potAblt) {
                throw new IllegalArgumentException(
                        "종합능력치(" + (int) Math.round(avgAblt) + ")가 잠재능력치(" + potAblt + ")를 초과할 수 없습니다.");
            }
            for (Map.Entry<String, Integer> e : req.getAbilities().entrySet()) {
                plrMapper.updateAblt(plrId, e.getKey(), e.getValue());
            }
            plrMapper.recalcOvrlAblt(plrId);
        }
        if (req.getPositions() != null && !req.getPositions().isEmpty()) {
            for (Map.Entry<String, Integer> e : req.getPositions().entrySet()) {
                plrMapper.updatePosnPrfcAblt(plrId, e.getKey(), e.getValue());
            }
        }
    }
}
