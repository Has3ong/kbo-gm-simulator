package com.kbo.gm.domain.team.dto;

import com.kbo.gm.domain.team.dao.TmFinanceDao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TmFinanceResponse {
    private Long tmId;           // 팀 ID
    private Integer ssntYr;      // 시즌 연도
    private Long strCash;        // 시즌 시작 현금
    private Long curCash;        // 현재 보유 현금
    private Long totBdgt;        // 총 예산
    private Long plrSalBdgt;     // 선수 연봉 예산
    private Long coachBdgt;      // 코치 인건비 예산
    private Long dvlpBdgt;       // 육성 예산
    private Long mktBdgt;        // 마케팅 예산
    private Long fcltyBdgt;      // 시설 투자 예산
    private Long curPlrSalCost;  // 현재 선수 연봉 총액 (계약 중인 선수 합산)
    private Long tcktRev;        // 입장권 수익 (누적)
    private Long ssntTcktRev;    // 시즌권 수익 (시즌 초 일괄 계상)
    private Long mrchRev;        // 굿즈·상품 수익 (누적)
    private Long spnsRev;        // 스폰서 수익 (누적)
    private Long bcstRev;        // 방송 중계 수익 (리그 균등 배분)
    private Long pstssntRev;     // 포스트시즌 수익
    private Long plrSalCost;     // 선수 연봉 지출 (누적)
    private Long stffCost;       // 스태프 인건비 지출 (누적)
    private Long oprCost;        // 구단 운영 비용 (누적)
    private Long ownSupp;        // 구단주 지원금 (추가 투자)
    private Long debt;           // 누적 부채 (적자 이월)
    private Long plrActualSal;    // 실제 선수단 연봉 총액
    private Long coachActualSal;  // 코치 연봉 총액 (감독·코치 계약 합산)
    private Long bcstBonusYtd;    // 방송 승리 수당 누계 (당해년도)

    public static TmFinanceResponse from(TmFinanceDao dao) {
        return TmFinanceResponse.builder()
                .tmId(dao.getTmId())
                .ssntYr(dao.getSsntYr())
                .strCash(dao.getStrCash())
                .curCash(dao.getCurCash())
                .totBdgt(dao.getTotBdgt())
                .plrSalBdgt(dao.getPlrSalBdgt())
                .coachBdgt(dao.getCoachBdgt())
                .dvlpBdgt(dao.getDvlpBdgt())
                .mktBdgt(dao.getMktBdgt())
                .fcltyBdgt(dao.getFcltyBdgt())
                .curPlrSalCost(dao.getCurPlrSalCost())
                .tcktRev(dao.getTcktRev())
                .ssntTcktRev(dao.getSsntTcktRev())
                .mrchRev(dao.getMrchRev())
                .spnsRev(dao.getSpnsRev())
                .bcstRev(dao.getBcstRev())
                .pstssntRev(dao.getPstssntRev())
                .plrSalCost(dao.getPlrSalCost())
                .stffCost(dao.getStffCost())
                .oprCost(dao.getOprCost())
                .ownSupp(dao.getOwnSupp())
                .debt(dao.getDebt())
                .plrActualSal(dao.getPlrActualSal())
                .coachActualSal(dao.getCoachActualSal())
                .bcstBonusYtd(dao.getBcstBonusYtd())
                .build();
    }
}
