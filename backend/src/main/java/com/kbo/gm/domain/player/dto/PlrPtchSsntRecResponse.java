package com.kbo.gm.domain.player.dto;

import com.kbo.gm.domain.player.dao.PlrPtchSsntRecDao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlrPtchSsntRecResponse {
    private Long plrId;      // 선수 ID
    private Integer ssntYr;  // 시즌 연도
    private Long tmId;            // 소속 팀 ID
    private String tmKrNm;        // 소속 팀 한국어 이름
    private String tmShrtEngNm;   // 소속 팀 영문 약칭
    private Integer g;            // 등판 경기 수
    private Integer gs;      // 선발 등판 수
    private Integer ipOut;   // 투구 아웃카운트 (실제 이닝 × 3)
    private Integer h;       // 피안타
    private Integer hr;      // 피홈런
    private Integer r;       // 실점
    private Integer er;      // 자책점
    private Integer bb;      // 허용 볼넷
    private Integer so;      // 탈삼진
    private Integer w;       // 승
    private Integer l;       // 패
    private Integer sv;      // 세이브
    private Integer hld;     // 홀드
    private Double era;      // 평균자책점
    private Double whip;     // WHIP

    public static PlrPtchSsntRecResponse from(PlrPtchSsntRecDao dao) {
        return PlrPtchSsntRecResponse.builder()
                .plrId(dao.getPlrId())
                .ssntYr(dao.getSsntYr())
                .tmId(dao.getTmId())
                .tmKrNm(dao.getTmKrNm())
                .tmShrtEngNm(dao.getTmShrtEngNm())
                .g(dao.getG())
                .gs(dao.getGs())
                .ipOut(dao.getIpOut())
                .h(dao.getH())
                .hr(dao.getHr())
                .r(dao.getR())
                .er(dao.getEr())
                .bb(dao.getBb())
                .so(dao.getSo())
                .w(dao.getW())
                .l(dao.getL())
                .sv(dao.getSv())
                .hld(dao.getHld())
                .era(dao.getEra())
                .whip(dao.getWhip())
                .build();
    }
}
