package com.kbo.gm.domain.season.dto;

import com.kbo.gm.domain.season.dao.StndDao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StndResponse {
    private Long tmId;          // 팀 ID
    private String tmKrNm;      // 팀 한국어 이름
    private String tmShrtKrNm;  // 팀 한국어 약칭
    private Integer ssntYr;     // 시즌 연도
    private Integer w;          // 승
    private Integer l;          // 패
    private Integer t;          // 무
    private Double pct;         // 승률 = W / (W + L), 무승부 제외
    private Double gb;          // 게임차 (1위와의 차이, 1위는 0.0)
    private Integer homeW;      // 홈 승
    private Integer homeL;      // 홈 패
    private Integer awayW;      // 원정 승
    private Integer awayL;      // 원정 패
    private Integer rs;         // 득점 (Run Scored)
    private Integer ra;         // 실점 (Run Allowed)
    private Integer runDiff;    // 득실차 = RS - RA
    private String strkType;    // 연속 기록 유형 (W: 연승, L: 연패, D: 무승부)
    private Integer strkCnt;    // 연속 기록 횟수
    private Integer l10W;       // 최근 10경기 승
    private Integer l10L;       // 최근 10경기 패
    private Integer l10T;       // 최근 10경기 무
    private Integer stndRnk;    // 현재 순위
    private Integer tmMorl;     // 팀 사기 (20~80, 연승·연패에 따라 변동)
    private Integer fanStsfctn; // 팬 만족도 (20~80)
    private Integer ownStsfctn; // 구단주 만족도 (20~80, 성적·예산 집행 복합 평가)
    private String pstssntStts; // 포스트시즌 진출 상태 (UNDC: 미결정, ELIM: 탈락, CLWC: WC진출, CLPS: 포스트시즌진출, CL1P: 1위확정, CHMP: 우승)

    public static StndResponse from(StndDao dao) {
        return StndResponse.builder()
                .tmId(dao.getTmId())
                .tmKrNm(dao.getTmKrNm())
                .tmShrtKrNm(dao.getTmShrtKrNm())
                .ssntYr(dao.getSsntYr())
                .w(dao.getW())
                .l(dao.getL())
                .t(dao.getT())
                .pct(dao.getPct())
                .gb(dao.getGb())
                .homeW(dao.getHomeW())
                .homeL(dao.getHomeL())
                .awayW(dao.getAwayW())
                .awayL(dao.getAwayL())
                .rs(dao.getRs())
                .ra(dao.getRa())
                .runDiff(dao.getRunDiff())
                .strkType(dao.getStrkType())
                .strkCnt(dao.getStrkCnt())
                .l10W(dao.getL10W())
                .l10L(dao.getL10L())
                .l10T(dao.getL10T())
                .stndRnk(dao.getStndRnk())
                .tmMorl(dao.getTmMorl())
                .fanStsfctn(dao.getFanStsfctn())
                .ownStsfctn(dao.getOwnStsfctn())
                .pstssntStts(dao.getPstssntStts())
                .build();
    }
}
