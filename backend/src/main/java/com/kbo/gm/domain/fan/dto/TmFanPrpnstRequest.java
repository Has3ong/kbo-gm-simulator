package com.kbo.gm.domain.fan.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TmFanPrpnstRequest {
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
}
