package com.kbo.gm.domain.player.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PlrInjryHistDao {
    private Long evntId;       // 이벤트 ID
    private Integer ssntYr;    // 시즌 연도
    private LocalDate evntDt;  // 이벤트 발생일
    private String evntTypeCd; // 이벤트 유형 (INJ/RCV)
    private String evntTtlt;   // 이벤트 제목
    private String evntCnts;   // 이벤트 내용
}
