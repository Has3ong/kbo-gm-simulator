package com.kbo.gm.domain.save.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface SaveMapper {
    // 경기 기록
    void deletePlrBatrGameRec(@Param("ssntYr") Integer ssntYr);
    void deletePlrPtchGameRec(@Param("ssntYr") Integer ssntYr);
    void deleteGame(@Param("ssntYr") Integer ssntYr);

    // 선수 기록
    void deletePlrBatrMonRec(@Param("ssntYr") Integer ssntYr);
    void deletePlrBatrSsntRec(@Param("ssntYr") Integer ssntYr);
    void deletePlrBatrTmSsntRec(@Param("ssntYr") Integer ssntYr);
    void deletePlrPtchMonRec(@Param("ssntYr") Integer ssntYr);
    void deletePlrPtchSsntRec(@Param("ssntYr") Integer ssntYr);
    void deletePlrPtchTmSsntRec(@Param("ssntYr") Integer ssntYr);

    // 순위
    void deleteStnd(@Param("ssntYr") Integer ssntYr);

    // 선수 시즌 데이터
    void deletePlrGrwthLog(@Param("ssntYr") Integer ssntYr);
    void deletePlrFatgCond(@Param("ssntYr") Integer ssntYr);
    void deletePlrAnslSalHist(@Param("ssntYr") Integer ssntYr);
    void deletePlrPosnSsnt(@Param("ssntYr") Integer ssntYr);
    void deletePlrAbltMon(@Param("ssntYr") Integer ssntYr);
    void deletePlrAbltSsnt(@Param("ssntYr") Integer ssntYr);
    void deletePlrEntyHist(@Param("ssntYr") Integer ssntYr);
    void deletePlrEnty(@Param("ssntYr") Integer ssntYr);
    void deletePlrTmCntrct(@Param("ssntYr") Integer ssntYr);

    // 팀 재정/마케팅/기록
    void deleteTmFncSsnt(@Param("ssntYr") Integer ssntYr);
    void deleteTmMktSsnt(@Param("ssntYr") Integer ssntYr);
    void deleteTmSsntRec(@Param("ssntYr") Integer ssntYr);
    void deleteTmMonRec(@Param("ssntYr") Integer ssntYr);
    void deleteTmLineup(@Param("ssntYr") Integer ssntYr);
    void deleteTmRotation(@Param("ssntYr") Integer ssntYr);
    void deleteTmBullpen(@Param("ssntYr") Integer ssntYr);

    // 드래프트
    void deleteDrftBoard(@Param("ssntYr") Integer ssntYr);
    void deleteDrftScutRpt(@Param("ssntYr") Integer ssntYr);
    void deleteDrftOrd(@Param("ssntYr") Integer ssntYr);
    void deleteDrftPlr(@Param("ssntYr") Integer ssntYr);
    void deleteDrft(@Param("ssntYr") Integer ssntYr);

    // 외국인 선수
    void deleteFrgnPlrOffer(@Param("ssntYr") Integer ssntYr);
    void deleteFrgnPlrCandAblt(@Param("ssntYr") Integer ssntYr);
    void deleteFrgnPlrCandStat(@Param("ssntYr") Integer ssntYr);
    void deleteFrgnPlrCand(@Param("ssntYr") Integer ssntYr);

    // 포스트시즌
    void deletePstssntGame(@Param("ssntYr") Integer ssntYr);
    void deletePstssntSrs(@Param("ssntYr") Integer ssntYr);

    // 이벤트
    void deleteSsntEvnt(@Param("ssntYr") Integer ssntYr);

    // 스태프
    void deleteStffTmCntrct(@Param("ssntYr") Integer ssntYr);
    void deleteStffTm(@Param("ssntYr") Integer ssntYr);
    void deleteStffCandAblt(@Param("ssntYr") Integer ssntYr);
    void deleteStffCand(@Param("ssntYr") Integer ssntYr);

    // 시즌 본체
    void deleteSsnt(@Param("ssntYr") Integer ssntYr);
}
