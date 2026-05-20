package com.kbo.gm.domain.game.service;

import com.kbo.gm.domain.game.dao.GameDao;
import com.kbo.gm.domain.game.dto.GameResponse;
import com.kbo.gm.domain.game.mapper.GameMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GameService {

    private final GameMapper gameMapper;

    public List<GameResponse> findAll(Integer ssntYr, Integer mon, LocalDate gameDt, Long tmId) {
        return gameMapper.findAll(ssntYr, mon, gameDt, tmId).stream().map(GameResponse::from).toList();
    }

    public GameResponse findById(Long gameId) {
        GameDao dao = gameMapper.findById(gameId);
        if (dao == null) throw new IllegalArgumentException("경기를 찾을 수 없습니다: " + gameId);
        return GameResponse.from(dao);
    }

    public Map<String, Object> findRecords(Long gameId) {
        return Map.of(
            "batters",  gameMapper.findBatterRecords(gameId),
            "pitchers", gameMapper.findPitcherRecords(gameId)
        );
    }

    public List<Map<String, Object>> findRotationPitchersByTeam(Long tmId, Integer ssntYr) {
        return gameMapper.findRotationPitchersByTeam(tmId, ssntYr);
    }
}
