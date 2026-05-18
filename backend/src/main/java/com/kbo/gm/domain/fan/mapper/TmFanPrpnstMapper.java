package com.kbo.gm.domain.fan.mapper;

import com.kbo.gm.domain.fan.dao.TmFanPrpnstDao;
import com.kbo.gm.domain.fan.dto.TmFanPrpnstRequest;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TmFanPrpnstMapper {
    TmFanPrpnstDao findByTmId(@Param("tmId") Long tmId);
    List<TmFanPrpnstDao> findAll();
    void upsert(@Param("req") TmFanPrpnstRequest req, @Param("tmId") Long tmId);
}
