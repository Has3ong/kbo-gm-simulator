package com.kbo.gm.domain.owner.mapper;

import com.kbo.gm.domain.owner.dao.TmOwnPrpnstDao;
import com.kbo.gm.domain.owner.dto.TmOwnPrpnstRequest;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface TmOwnPrpnstMapper {
    TmOwnPrpnstDao findByTmId(@Param("tmId") Long tmId);
    List<TmOwnPrpnstDao> findAll();
    void upsert(@Param("req") TmOwnPrpnstRequest req, @Param("tmId") Long tmId);
}
