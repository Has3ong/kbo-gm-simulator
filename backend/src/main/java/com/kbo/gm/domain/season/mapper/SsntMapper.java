package com.kbo.gm.domain.season.mapper;

import com.kbo.gm.domain.season.dao.SsntDao;
import com.kbo.gm.domain.season.dao.SsntEvntDao;
import com.kbo.gm.domain.season.dao.StndDao;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SsntMapper {
    List<SsntDao> findAll();
    SsntDao findByYear(@Param("ssntYr") Integer ssntYr);
    List<StndDao> findStandings(@Param("ssntYr") Integer ssntYr);
    List<StndDao> findStandingsByTeam(@Param("tmId") Long tmId);
    List<SsntEvntDao> findEvents(@Param("ssntYr") Integer ssntYr,
                                  @Param("tmId") Long tmId,
                                  @Param("evntTypeCd") String evntTypeCd,
                                  @Param("offset") int offset,
                                  @Param("size") int size);

    int countEvents(@Param("ssntYr") Integer ssntYr,
                    @Param("tmId") Long tmId,
                    @Param("evntTypeCd") String evntTypeCd);

    void markEventRead(@Param("evntId") Long evntId);

    void advanceDate(@Param("ssntYr") Integer ssntYr);
    void updateSsntStatus(@Param("ssntYr") Integer ssntYr, @Param("sttsCd") String sttsCd);

    // 날짜 진행 전 필수 이벤트 체크
    Integer countIncompleteGamesOnDate(@Param("ssntYr") Integer ssntYr, @Param("curDt") String curDt);

    String findCfgVal(@Param("cfgKey") String cfgKey);
}
