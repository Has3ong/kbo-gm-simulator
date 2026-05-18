package com.kbo.gm.domain.team.dto;

import com.kbo.gm.domain.team.dao.TmFinLogDao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TmFinLogResponse {
    private Long logId;
    private Long tmId;
    private Integer ssntYr;
    private String logDt;
    private String logTypeCd;
    private String logCtgrCd;
    private Long amount;
    private String memo;
    private String createdAt;

    public static TmFinLogResponse from(TmFinLogDao dao) {
        return TmFinLogResponse.builder()
                .logId(dao.getLogId())
                .tmId(dao.getTmId())
                .ssntYr(dao.getSsntYr())
                .logDt(dao.getLogDt())
                .logTypeCd(dao.getLogTypeCd())
                .logCtgrCd(dao.getLogCtgrCd())
                .amount(dao.getAmount())
                .memo(dao.getMemo())
                .createdAt(dao.getCreatedAt())
                .build();
    }
}
