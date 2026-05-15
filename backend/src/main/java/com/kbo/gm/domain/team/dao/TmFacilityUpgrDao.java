package com.kbo.gm.domain.team.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TmFacilityUpgrDao {
    private Long upgrId;           // 업그레이드 ID
    private Long tmId;             // 팀 ID
    private String fcltyTypeCd;    // 시설 유형 코드
    private String fcltyTypeNm;    // 시설 유형 이름
    private Integer fromLvl;       // 이전 레벨
    private Integer toLvl;         // 업그레이드 후 레벨
    private Long upgrCost;         // 업그레이드 비용
    private LocalDate upgrBgngDt;  // 업그레이드 시작일
    private LocalDate upgrEndDt;   // 업그레이드 완료일
    private String upgrSttsCd;     // 업그레이드 상태 코드
}
