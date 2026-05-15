package com.kbo.gm.domain.record.mapper;

import com.kbo.gm.domain.record.dao.BatrSsntRecDao;
import com.kbo.gm.domain.record.dao.PtchSsntRecDao;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RecordMapper {
    List<BatrSsntRecDao> findBatterStats(@Param("ssntYr") Integer ssntYr, @Param("tmId") Long tmId);
    List<PtchSsntRecDao> findPitcherStats(@Param("ssntYr") Integer ssntYr, @Param("tmId") Long tmId);
}
