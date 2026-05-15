package com.kbo.gm.domain.season.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RosterConfirmRequest {

    /** 1군 등록 선수 ID 목록 (20~29명) */
    private List<Long> rosterPlrIds;

    /** 타순 배치 (9개) */
    private List<BattingOrderItem> battingOrder;

    /** 선발 로테이션 (최대 5개) */
    private List<RotationItem> rotation;

    /** 불펜 역할 배정 */
    private List<BullpenItem> bullpen;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BattingOrderItem {
        private int btngOrd;   // 타순 (1~9)
        private long plrId;    // 선수 ID
        private String posnCd; // 포지션 코드
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RotationItem {
        private int rotnOrd;  // 로테이션 순서 (1~5)
        private long plrId;   // 선수 ID
    }

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BullpenItem {
        private long plrId;        // 선수 ID
        private String bullRoleCd; // 불펜 역할 코드 (CL/SU/MR)
    }
}
