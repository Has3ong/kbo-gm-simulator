package com.kbo.gm.domain.staff.mapper;

import com.kbo.gm.domain.staff.dao.StffAbltDao;
import com.kbo.gm.domain.staff.dao.StffDao;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface StffMapper {
    List<StffDao> findAll(@Param("tmId") Long tmId, @Param("stffTypeCd") String stffTypeCd);
    StffDao findById(@Param("stffId") Long stffId);
    List<StffAbltDao> findAbilities(@Param("stffId") Long stffId);
}
