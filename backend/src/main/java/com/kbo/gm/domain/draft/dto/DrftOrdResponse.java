package com.kbo.gm.domain.draft.dto;

import com.kbo.gm.domain.draft.dao.DrftOrdDao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DrftOrdResponse {
    private Long drftId;       // 드래프트 ID
    private Integer pickNo;    // 전체 픽 번호
    private Integer rnd;       // 라운드 번호
    private Integer rndPickNo; // 라운드 내 픽 순서
    private Long tmId;         // 지명 팀 ID
    private String tmKrNm;     // 팀 한국어명
    private String tmShrtKrNm; // 팀 한국어 약칭
    private String pickSttsCd; // 픽 상태코드
    private Long drftPlrId;    // 지명된 선수 ID
    private String plrNm;      // 선수명
    private String posnCd;     // 포지션코드
    private String reprPosnCd; // 대표 포지션코드
    private Long plrId;        // 입단 후 선수 ID

    public static DrftOrdResponse from(DrftOrdDao dao) {
        return DrftOrdResponse.builder()
                .drftId(dao.getDrftId())
                .pickNo(dao.getPickNo())
                .rnd(dao.getRnd())
                .rndPickNo(dao.getRndPickNo())
                .tmId(dao.getTmId())
                .tmKrNm(dao.getTmKrNm())
                .tmShrtKrNm(dao.getTmShrtKrNm())
                .pickSttsCd(dao.getPickSttsCd())
                .drftPlrId(dao.getDrftPlrId())
                .plrNm(dao.getPlrNm())
                .posnCd(dao.getPosnCd())
                .reprPosnCd(dao.getReprPosnCd())
                .plrId(dao.getPlrId())
                .build();
    }
}
