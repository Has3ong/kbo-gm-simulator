package com.kbo.gm.domain.dev.service;

import com.kbo.gm.domain.dev.dto.FcltyCostRow;
import com.kbo.gm.domain.dev.dto.FcltyCostUpdateRequest;
import com.kbo.gm.domain.dev.mapper.DevMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DevService {

    private final DevMapper devMapper;

    /** 전체 시설 업그레이드 비용 설정 조회 */
    public List<FcltyCostRow> findAllFcltyCosts() {
        return devMapper.findAllFcltyCosts();
    }

    /** 시설 업그레이드 비용 일괄 수정 */
    @Transactional
    public void updateFcltyCosts(FcltyCostUpdateRequest req) {
        for (FcltyCostRow row : req.getRows()) {
            devMapper.updateFcltyCost(
                    row.getFcltyTypeCd(),
                    row.getFromLvl(),
                    row.getUpgrCost(),
                    row.getUpgrDays()
            );
        }
    }
}
