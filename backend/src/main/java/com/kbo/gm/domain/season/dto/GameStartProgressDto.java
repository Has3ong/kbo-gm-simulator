package com.kbo.gm.domain.season.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameStartProgressDto {
    private int step;       // 현재 단계 번호 (1~14)
    private int total;      // 전체 단계 수 (14)
    private String message; // 단계 설명 메시지 (한국어)
    private boolean done;   // 모든 단계 완료 여부
    private String error;   // 오류 메시지 (오류 발생 시만 non-null)
    private Long userTmId;  // 완료 시 유저 팀 ID (done=true 일 때만 포함)
    private Integer ssntYr; // 완료 시 시즌 연도 (done=true 일 때만 포함)
}
