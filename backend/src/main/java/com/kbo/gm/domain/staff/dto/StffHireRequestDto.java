package com.kbo.gm.domain.staff.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
public class StffHireRequestDto {
    private Long mgrCandId;          // 감독 후보 ID (null = 재계약)
    private List<Long> coachCandIds; // 코치 후보 ID 목록 (최대 2)
    private boolean renewMgr;        // 기존 감독 재계약
    private boolean renewCoach;      // 기존 코치 전원 재계약
}
