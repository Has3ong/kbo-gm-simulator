package com.kbo.gm.domain.player.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PlrHideAbltDao {
    private Long plrId;        // 선수 ID
    private String hideAbltCd; // 히든 능력치 코드 (FCN/DRV/LDR 등)
    private String hideAbltNm; // 히든 능력치 한글명
    private Integer hideAbltVal; // 히든 능력치 수치 (1~20)
}
