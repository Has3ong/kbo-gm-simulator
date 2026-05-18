package com.kbo.gm.domain.season.service;

import com.kbo.gm.domain.season.dao.SpringCampCfgDao;
import com.kbo.gm.domain.season.mapper.SpringCampCfgMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SpringCampCfgService {

    private final SpringCampCfgMapper springCampCfgMapper;

    public List<SpringCampCfgDao> findAll() {
        return springCampCfgMapper.findAll();
    }

    public SpringCampCfgDao findByCampCd(String campCd) {
        SpringCampCfgDao dao = springCampCfgMapper.findByCampCd(campCd);
        if (dao == null) throw new IllegalArgumentException("스프링 캠프 코드를 찾을 수 없습니다: " + campCd);
        return dao;
    }

    public void update(SpringCampCfgDao dao) {
        springCampCfgMapper.update(dao);
    }
}
