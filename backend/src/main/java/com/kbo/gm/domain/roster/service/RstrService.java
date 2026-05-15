package com.kbo.gm.domain.roster.service;

import com.kbo.gm.domain.roster.dao.PlrEntyDao;
import com.kbo.gm.domain.roster.dto.RstrMoveRequest;
import com.kbo.gm.domain.roster.dto.RstrResponse;
import com.kbo.gm.domain.roster.mapper.RstrMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class RstrService {

    private static final int MAX_ENTRY = 28;

    private final RstrMapper rstrMapper;

    @Transactional(readOnly = true)
    public List<RstrResponse> getRoster(Long tmId, Integer ssntYr) {
        return rstrMapper.findRoster(tmId, ssntYr).stream().map(RstrResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<RstrResponse> getEntry(Long tmId, Integer ssntYr) {
        return rstrMapper.findEntry(tmId, ssntYr).stream().map(RstrResponse::from).toList();
    }

    public RstrResponse callup(Long tmId, RstrMoveRequest req) {
        LocalDate chngDt = parseDate(req.getChngDt());

        PlrEntyDao current = findAndValidate(req.getPlrId(), req.getSsntYr(), tmId);
        if ("1".equals(current.getEntyLvlCd()))
            throw new IllegalStateException("이미 1군 엔트리에 있는 선수입니다.");
        if ("INJ".equals(current.getPlrSttsCd()))
            throw new IllegalStateException("부상 선수는 1군 콜업이 불가합니다.");

        int entryCount = rstrMapper.countEntry(tmId, req.getSsntYr());
        if (entryCount >= MAX_ENTRY)
            throw new IllegalStateException("1군 엔트리가 가득 찼습니다 (" + MAX_ENTRY + "인).");

        rstrMapper.insertEntyHist(req.getPlrId(), tmId, req.getSsntYr(), "2", "1", chngDt, "CALLUP");
        rstrMapper.updateEntyLvl(req.getPlrId(), req.getSsntYr(), "1", chngDt);

        return RstrResponse.from(rstrMapper.findByPlrId(req.getPlrId(), req.getSsntYr()));
    }

    public RstrResponse option(Long tmId, RstrMoveRequest req) {
        LocalDate chngDt = parseDate(req.getChngDt());

        PlrEntyDao current = findAndValidate(req.getPlrId(), req.getSsntYr(), tmId);
        if ("2".equals(current.getEntyLvlCd()))
            throw new IllegalStateException("이미 2군에 있는 선수입니다.");

        rstrMapper.insertEntyHist(req.getPlrId(), tmId, req.getSsntYr(), "1", "2", chngDt, "OPTION");
        rstrMapper.updateEntyLvl(req.getPlrId(), req.getSsntYr(), "2", chngDt);

        return RstrResponse.from(rstrMapper.findByPlrId(req.getPlrId(), req.getSsntYr()));
    }

    public void initRoster(Long tmId, Integer ssntYr) {
        LocalDate today = LocalDate.now();
        List<Long> plrIds = rstrMapper.findActivePlayerIds(tmId);
        for (Long plrId : plrIds) {
            if (rstrMapper.findByPlrId(plrId, ssntYr) != null) continue;
            PlrEntyDao dao = PlrEntyDao.builder()
                    .plrId(plrId).ssntYr(ssntYr).tmId(tmId)
                    .entyLvlCd("2").entyDt(today)
                    .build();
            rstrMapper.insertEnty(dao);
            rstrMapper.insertEntyHist(plrId, tmId, ssntYr, null, "2", today, "INIT");
        }
    }

    private PlrEntyDao findAndValidate(Long plrId, Integer ssntYr, Long tmId) {
        PlrEntyDao current = rstrMapper.findByPlrId(plrId, ssntYr);
        if (current == null)
            throw new IllegalArgumentException("로스터에 등록되지 않은 선수입니다: " + plrId);
        if (!current.getTmId().equals(tmId))
            throw new IllegalArgumentException("해당 팀 소속 선수가 아닙니다.");
        return current;
    }

    private LocalDate parseDate(String dt) {
        return (dt != null && !dt.isBlank()) ? LocalDate.parse(dt) : LocalDate.now();
    }
}
