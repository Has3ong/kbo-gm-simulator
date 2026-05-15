package com.kbo.gm.domain.player.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PlrPosnDao {
    private Long plrId;           // 선수 ID
    private String posnCd;        // 포지션 코드 (SP: 선발투수, C: 포수, SS: 유격수 등)
    private String posnNm;        // 포지션 한국어 이름
    private Integer posnPrfcAblt; // 포지션 숙련도 능력치 (20~80, 해당 포지션 수비 적합도)
}
