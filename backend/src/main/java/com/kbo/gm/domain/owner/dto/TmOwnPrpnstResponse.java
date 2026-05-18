package com.kbo.gm.domain.owner.dto;

import com.kbo.gm.domain.owner.dao.TmOwnPrpnstDao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TmOwnPrpnstResponse {
    private Long tmId;
    private Integer patience;
    private Integer ambition;
    private Integer financialStrictness;
    private Integer investmentWillingness;
    private Integer youthPreference;
    private Integer starPreference;
    private Integer loyaltyToGm;
    private Integer rebuildTolerance;
    private Integer winNowPreference;
    private Integer analyticsPreference;
    private Integer scoutingPreference;
    private Integer fanPressureSensitivity;
    private Integer mediaSensitivity;
    private Integer localIdentityPreference;
    private Integer veteranPreference;
    private Integer foreignPlayerInvestment;
    private Integer performanceOverPopularity;
    private Integer riskTolerance;
    private Integer facilityPreference;
    private Integer staffInvestmentPreference;
    private Integer currentSatisfaction;
    private Integer firingRisk;
    private Integer budgetFlexibility;
    private Integer pitcherPreference;
    private Integer batterPreference;

    public static TmOwnPrpnstResponse from(TmOwnPrpnstDao dao) {
        return TmOwnPrpnstResponse.builder()
                .tmId(dao.getTmId())
                .patience(dao.getPatience())
                .ambition(dao.getAmbition())
                .financialStrictness(dao.getFinancialStrictness())
                .investmentWillingness(dao.getInvestmentWillingness())
                .youthPreference(dao.getYouthPreference())
                .starPreference(dao.getStarPreference())
                .loyaltyToGm(dao.getLoyaltyToGm())
                .rebuildTolerance(dao.getRebuildTolerance())
                .winNowPreference(dao.getWinNowPreference())
                .analyticsPreference(dao.getAnalyticsPreference())
                .scoutingPreference(dao.getScoutingPreference())
                .fanPressureSensitivity(dao.getFanPressureSensitivity())
                .mediaSensitivity(dao.getMediaSensitivity())
                .localIdentityPreference(dao.getLocalIdentityPreference())
                .veteranPreference(dao.getVeteranPreference())
                .foreignPlayerInvestment(dao.getForeignPlayerInvestment())
                .performanceOverPopularity(dao.getPerformanceOverPopularity())
                .riskTolerance(dao.getRiskTolerance())
                .facilityPreference(dao.getFacilityPreference())
                .staffInvestmentPreference(dao.getStaffInvestmentPreference())
                .currentSatisfaction(dao.getCurrentSatisfaction())
                .firingRisk(dao.getFiringRisk())
                .budgetFlexibility(dao.getBudgetFlexibility())
                .pitcherPreference(dao.getPitcherPreference())
                .batterPreference(dao.getBatterPreference())
                .build();
    }
}
