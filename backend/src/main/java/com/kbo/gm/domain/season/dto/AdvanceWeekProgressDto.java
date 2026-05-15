package com.kbo.gm.domain.season.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdvanceWeekProgressDto {
    private int    processedDays;
    private int    totalDays;
    private String currentDate;
    private String targetDate;
    private String message;
    private boolean done;
    private String  error;
    private int     ssntYr;
}
