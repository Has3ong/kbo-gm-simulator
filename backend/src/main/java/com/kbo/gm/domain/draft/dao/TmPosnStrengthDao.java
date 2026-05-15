package com.kbo.gm.domain.draft.dao;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TmPosnStrengthDao {
    private String reprPosnCd;  // 대표 포지션 코드 (10=투수, 20=포수, 21=내야수, 22=외야수)
    private Integer plrCnt;     // 해당 포지션 활성 선수 수
    private Double avgOvrl;     // 해당 포지션 평균 현재 능력치
}
