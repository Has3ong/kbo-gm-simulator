package com.kbo.gm.domain.fan.dto;

import com.kbo.gm.domain.fan.dao.TmFanPrpnstDao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TmFanPrpnstResponse {
    private Long tmId;
    private Integer fanLoyalty;
    private Integer fanSatisfaction;
    private Integer expectationLevel;
    private Integer performanceSensitivity;
    private Integer rebuildPatience;
    private Integer starPlayerPreference;
    private Integer franchisePlayerAttachment;
    private Integer prospectPreference;
    private Integer veteranPreference;
    private Integer foreignPlayerExpectation;
    private Integer localIdentity;
    private Integer traditionPreference;
    private Integer supportIntensity;
    private Integer rivalryIntensity;
    private Integer attendancePower;
    private Integer merchandiseAffinity;
    private Integer ticketPriceSensitivity;
    private Integer seasonTicketLoyalty;
    private Integer awayFanPower;
    private Integer mediaAmplification;
    private Integer criticismTendency;
    private Integer patience;
    private Integer emotionalVolatility;
    private Integer offensePreference;
    private Integer pitchingPreference;
    private Integer defensePreference;
    private Integer aggressiveManagementPreference;
    private Integer currentPopularity;
    private Integer averageAttendance;
    private Integer seasonTicketHolders;
    private Integer fanDiscontent;
    private Integer demandLevel;

    public static TmFanPrpnstResponse from(TmFanPrpnstDao dao) {
        return TmFanPrpnstResponse.builder()
                .tmId(dao.getTmId())
                .fanLoyalty(dao.getFanLoyalty())
                .fanSatisfaction(dao.getFanSatisfaction())
                .expectationLevel(dao.getExpectationLevel())
                .performanceSensitivity(dao.getPerformanceSensitivity())
                .rebuildPatience(dao.getRebuildPatience())
                .starPlayerPreference(dao.getStarPlayerPreference())
                .franchisePlayerAttachment(dao.getFranchisePlayerAttachment())
                .prospectPreference(dao.getProspectPreference())
                .veteranPreference(dao.getVeteranPreference())
                .foreignPlayerExpectation(dao.getForeignPlayerExpectation())
                .localIdentity(dao.getLocalIdentity())
                .traditionPreference(dao.getTraditionPreference())
                .supportIntensity(dao.getSupportIntensity())
                .rivalryIntensity(dao.getRivalryIntensity())
                .attendancePower(dao.getAttendancePower())
                .merchandiseAffinity(dao.getMerchandiseAffinity())
                .ticketPriceSensitivity(dao.getTicketPriceSensitivity())
                .seasonTicketLoyalty(dao.getSeasonTicketLoyalty())
                .awayFanPower(dao.getAwayFanPower())
                .mediaAmplification(dao.getMediaAmplification())
                .criticismTendency(dao.getCriticismTendency())
                .patience(dao.getPatience())
                .emotionalVolatility(dao.getEmotionalVolatility())
                .offensePreference(dao.getOffensePreference())
                .pitchingPreference(dao.getPitchingPreference())
                .defensePreference(dao.getDefensePreference())
                .aggressiveManagementPreference(dao.getAggressiveManagementPreference())
                .currentPopularity(dao.getCurrentPopularity())
                .averageAttendance(dao.getAverageAttendance())
                .seasonTicketHolders(dao.getSeasonTicketHolders())
                .fanDiscontent(dao.getFanDiscontent())
                .demandLevel(dao.getDemandLevel())
                .build();
    }
}
