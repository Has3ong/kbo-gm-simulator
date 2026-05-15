package com.kbo.gm.domain.staff.service;

import com.kbo.gm.domain.staff.dao.StffDao;
import com.kbo.gm.domain.staff.dto.StffAbltResponse;
import com.kbo.gm.domain.staff.dto.StffResponse;
import com.kbo.gm.domain.staff.mapper.StffMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StffService {

    private final StffMapper stffMapper;

    public List<StffResponse> findAll(Long tmId, String stffTypeCd) {
        return stffMapper.findAll(tmId, stffTypeCd).stream().map(StffResponse::from).toList();
    }

    public StffResponse findById(Long stffId) {
        StffDao dao = stffMapper.findById(stffId);
        if (dao == null) throw new IllegalArgumentException("스태프를 찾을 수 없습니다: " + stffId);
        return StffResponse.from(dao);
    }

    public List<StffAbltResponse> findAbilities(Long stffId) {
        return stffMapper.findAbilities(stffId).stream().map(StffAbltResponse::from).toList();
    }
}
