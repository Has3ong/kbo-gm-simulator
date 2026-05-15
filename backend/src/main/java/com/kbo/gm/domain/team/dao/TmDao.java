package com.kbo.gm.domain.team.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TmDao {
    private Long tmId;             // 팀 ID
    private String tmKrNm;         // 팀 한국어 이름
    private String tmEngNm;        // 팀 영어 이름
    private String tmShrtKrNm;     // 팀 한국어 약칭
    private String tmShrtEngNm;    // 팀 영어 약칭
    private LocalDate tmEstblshDt; // 팀 창단일
    private String cityCd;         // 연고지 코드
    private String cityNm;         // 연고지 이름
    private Long stdmId;           // 홈 구장 ID
    private String stdmKrNm;       // 홈 구장 한국어 이름
    private String emblemCd;       // 엠블럼 파일 키
    private String ciClr;          // 팀 CI 색상 (HEX)
}
