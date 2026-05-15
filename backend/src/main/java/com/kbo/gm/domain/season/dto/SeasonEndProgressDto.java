package com.kbo.gm.domain.season.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeasonEndProgressDto {

    private int step;       // 현재 단계 번호 (1~14)
    private int total;      // 전체 단계 수 (14)
    private String message; // 단계 설명 메시지
    private boolean done;   // 모든 단계 완료 여부
    private String error;   // 오류 메시지 (오류 발생 시)
    private int ssntYr;     // 정산 대상 시즌 연도
}
