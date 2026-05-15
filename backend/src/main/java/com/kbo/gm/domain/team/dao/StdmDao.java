package com.kbo.gm.domain.team.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class StdmDao {
    private Long stdmId;         // 경기장ID
    private String stdmKrNm;     // 한글명
    private String stdmEngNm;    // 영문명
    private String stdmLoc;      // 소재지
    private String stdmEstblshDt; // 개장일자
    private Integer stdmSeatCnt; // 좌석수
    private Integer lfDist;      // 좌펜스 거리
    private Integer lcfDist;     // 좌중간 펜스 거리
    private Integer cfDist;      // 중앙 펜스 거리
    private Integer rcfDist;     // 우중간 펜스 거리
    private Integer rfDist;      // 우펜스 거리
    private String turfTypeCd;   // 잔디종류코드
    private String turfTypeNm;   // 잔디종류명
}
