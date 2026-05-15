package com.kbo.gm.common.mapper;

import com.kbo.gm.common.entity.CmnCd;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CmnCdMapper {
    List<CmnCd> findAll();
    List<CmnCd> findByCdId(@Param("cdId") String cdId);
    CmnCd findByCdIdAndCdVal(@Param("cdId") String cdId, @Param("cdVal") String cdVal);
    void updateCode(@Param("cdId") String cdId, @Param("cdVal") String cdVal,
                    @Param("cdNm") String cdNm, @Param("cdEngNm") String cdEngNm,
                    @Param("cdDesc") String cdDesc);
}
