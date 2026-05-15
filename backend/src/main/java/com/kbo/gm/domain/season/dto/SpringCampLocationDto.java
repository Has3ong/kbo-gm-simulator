package com.kbo.gm.domain.season.dto;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SpringCampLocationDto {
    DOMESTIC  ("국내",    50_000L,  1),
    JEJU      ("제주",   100_000L,  2),
    TAIWAN    ("대만",   150_000L,  3),
    OKINAWA   ("오키나와", 200_000L, 4),
    FLORIDA   ("플로리다", 250_000L, 5),
    MIAMI     ("마이애미", 300_000L, 6),
    ARIZONA   ("애리조나", 400_000L, 7);

    private final String name;
    private final long   cost;  // 만원 (5억 = 50000만원)
    private final int    tier;  // 1~7, 성장 배율 기준

    /** 성장 가능 능력치 개수 (tier 기준) */
    public int growthAbltCount() {
        return switch (tier) {
            case 1 -> 2;
            case 2 -> 3;
            case 3 -> 3;
            case 4 -> 4;
            case 5 -> 4;
            case 6 -> 5;
            case 7 -> 6;
            default -> 2;
        };
    }

    /** 능력치당 최대 성장 포인트 */
    public int maxGrowthPerAblt() {
        return switch (tier) {
            case 1 -> 1;
            case 2 -> 1;
            case 3 -> 2;
            case 4 -> 2;
            case 5 -> 3;
            case 6 -> 3;
            case 7 -> 4;
            default -> 1;
        };
    }

    /** PLR_OVRL_ABLT 최대 증가 */
    public int maxOvrlGrowth() {
        return switch (tier) {
            case 1 -> 1;
            case 2 -> 1;
            case 3 -> 2;
            case 4 -> 2;
            case 5 -> 3;
            case 6 -> 3;
            case 7 -> 4;
            default -> 1;
        };
    }
}
