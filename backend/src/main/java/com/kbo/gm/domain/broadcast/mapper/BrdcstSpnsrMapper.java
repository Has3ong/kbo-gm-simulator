package com.kbo.gm.domain.broadcast.mapper;

import com.kbo.gm.domain.broadcast.dao.BrdcstSpnsrDao;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface BrdcstSpnsrMapper {
    List<BrdcstSpnsrDao> findAll();
    BrdcstSpnsrDao findByCode(@Param("brdcstCd") String brdcstCd);
    String findSelectedCode();
    void upsertSelection(@Param("brdcstCd") String brdcstCd);
    void deleteSelection();
    Long findUserTmId();
    Integer findCurrentSsntYr();
    String findCurrentDate();
    void insertBrdcstEvnt(@Param("evnt") Map<String, Object> evnt);
    void insertTmBrdcst(@Param("tmId") Long tmId, @Param("ssntYr") int ssntYr, @Param("brdcstCd") String brdcstCd);
}
