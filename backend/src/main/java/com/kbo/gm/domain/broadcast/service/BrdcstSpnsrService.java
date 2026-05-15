package com.kbo.gm.domain.broadcast.service;

import com.kbo.gm.common.util.GameUtil;
import com.kbo.gm.domain.broadcast.dao.BrdcstSpnsrDao;
import com.kbo.gm.domain.broadcast.dto.BrdcstSpnsrResponse;
import com.kbo.gm.domain.broadcast.mapper.BrdcstSpnsrMapper;
import com.kbo.gm.domain.staff.service.StffHireService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Slf4j
@Service
@RequiredArgsConstructor
public class BrdcstSpnsrService {

    private final BrdcstSpnsrMapper mapper;
    private final JdbcTemplate jdbcTemplate;
    private final StffHireService stffHireService;

    public List<BrdcstSpnsrResponse> findAll() {
        return mapper.findAll().stream().map(BrdcstSpnsrResponse::from).toList();
    }

    public BrdcstSpnsrResponse findSelected() {
        String selectedCode = mapper.findSelectedCode();
        if (selectedCode == null) return null;
        BrdcstSpnsrDao dao = mapper.findByCode(selectedCode);
        return dao != null ? BrdcstSpnsrResponse.from(dao) : null;
    }

    public void deleteSelection() {
        mapper.deleteSelection();
    }

    public void select(String brdcstCd) {
        BrdcstSpnsrDao spnsr = mapper.findByCode(brdcstCd);
        if (spnsr == null) {
            throw new IllegalArgumentException("유효하지 않은 방송국 코드입니다: " + brdcstCd);
        }

        boolean isFirstSelect = mapper.findSelectedCode() == null;
        mapper.upsertSelection(brdcstCd);

        // 유저 팀 TM_BRDCST 저장
        Long userTmIdForBrdcst = mapper.findUserTmId();
        Integer ssntYrForBrdcst = mapper.findCurrentSsntYr();
        if (userTmIdForBrdcst != null && ssntYrForBrdcst != null) {
            mapper.insertTmBrdcst(userTmIdForBrdcst, ssntYrForBrdcst, brdcstCd);
        }

        // 최초 계약 시에만 계약금 즉시 수익 반영 + 스태프 후보 생성 + AI 방송국 계약
        if (isFirstSelect) {
            applyContractFee(spnsr);
            try {
                stffHireService.onBrdcstSelected();
            } catch (Exception e) {
                log.warn("스태프 후보 생성 실패 (무시): {}", e.getMessage());
            }
            selectAiBroadcasters();
        }
        createBrdcstEvnt(spnsr);
    }

    private void selectAiBroadcasters() {
        Integer ssntYr = mapper.findCurrentSsntYr();
        String curDt = mapper.findCurrentDate();
        Long userTmId = mapper.findUserTmId();
        if (ssntYr == null || curDt == null || userTmId == null) return;

        List<BrdcstSpnsrDao> allBrdcst = mapper.findAll();
        if (allBrdcst.isEmpty()) return;

        List<Map<String, Object>> aiTms = jdbcTemplate.queryForList(
            "SELECT TM_ID, TM_KR_NM FROM TM WHERE TM_ID != ?", userTmId);

        Random rnd = new Random();
        StringBuilder html = new StringBuilder();
        html.append("<div style='font-family:inherit;'>");
        html.append("<p style='margin:0 0 12px;color:#555;'>각 구단의 방송국 계약 현황입니다.</p>");
        html.append("<table style='width:100%;border-collapse:collapse;'>");
        html.append("<thead><tr style='background:#f5f5f5;'>");
        html.append("<th style='padding:6px 10px;text-align:left;border-bottom:2px solid #ccc;'>구단</th>");
        html.append("<th style='padding:6px 10px;text-align:left;border-bottom:2px solid #ccc;'>방송국</th>");
        html.append("</tr></thead><tbody>");

        for (Map<String, Object> tm : aiTms) {
            Object tmIdObj = tm.get("TM_ID");
            Long aiTmId = tmIdObj instanceof Number n ? n.longValue() : null;
            String tmNm = (String) tm.get("TM_KR_NM");
            BrdcstSpnsrDao brdcst = allBrdcst.get(rnd.nextInt(allBrdcst.size()));

            // AI 팀 TM_BRDCST 저장
            if (aiTmId != null) {
                mapper.insertTmBrdcst(aiTmId, ssntYr, brdcst.getBrdcstCd());
            }

            html.append("<tr>");
            html.append("<td style='padding:5px 10px;border-bottom:1px solid #eee;font-weight:bold;'>")
                .append(tmNm != null ? tmNm : "-").append("</td>");
            html.append("<td style='padding:5px 10px;border-bottom:1px solid #eee;'>")
                .append(brdcst.getBrdcstNm()).append("</td>");
            html.append("</tr>");
        }
        html.append("</tbody></table></div>");

        Map<String, Object> evnt = new HashMap<>();
        evnt.put("ssntYr", ssntYr);
        evnt.put("evntDt", curDt);
        evnt.put("tmId", userTmId);
        evnt.put("evntTypeCd", "BRDCST");
        evnt.put("ttlt", ssntYr + "년 타 구단 방송국 계약 현황");
        evnt.put("cnts", html.toString());
        mapper.insertBrdcstEvnt(evnt);
        log.info("AI 구단 방송국 계약 현황 뉴스 생성 완료 ({}개 구단)", aiTms.size());
    }

    private void createBrdcstEvnt(BrdcstSpnsrDao spnsr) {
        Long userTmId = mapper.findUserTmId();
        Integer ssntYr = mapper.findCurrentSsntYr();
        String curDt = mapper.findCurrentDate();
        if (userTmId == null || ssntYr == null || curDt == null) return;

        Map<String, Object> evnt = new HashMap<>();
        evnt.put("ssntYr", ssntYr);
        evnt.put("evntDt", curDt);
        evnt.put("tmId", userTmId);
        evnt.put("evntTypeCd", "BRDCST");
        evnt.put("ttlt", spnsr.getBrdcstNm() + " 방송국 계약 체결");
        evnt.put("cnts", spnsr.getBrdcstNm() + " 방송국과 계약을 체결했습니다.\n"
                + "계약금: " + GameUtil.fmtMan(spnsr.getCntrctFee()) + "\n"
                + "승리당 보너스: " + GameUtil.fmtMan(spnsr.getWinBonus()) + "\n"
                + "포스트시즌 보너스: " + GameUtil.fmtMan(spnsr.getPostBonus()) + "\n"
                + "한국시리즈 보너스: " + GameUtil.fmtMan(spnsr.getKsBonus()));
        mapper.insertBrdcstEvnt(evnt);
    }

    private void applyContractFee(BrdcstSpnsrDao spnsr) {
        Long userTmId = mapper.findUserTmId();
        Integer ssntYr = mapper.findCurrentSsntYr();
        if (userTmId == null || ssntYr == null) return;

        long cntrctFee = spnsr.getCntrctFee();
        jdbcTemplate.update(
                "INSERT INTO TM_FNC_SSNT (TM_ID, SSNT_YR, BCST_REV) " +
                "VALUES (?, ?, ?) " +
                "ON DUPLICATE KEY UPDATE " +
                "    BCST_REV = COALESCE(BCST_REV, 0) + VALUES(BCST_REV), " +
                "    CUR_CASH = COALESCE(CUR_CASH, 0) + VALUES(BCST_REV)",
                userTmId, ssntYr, cntrctFee
        );
        log.info("방송국 계약금 즉시 정산: {} {} → {}만원", spnsr.getBrdcstNm(), ssntYr, cntrctFee);
    }
}
