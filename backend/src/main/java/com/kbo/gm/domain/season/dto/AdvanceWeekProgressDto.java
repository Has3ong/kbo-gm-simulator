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
    private String  dayOfWeek;       // 현재 처리 중인 날짜의 요일 (한국어)
    private boolean weeklyRequired;  // 완료 후 주간 처리 실행 필요 여부 (REG/POST)
}
