package com.kbo.gm.domain.roster.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class RstrMoveRequest {
    private Long plrId;
    private Integer ssntYr;
    private String chngDt; // ISO date (yyyy-MM-dd), 생략 시 오늘
}
