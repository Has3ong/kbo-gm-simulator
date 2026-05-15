package com.kbo.gm.domain.staff.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class StffDao {
    private Long stffId;         // 스태프 ID
    private String stffNm;       // 스태프 한국어 이름
    private String stffEngNm;    // 스태프 영어 이름
    private String stffTypeCd;   // 스태프 유형 코드 (MGR: 감독, COACH: 코치, SCOUT: 스카우터, TRNER: 트레이너)
    private String stffTypeNm;   // 스태프 유형 한국어 이름
    private String stffNtnlt;    // 국적
    private String stffFrgnYn;   // 외국인 여부 (Y/N)
    private LocalDate stffBrthDt; // 생년월일
    private Integer stffExpYr;   // 지도자 경력 연수
    private Long stffAnslSal;    // 연봉 (원)
    private String stffSttsCd;   // 스태프 상태 코드 (AT: 재직, RET: 은퇴 등)
    private Long tmId;           // 소속 팀 ID
    private String tmKrNm;       // 소속 팀 한국어 이름
}
