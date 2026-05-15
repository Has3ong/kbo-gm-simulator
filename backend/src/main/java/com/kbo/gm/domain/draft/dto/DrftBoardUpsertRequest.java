package com.kbo.gm.domain.draft.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class DrftBoardUpsertRequest {
    private Integer prioOrd;  // 우선순위 (null=미분류)
    private String doNotPick; // 지명 제외 여부 (Y/N, 기본 N)
    private String memo;      // 메모
}
