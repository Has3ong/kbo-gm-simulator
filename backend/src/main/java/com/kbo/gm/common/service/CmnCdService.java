package com.kbo.gm.common.service;

import com.kbo.gm.common.entity.CmnCd;
import com.kbo.gm.common.mapper.CmnCdMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CmnCdService {

    private final CmnCdMapper cmnCdMapper;

    public List<CmnCd> findAll() {
        return cmnCdMapper.findAll();
    }

    public List<CmnCd> findByCdId(String cdId) {
        return cmnCdMapper.findByCdId(cdId);
    }

    public CmnCd findByCdIdAndCdVal(String cdId, String cdVal) {
        CmnCd code = cmnCdMapper.findByCdIdAndCdVal(cdId, cdVal);
        if (code == null) throw new IllegalArgumentException("코드를 찾을 수 없습니다: " + cdId + "/" + cdVal);
        return code;
    }

    public void updateCode(String cdId, String cdVal, String cdNm, String cdEngNm, String cdDesc) {
        cmnCdMapper.updateCode(cdId, cdVal, cdNm, cdEngNm, cdDesc);
    }

    public void insertCode(CmnCd code) {
        CmnCd existing = cmnCdMapper.findByCdIdAndCdVal(code.getCdId(), code.getCdVal());
        if (existing != null) {
            throw new IllegalArgumentException("이미 존재하는 코드입니다: " + code.getCdId() + "/" + code.getCdVal());
        }
        cmnCdMapper.insertCode(code);
    }

    public void deleteCode(String cdId, String cdVal) {
        cmnCdMapper.deleteCode(cdId, cdVal);
    }
}
