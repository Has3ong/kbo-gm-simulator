package com.kbo.gm.domain.record.service;

import com.kbo.gm.domain.record.dto.BatrSsntRecResponse;
import com.kbo.gm.domain.record.dto.PtchSsntRecResponse;
import com.kbo.gm.domain.record.mapper.RecordMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecordService {

    private final RecordMapper recordMapper;

    public List<BatrSsntRecResponse> findBatterStats(Integer ssntYr, Long tmId) {
        return recordMapper.findBatterStats(ssntYr, tmId).stream().map(BatrSsntRecResponse::from).toList();
    }

    public List<PtchSsntRecResponse> findPitcherStats(Integer ssntYr, Long tmId) {
        return recordMapper.findPitcherStats(ssntYr, tmId).stream().map(PtchSsntRecResponse::from).toList();
    }
}
