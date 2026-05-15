package com.kbo.gm.domain.player.dto;

import com.kbo.gm.domain.player.dao.PlrBatrSsntRecDao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlrBatrSsntRecResponse {
    private Long plrId;      // 선수 ID
    private Integer ssntYr;  // 시즌 연도
    private Long tmId;            // 소속 팀 ID
    private String tmKrNm;        // 소속 팀 한국어 이름
    private String tmShrtEngNm;   // 소속 팀 영문 약칭
    private Integer g;            // 출전 경기 수
    private Integer pa;      // 타석 수
    private Integer ab;      // 타수
    private Integer h;       // 안타
    private Integer dobl;    // 2루타
    private Integer trpl;    // 3루타
    private Integer hr;      // 홈런
    private Integer rbi;     // 타점
    private Integer r;       // 득점
    private Integer bb;      // 볼넷
    private Integer so;      // 삼진
    private Integer sb;      // 도루 성공
    private Integer cs;      // 도루 실패
    private Integer hbp;     // 사구
    private Double ba;       // 타율
    private Double obp;      // 출루율
    private Double slg;      // 장타율
    private Double ops;      // OPS

    public static PlrBatrSsntRecResponse from(PlrBatrSsntRecDao dao) {
        return PlrBatrSsntRecResponse.builder()
                .plrId(dao.getPlrId())
                .ssntYr(dao.getSsntYr())
                .tmId(dao.getTmId())
                .tmKrNm(dao.getTmKrNm())
                .tmShrtEngNm(dao.getTmShrtEngNm())
                .g(dao.getG())
                .pa(dao.getPa())
                .ab(dao.getAb())
                .h(dao.getH())
                .dobl(dao.getDobl())
                .trpl(dao.getTrpl())
                .hr(dao.getHr())
                .rbi(dao.getRbi())
                .r(dao.getR())
                .bb(dao.getBb())
                .so(dao.getSo())
                .sb(dao.getSb())
                .cs(dao.getCs())
                .hbp(dao.getHbp())
                .ba(dao.getBa())
                .obp(dao.getObp())
                .slg(dao.getSlg())
                .ops(dao.getOps())
                .build();
    }
}
