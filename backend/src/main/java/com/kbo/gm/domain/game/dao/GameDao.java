package com.kbo.gm.domain.game.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class GameDao {
    private Long gameId;          // 경기 ID
    private Integer ssntYr;       // 시즌 연도
    private LocalDate gameDt;     // 경기 날짜
    private Long homeTmId;        // 홈팀 ID
    private String homeTmKrNm;    // 홈팀 한국어 이름
    private Long awayTmId;        // 원정팀 ID
    private String awayTmKrNm;    // 원정팀 한국어 이름
    private Long stdmId;          // 경기 구장 ID
    private String stdmKrNm;      // 경기 구장 한국어 이름
    private Integer homeScore;    // 홈팀 최종 점수
    private Integer awayScore;    // 원정팀 최종 점수
    private String gameSttsCd;    // 경기 상태 코드
    private String gameSttsNm;    // 경기 상태 한국어 이름
    private String gameTypeCd;    // 경기 유형 코드
    private String gameTypeNm;    // 경기 유형 한국어 이름
}
