package com.kbo.gm.domain.player.dao;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlrFatgCondDao {
    private Long plrId;    // 선수 ID
    private Integer ssntYr; // 시즌 연도
    private Integer fatg;   // 피로도 (1~100)
    private Integer cond;   // 컨디션 (1~100)
}
