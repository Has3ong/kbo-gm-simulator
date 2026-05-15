package com.kbo.gm.domain.dev.mapper;

import com.kbo.gm.domain.dev.dto.FcltyCostRow;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface DevMapper {
    /** 전체 시설 업그레이드 비용 설정 조회 */
    List<FcltyCostRow> findAllFcltyCosts();

    /** 특정 시설·레벨의 업그레이드 비용 업데이트 */
    void updateFcltyCost(@Param("fcltyTypeCd") String fcltyTypeCd,
                         @Param("fromLvl") int fromLvl,
                         @Param("upgrCost") long upgrCost,
                         @Param("upgrDays") int upgrDays);
}
