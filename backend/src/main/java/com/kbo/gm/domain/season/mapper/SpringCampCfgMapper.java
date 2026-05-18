package com.kbo.gm.domain.season.mapper;

import com.kbo.gm.domain.season.dao.SpringCampCfgDao;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface SpringCampCfgMapper {
    List<SpringCampCfgDao> findAll();
    SpringCampCfgDao findByCampCd(@Param("campCd") String campCd);
    void update(SpringCampCfgDao dao);
}
