package com.kbo.gm.domain.team.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TmFinanceDao {
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
}
