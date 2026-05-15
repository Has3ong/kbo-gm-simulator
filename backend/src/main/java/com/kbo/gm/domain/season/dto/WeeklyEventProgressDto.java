package com.kbo.gm.domain.season.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeeklyEventProgressDto {
    private int step;
    private int total;
    private String message;
    private boolean done;
    private String error;
    private int ssntYr;
    private String weekDt;
}
