package com.kbo.gm.domain.team.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class TmFcltyUpgrRequest {
    private String fcltyTypeCd;  // 업그레이드할 시설 종류코드
}
