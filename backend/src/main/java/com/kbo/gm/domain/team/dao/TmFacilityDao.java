package com.kbo.gm.domain.team.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TmFacilityDao {
    private Long tmId;           // 팀 ID
    private String fcltyTypeCd;  // 시설 유형 코드 (TRNG: 훈련시설, MED: 의료시설 등)
    private String fcltyTypeNm;  // 시설 유형 한국어 이름
    private Integer fcltyLvl;    // 시설 레벨 (1~5, 높을수록 선수 성장·회복에 유리)
}
