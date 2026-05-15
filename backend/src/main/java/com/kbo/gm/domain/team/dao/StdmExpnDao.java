package com.kbo.gm.domain.team.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class StdmExpnDao {
    private Long expnId;         // 증축ID
    private Long stdmId;         // 경기장ID
    private Long tmId;           // 팀ID
    private Integer bfrSeatCnt;  // 증축 전 좌석수
    private Integer aftSeatCnt;  // 증축 후 좌석수
    private Long expnCost;       // 증축 비용
    private LocalDate expnBgngDt; // 공사 시작일
    private LocalDate expnEndDt;  // 완료 예정일
    private String expnSttsCd;   // 상태코드
    private String expnSttsNm;   // 상태명
}
