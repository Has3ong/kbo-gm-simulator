package com.kbo.gm.domain.season.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SsntEvntDao {
    private Long evntId;        // 이벤트 ID
    private Integer ssntYr;     // 시즌 연도
    private LocalDate evntDt;   // 이벤트 발생 날짜
    private Long tmId;          // 관련 팀 ID
    private String tmKrNm;      // 관련 팀 한국어 이름
    private Long plrId;         // 관련 선수 ID (선수 무관 이벤트는 null)
    private String plrNm;       // 관련 선수 이름
    private String evntTypeCd;  // 이벤트 유형 코드 (INJ: 부상, TRD: 트레이드, WARN: 구단주경고 등)
    private String evntTypeNm;  // 이벤트 유형 한국어 이름
    private String evntTtlt;    // 이벤트 제목
    private String evntCnts;    // 이벤트 본문 내용
    private String rdYn;        // 읽기 여부 (0=미읽음, 1=읽음)
}
