package com.kbo.gm.domain.game.dto;

import com.kbo.gm.domain.game.dao.GameDao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameResponse {
    private Long gameId;
    private Integer ssntYr;
    private LocalDate gameDt;
    private Long homeTmId;
    private String homeTmKrNm;
    private Long awayTmId;
    private String awayTmKrNm;
    private Long stdmId;
    private String stdmKrNm;
    private Integer homeScore;
    private Integer awayScore;
    private String gameSttsCd;
    private String gameSttsNm;
    private String gameTypeCd;
    private String gameTypeNm;

    public static GameResponse from(GameDao dao) {
        return GameResponse.builder()
                .gameId(dao.getGameId())
                .ssntYr(dao.getSsntYr())
                .gameDt(dao.getGameDt())
                .homeTmId(dao.getHomeTmId())
                .homeTmKrNm(dao.getHomeTmKrNm())
                .awayTmId(dao.getAwayTmId())
                .awayTmKrNm(dao.getAwayTmKrNm())
                .stdmId(dao.getStdmId())
                .stdmKrNm(dao.getStdmKrNm())
                .homeScore(dao.getHomeScore())
                .awayScore(dao.getAwayScore())
                .gameSttsCd(dao.getGameSttsCd())
                .gameSttsNm(dao.getGameSttsNm())
                .gameTypeCd(dao.getGameTypeCd())
                .gameTypeNm(dao.getGameTypeNm())
                .build();
    }
}
