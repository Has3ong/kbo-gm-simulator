package com.kbo.gm.domain.save.service;

import com.kbo.gm.domain.save.mapper.SaveMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SaveService {

    private final SaveMapper saveMapper;

    @Transactional
    public void deleteSave(Integer ssntYr) {
        // 경기 기록
        saveMapper.deletePlrBatrGameRec(ssntYr);
        saveMapper.deletePlrPtchGameRec(ssntYr);
        saveMapper.deleteGame(ssntYr);

        // 선수 기록
        saveMapper.deletePlrBatrMonRec(ssntYr);
        saveMapper.deletePlrBatrSsntRec(ssntYr);
        saveMapper.deletePlrBatrTmSsntRec(ssntYr);
        saveMapper.deletePlrPtchMonRec(ssntYr);
        saveMapper.deletePlrPtchSsntRec(ssntYr);
        saveMapper.deletePlrPtchTmSsntRec(ssntYr);

        // 순위
        saveMapper.deleteStnd(ssntYr);

        // 선수 시즌 데이터
        saveMapper.deletePlrGrwthLog(ssntYr);
        saveMapper.deletePlrFatgCond(ssntYr);
        saveMapper.deletePlrAnslSalHist(ssntYr);
        saveMapper.deletePlrPosnSsnt(ssntYr);
        saveMapper.deletePlrAbltMon(ssntYr);
        saveMapper.deletePlrAbltSsnt(ssntYr);
        saveMapper.deletePlrEntyHist(ssntYr);
        saveMapper.deletePlrEnty(ssntYr);
        saveMapper.deletePlrTmCntrct(ssntYr);

        // 팀 재정/마케팅/기록
        saveMapper.deleteTmFncSsnt(ssntYr);
        saveMapper.deleteTmMktSsnt(ssntYr);
        saveMapper.deleteTmSsntRec(ssntYr);
        saveMapper.deleteTmMonRec(ssntYr);
        saveMapper.deleteTmLineup(ssntYr);
        saveMapper.deleteTmRotation(ssntYr);
        saveMapper.deleteTmBullpen(ssntYr);

        // 드래프트
        saveMapper.deleteDrftBoard(ssntYr);
        saveMapper.deleteDrftScutRpt(ssntYr);
        saveMapper.deleteDrftOrd(ssntYr);
        saveMapper.deleteDrftPlr(ssntYr);
        saveMapper.deleteDrft(ssntYr);

        // 외국인 선수
        saveMapper.deleteFrgnPlrOffer(ssntYr);
        saveMapper.deleteFrgnPlrCandAblt(ssntYr);
        saveMapper.deleteFrgnPlrCandStat(ssntYr);
        saveMapper.deleteFrgnPlrCand(ssntYr);

        // 포스트시즌
        saveMapper.deletePstssntGame(ssntYr);
        saveMapper.deletePstssntSrs(ssntYr);

        // 이벤트
        saveMapper.deleteSsntEvnt(ssntYr);

        // 스태프 (해당 시즌 고용된 것만)
        saveMapper.deleteStffTmCntrct(ssntYr);
        saveMapper.deleteStffTm(ssntYr);
        saveMapper.deleteStffCandAblt(ssntYr);
        saveMapper.deleteStffCand(ssntYr);

        // 시즌 본체
        saveMapper.deleteSsnt(ssntYr);
    }
}
