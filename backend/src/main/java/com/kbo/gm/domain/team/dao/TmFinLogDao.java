package com.kbo.gm.domain.team.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TmFinLogDao {
    private Long logId;
    private Long tmId;
    private Integer ssntYr;
    private String logDt;
    private String logTypeCd;   // INCOME / EXPENSE
    private String logCtgrCd;   // SPRING_CAMP, FCLTY_UPGR, STDM_EXP, TICKET, SPONSOR, BROADCAST, SALARY, OTHER
    private Long amount;
    private String memo;
    private String createdAt;
}
