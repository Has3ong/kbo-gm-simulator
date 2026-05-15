package com.kbo.gm.domain.roster.mapper;

import com.kbo.gm.domain.roster.dao.PlrEntyDao;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

@Mapper
public interface RstrMapper {

    List<PlrEntyDao> findRoster(@Param("tmId") Long tmId, @Param("ssntYr") Integer ssntYr);

    List<PlrEntyDao> findEntry(@Param("tmId") Long tmId, @Param("ssntYr") Integer ssntYr);

    PlrEntyDao findByPlrId(@Param("plrId") Long plrId, @Param("ssntYr") Integer ssntYr);

    int countEntry(@Param("tmId") Long tmId, @Param("ssntYr") Integer ssntYr);

    List<Long> findActivePlayerIds(@Param("tmId") Long tmId);

    void insertEnty(PlrEntyDao dao);

    void updateEntyLvl(@Param("plrId") Long plrId,
                       @Param("ssntYr") Integer ssntYr,
                       @Param("entyLvlCd") String entyLvlCd,
                       @Param("entyDt") LocalDate entyDt);

    void insertEntyHist(@Param("plrId") Long plrId,
                        @Param("tmId") Long tmId,
                        @Param("ssntYr") Integer ssntYr,
                        @Param("fromEntyLvl") String fromEntyLvl,
                        @Param("toEntyLvl") String toEntyLvl,
                        @Param("chngDt") LocalDate chngDt,
                        @Param("chngRsnCd") String chngRsnCd);
}
