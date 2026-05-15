package com.kbo.gm.domain.player.dto;

import com.kbo.gm.domain.player.dao.PlrBatrMonRecDao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlrBatrMonRecResponse {
    private Long plrId;      // 선수 ID
    private Integer ssntYr;  // 시즌 연도
    private Integer mon;     // 월
    private Long tmId;       // 소속 팀 ID
    private String tmKrNm;   // 소속 팀 한국어 이름
    private Integer g;       // 출전 경기 수
    private Integer pa;      // 타석 수
    private Integer ab;      // 타수
    private Integer h;       // 안타
    private Integer hr;      // 홈런
    private Integer rbi;     // 타점
    private Integer bb;      // 볼넷
    private Integer so;      // 삼진
    private Integer sb;      // 도루 성공
    private Double ba;       // 타율
    private Double obp;      // 출루율
    private Double slg;      // 장타율
    private Double ops;      // OPS

    public static PlrBatrMonRecResponse from(PlrBatrMonRecDao dao) {
        return PlrBatrMonRecResponse.builder()
                .plrId(dao.getPlrId())
                .ssntYr(dao.getSsntYr())
                .mon(dao.getMon())
                .tmId(dao.getTmId())
                .tmKrNm(dao.getTmKrNm())
                .g(dao.getG())
                .pa(dao.getPa())
                .ab(dao.getAb())
                .h(dao.getH())
                .hr(dao.getHr())
                .rbi(dao.getRbi())
                .bb(dao.getBb())
                .so(dao.getSo())
                .sb(dao.getSb())
                .ba(dao.getBa())
                .obp(dao.getObp())
                .slg(dao.getSlg())
                .ops(dao.getOps())
                .build();
    }
}
