package com.kbo.gm.domain.player.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PlrAnslSalHistDao {
    private Long plrId;       // 선수 ID
    private Integer ssntYr;   // 시즌 연도
    private Long anslSal;     // 해당 시즌 연봉 (만원)
}
