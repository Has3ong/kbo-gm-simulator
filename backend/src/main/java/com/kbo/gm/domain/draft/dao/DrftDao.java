package com.kbo.gm.domain.draft.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class DrftDao {
    private Long drftId;        // 드래프트 ID
    private Integer ssntYr;     // 시즌 연도
    private LocalDate drftDt;   // 드래프트 날짜
    private String drftSttsCd;  // 드래프트 상태코드 (CREATED/SCOUTING/READY/IN_PROGRESS/COMPLETED/CANCELLED)
    private Integer rndCnt;     // 라운드 수
    private Integer maxPickCnt; // 최대 지명 수
    private Long userTmId;      // 유저 팀 ID
    private Integer totalPicked; // 전체 지명 완료 수 (집계)
    private Integer myPickCnt;   // 유저 팀 지명 수 (집계)
    private Integer currentPickNo; // 현재 진행 중인 픽 번호
}
