package com.kbo.gm.domain.draft.service;

import com.kbo.gm.domain.draft.dao.*;
import com.kbo.gm.domain.draft.dto.*;
import com.kbo.gm.domain.draft.mapper.DrftMapper;
import com.kbo.gm.util.AbilityGradeConverter;
import com.kbo.gm.util.KoreanNameGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Transactional
public class DrftService {

    private final DrftMapper drftMapper;

    private static final int DEFAULT_POOL_SIZE = 400;
    private static final int DEFAULT_SCOUTING_ACCURACY = 5;

    // 포지션 분포: [포지션코드, 대표포지션코드, 누적확률]
    private static final Object[][] POSN_DIST = {
        {"10", "10", 0.25},  // SP  25%
        {"11", "10", 0.44},  // RP  19%
        {"12", "10", 0.50},  // CP   6%
        {"20", "20", 0.56},  // C    6%
        {"21", "21", 0.60},  // 1B   4%
        {"22", "21", 0.66},  // 2B   6%
        {"23", "21", 0.72},  // 3B   6%
        {"24", "21", 0.79},  // SS   7%
        {"25", "22", 0.85},  // LF   6%
        {"26", "22", 0.91},  // CF   6%
        {"27", "22", 0.96},  // RF   5%
        {"28", "22", 1.00},  // DH   4%
    };

    private static final String[] BAT_HAND = {"RR", "RL", "LL", "LR", "RS"};
    private static final double[] BAT_HAND_PROB = {0.50, 0.25, 0.15, 0.07, 0.03};

    // 출신 분포 (2025 KBO 기준: 고졸 1000 / 대졸 250 / 얼리 51 / 트라이아웃 20)
    private static final String[] ORGN_CODES = {"HS", "COL", "ERLY", "TRYO"};
    private static final double[] ORGN_PROB   = {0.7570, 0.1893, 0.0386, 0.0151};

    // 투수 능력치 코드
    private static final String[] PTCH_ABLTS = {"VEL", "CTL", "BRK", "STM", "P4S"};
    // 타자 능력치 코드
    private static final String[] BATR_ABLTS = {"CNT", "PWR", "RUN", "THR", "STL"};

    // ── 드래프트 조회 / 생성 ─────────────────────────────────────

    @Transactional(readOnly = true)
    public DrftResponse getByYear(Integer ssntYr, Long userTmId) {
        DrftDao dao = drftMapper.findByYear(ssntYr);
        if (dao == null) throw new IllegalArgumentException("드래프트를 찾을 수 없습니다: " + ssntYr);
        return DrftResponse.from(dao);
    }

    public DrftResponse createDrft(Integer ssntYr, Long userTmId, LocalDate drftDt) {
        DrftDao existing = drftMapper.findByYear(ssntYr);
        if (existing != null) return DrftResponse.from(existing);

        Long resolvedUserTmId = (userTmId == null || userTmId == 0L)
                ? drftMapper.findUserTmId()
                : userTmId;

        DrftDao dao = new DrftDao(null, ssntYr, drftDt, "CREATED", 11, 110, resolvedUserTmId, 0, 0, null);
        drftMapper.insertDrft(dao);
        return DrftResponse.from(drftMapper.findByYear(ssntYr));
    }

    // ── 드래프트 풀 생성 ─────────────────────────────────────────

    public DrftResponse generatePool(Long drftId, Long userTmId) {
        DrftDao drft = drftMapper.findById(drftId, userTmId);
        if (drft == null) throw new IllegalArgumentException("드래프트를 찾을 수 없습니다: " + drftId);
        if (!"CREATED".equals(drft.getDrftSttsCd()))
            throw new IllegalStateException("CREATED 상태에서만 풀 생성이 가능합니다.");

        Random rng = new Random(drftId);

        // 1. 선수 풀 생성 (배치 삽입)
        List<DrftPlrDao> players = generatePlayers(drftId, DEFAULT_POOL_SIZE, rng);
        drftMapper.insertPlayers(players);

        // 2. 다시 조회해서 drftPlrId 획득 (이 시점에는 스카우팅 리포트가 없으므로 tmId=null)
        List<DrftPlrDao> savedPlayers = drftMapper.findAvailablePlayersForAi(drftId, null);

        // 3. 팀 목록 조회
        List<Long> teamIds = drftMapper.findAllTeamIds();

        // 4. 팀별 스카우팅 리포트 생성 (배치 삽입)
        List<DrftScutRptDao> reports = generateScoutingReports(savedPlayers, teamIds, rng);
        drftMapper.insertScoutingReports(reports);

        // 5. 드래프트 순서 생성
        List<Long> draftOrder = buildDraftOrder(drft.getSsntYr(), teamIds);
        List<DrftOrdDao> orders = generateDraftOrders(drftId, drft.getRndCnt(), draftOrder);
        drftMapper.insertOrders(orders);

        // 6. 상태 → SCOUTING
        drftMapper.updateStatus(drftId, "SCOUTING");
        return DrftResponse.from(drftMapper.findById(drftId, userTmId));
    }

    private List<DrftPlrDao> generatePlayers(Long drftId, int count, Random rng) {
        List<DrftPlrDao> list = new ArrayList<>(count);
        for (int i = 0; i < count; i++) {
            String[] posn = selectPositionByWeight(rng);
            String posnCd = posn[0];
            String reprPosnCd = posn[1];
            boolean isPitcher = "10".equals(reprPosnCd);

            String orgnCd = selectByWeight(ORGN_CODES, ORGN_PROB, rng);
            int age = ageByOrigin(orgnCd, rng);
            int potAblt = randomPotential(rng);
            int ovrlAblt = randomCurrentAblt(potAblt, orgnCd, rng);

            String grwthTend = randomGrowth(rng);
            int injRsk = 5 + rng.nextInt(11); // 5~15

            String handCd = isPitcher
                    ? selectByWeight(new String[]{"RR", "LL", "LR"}, new double[]{0.65, 0.30, 0.05}, rng)
                    : selectByWeight(BAT_HAND, BAT_HAND_PROB, rng);

            String plrNm = KoreanNameGenerator.generate(rng);
            String hsNm = isPitcher || "HS".equals(orgnCd) ? randomHsName(rng) : null;
            String univNm = ("COL".equals(orgnCd) || "ERLY".equals(orgnCd) || "TRYO".equals(orgnCd)) ? randomUnivName(rng) : null;
            int plrHt = randomHeight(reprPosnCd, rng);
            int plrWt = randomWeight(plrHt, rng);
            String prevRec = generatePrevRec(isPitcher, ovrlAblt, orgnCd, rng);

            list.add(DrftPlrDao.builder()
                    .drftId(drftId)
                    .plrNm(plrNm)
                    .plrEngNm(null)
                    .plrAge(age)
                    .plrOrgnCd(orgnCd)
                    .hsNm(hsNm)
                    .univNm(univNm)
                    .plrHt(plrHt)
                    .plrWt(plrWt)
                    .prevRec(prevRec)
                    .posnCd(posnCd)
                    .reprPosnCd(reprPosnCd)
                    .plrBatPtchHandCd(handCd)
                    .actOvrlAblt(ovrlAblt)
                    .actPotAblt(potAblt)
                    .grwthTend(grwthTend)
                    .injRsk(injRsk)
                    .isPickYn("N")
                    .isExclYn("N")
                    .build());
        }
        return list;
    }

    private List<DrftScutRptDao> generateScoutingReports(List<DrftPlrDao> players,
                                                          List<Long> teamIds, Random rng) {
        List<DrftScutRptDao> list = new ArrayList<>(players.size() * teamIds.size());
        for (DrftPlrDao plr : players) {
            for (Long tmId : teamIds) {
                int accrcy = DEFAULT_SCOUTING_ACCURACY;
                int noise = (10 - accrcy) * 3;

                int estOvrl = clamp(plr.getActOvrlAblt() + gaussian(rng, noise), 20, 80);
                int estPot  = clamp(plr.getActPotAblt()  + gaussian(rng, noise), 20, 80);
                int estRnd  = estimateRound(estPot);
                String grade = AbilityGradeConverter.toGrade(estPot);
                String cmnt  = generateComment(plr, grade);

                list.add(DrftScutRptDao.builder()
                        .drftPlrId(plr.getDrftPlrId())
                        .tmId(tmId)
                        .estOvrlAblt(estOvrl)
                        .estPotAblt(estPot)
                        .estRnd(estRnd)
                        .accrcy(accrcy)
                        .grade(grade)
                        .cmnt(cmnt)
                        .build());
            }
        }
        return list;
    }

    private List<Long> buildDraftOrder(Integer ssntYr, List<Long> allTeamIds) {
        // 전년도 순위 역순 (최하위팀이 1순위)
        List<Long> prevOrder = drftMapper.findPrevSeasonStndOrder(ssntYr - 1);
        if (prevOrder != null && prevOrder.size() == allTeamIds.size()) {
            Collections.reverse(prevOrder);
            return prevOrder;
        }
        // 순위 데이터 없을 경우 팀 ID 역순 사용
        List<Long> defaultOrder = new ArrayList<>(allTeamIds);
        Collections.sort(defaultOrder, Collections.reverseOrder());
        return defaultOrder;
    }

    private List<DrftOrdDao> generateDraftOrders(Long drftId, int rndCnt, List<Long> teamOrder) {
        int teamCnt = teamOrder.size();
        List<DrftOrdDao> list = new ArrayList<>(rndCnt * teamCnt);
        int pickNo = 1;
        for (int rnd = 1; rnd <= rndCnt; rnd++) {
            for (int rndPick = 1; rndPick <= teamCnt; rndPick++) {
                Long tmId = teamOrder.get(rndPick - 1);
                list.add(DrftOrdDao.builder()
                        .drftId(drftId)
                        .pickNo(pickNo++)
                        .rnd(rnd)
                        .rndPickNo(rndPick)
                        .tmId(tmId)
                        .pickSttsCd("PENDING")
                        .build());
            }
        }
        return list;
    }

    // ── 드래프트 진행 ─────────────────────────────────────────────

    public DrftResponse startDraft(Long drftId, Long userTmId) {
        DrftDao drft = drftMapper.findById(drftId, userTmId);
        if (drft == null) throw new IllegalArgumentException("드래프트를 찾을 수 없습니다.");
        if (!"SCOUTING".equals(drft.getDrftSttsCd()) && !"READY".equals(drft.getDrftSttsCd()))
            throw new IllegalStateException("SCOUTING 또는 READY 상태에서만 시작 가능합니다.");
        drftMapper.updateStatus(drftId, "IN_PROGRESS");
        return DrftResponse.from(drftMapper.findById(drftId, userTmId));
    }

    public DrftOrdResponse pick(Long drftId, Long userTmId, DrftPickRequest req) {
        DrftDao drft = drftMapper.findById(drftId, userTmId);
        if (drft == null) throw new IllegalArgumentException("드래프트를 찾을 수 없습니다.");
        if (!"IN_PROGRESS".equals(drft.getDrftSttsCd()))
            throw new IllegalStateException("진행 중인 드래프트가 아닙니다.");

        DrftOrdDao currentPick = drftMapper.findCurrentPick(drftId);
        if (currentPick == null) {
            drftMapper.updateStatus(drftId, "COMPLETED");
            throw new IllegalStateException("드래프트가 완료되었습니다.");
        }
        if (!userTmId.equals(currentPick.getTmId()))
            throw new IllegalStateException("현재 픽은 유저 팀의 차례가 아닙니다.");

        return executePick(drftId, currentPick.getPickNo(), currentPick.getTmId(),
                req.getDrftPlrId(), drft.getSsntYr(), currentPick.getRnd());
    }

    public List<DrftOrdResponse> simulateUntilUserPick(Long drftId, Long userTmId) {
        DrftDao drft = drftMapper.findById(drftId, userTmId);
        if (drft == null) throw new IllegalArgumentException("드래프트를 찾을 수 없습니다.");
        if (!"IN_PROGRESS".equals(drft.getDrftSttsCd()))
            throw new IllegalStateException("진행 중인 드래프트가 아닙니다.");

        List<DrftOrdResponse> aiPicks = new ArrayList<>();
        while (true) {
            DrftOrdDao cur = drftMapper.findCurrentPick(drftId);
            if (cur == null) {
                drftMapper.updateStatus(drftId, "COMPLETED");
                break;
            }
            if (userTmId.equals(cur.getTmId())) break;

            DrftOrdResponse aiResult = aiPick(drftId, cur.getPickNo(), cur.getTmId(),
                    drft.getSsntYr(), cur.getRnd());
            aiPicks.add(aiResult);
        }
        return aiPicks;
    }

    private DrftOrdResponse aiPick(Long drftId, Integer pickNo, Long tmId,
                                    Integer ssntYr, Integer rnd) {
        List<DrftPlrDao> available = drftMapper.findAvailablePlayersForAi(drftId, tmId);
        if (available.isEmpty()) return null;

        Map<String, Double> posnNeed = buildPosnNeedMap(tmId);

        DrftPlrDao best = available.stream()
                .max(Comparator.comparingDouble(p -> aiScore(p, rnd, posnNeed)))
                .orElse(available.get(0));

        return executePick(drftId, pickNo, tmId, best.getDrftPlrId(), ssntYr, rnd);
    }

    private DrftOrdResponse executePick(Long drftId, Integer pickNo, Long tmId,
                                         Long drftPlrId, Integer ssntYr, Integer rnd) {
        DrftPlrDao plr = drftMapper.findPlayer(drftPlrId, tmId);
        if (plr == null) throw new IllegalArgumentException("선수를 찾을 수 없습니다: " + drftPlrId);
        if ("Y".equals(plr.getIsPickYn()))
            throw new IllegalStateException("이미 지명된 선수입니다: " + drftPlrId);

        // 자동 계약·입단
        Long newPlrId = signPlayer(plr, tmId, ssntYr, rnd, pickNo);

        drftMapper.updatePick(drftId, pickNo, drftPlrId, newPlrId);
        drftMapper.markPlayerPicked(drftPlrId, newPlrId);

        return DrftOrdResponse.from(drftMapper.findOrder(drftId).stream()
                .filter(o -> o.getPickNo().equals(pickNo))
                .findFirst()
                .orElseThrow());
    }

    private Long signPlayer(DrftPlrDao plr, Long tmId, Integer ssntYr, Integer rnd, Integer pickNo) {
        boolean isPitcher = "10".equals(plr.getReprPosnCd());
        int ovrl = plr.getActOvrlAblt();
        LocalDate today = LocalDate.now();

        // PLR 삽입
        Map<String, Object> plrParams = new HashMap<>();
        plrParams.put("plrNm", plr.getPlrNm());
        plrParams.put("plrBatPtchHandCd", plr.getPlrBatPtchHandCd());
        plrParams.put("plrDrftRnd", rnd);
        plrParams.put("plrDrftNo", pickNo);
        plrParams.put("plrSttsCd", "AT");
        plrParams.put("plrOvrlAblt", ovrl);
        plrParams.put("plrPotAblt", plr.getActPotAblt());
        plrParams.put("tmId", tmId);
        plrParams.put("plrAnslSal", estimateRookieSalary(rnd));
        plrParams.put("plrFrgnYn", "0");
        drftMapper.insertPlr(plrParams);
        Long newPlrId = ((Number) plrParams.get("plrId")).longValue();

        // PLR_TM 삽입
        Map<String, Object> tmParams = new HashMap<>();
        tmParams.put("plrId", newPlrId);
        tmParams.put("tmId", tmId);
        tmParams.put("tmBgngDt", today);
        drftMapper.insertPlrTm(tmParams);

        // PLR_TM_CNTRCT 삽입
        Map<String, Object> cntrctParams = new HashMap<>();
        cntrctParams.put("plrId", newPlrId);
        cntrctParams.put("tmId", tmId);
        cntrctParams.put("faCntrctBgngDt", today);
        cntrctParams.put("faAmt", estimateRookieSalary(rnd));
        cntrctParams.put("faCntrctEndDt", LocalDate.of(ssntYr + 2, 12, 31));
        cntrctParams.put("reprPosnCd", plr.getReprPosnCd());
        cntrctParams.put("cntrctTypeCd", "NK");
        drftMapper.insertPlrCntrct(cntrctParams);

        // PLR_POSN 삽입
        Map<String, Object> posnParams = new HashMap<>();
        posnParams.put("plrId", newPlrId);
        posnParams.put("posnCd", plr.getPosnCd());
        posnParams.put("posnPrfcAblt", Math.max(20, ovrl - 5));
        drftMapper.insertPlrPosn(posnParams);

        // PLR_ABLT 삽입
        String[] abledCodes = isPitcher ? PTCH_ABLTS : BATR_ABLTS;
        List<Map<String, Object>> ablts = new ArrayList<>();
        Random rng = new Random(newPlrId);
        for (String cd : abledCodes) {
            int val = clamp(ovrl + gaussian(rng, 8), 20, 80);
            Map<String, Object> a = new HashMap<>();
            a.put("abltCd", cd);
            a.put("abltVal", val);
            ablts.add(a);
        }
        drftMapper.insertPlrAblts(newPlrId, ablts);

        // PLR_ENTY 삽입 (드래프트 입단 선수는 2군으로 시작)
        Map<String, Object> entyParams = new HashMap<>();
        entyParams.put("plrId", newPlrId);
        entyParams.put("ssntYr", ssntYr);
        entyParams.put("tmId", tmId);
        entyParams.put("entyLvlCd", "2");
        entyParams.put("entyDt", today);
        drftMapper.insertPlrEnty(entyParams);

        return newPlrId;
    }

    // ── 드래프트 보드 ─────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<DrftBoardResponse> findBoard(Long drftId, Long tmId) {
        return drftMapper.findBoard(drftId, tmId).stream()
                .map(DrftBoardResponse::from)
                .toList();
    }

    public void upsertBoardEntry(Long drftId, Long drftPlrId, Long tmId,
                                  DrftBoardUpsertRequest req) {
        DrftBoardDao dao = DrftBoardDao.builder()
                .drftId(drftId)
                .drftPlrId(drftPlrId)
                .tmId(tmId)
                .prioOrd(req.getPrioOrd())
                .doNotPick(req.getDoNotPick() != null ? req.getDoNotPick() : "N")
                .memo(req.getMemo())
                .build();
        drftMapper.upsertBoardEntry(dao);
    }

    public void deleteBoardEntry(Long drftId, Long drftPlrId, Long tmId) {
        drftMapper.deleteBoardEntry(drftId, drftPlrId, tmId);
    }

    // ── 드래프트 순서 / 결과 조회 ─────────────────────────────────

    @Transactional(readOnly = true)
    public List<DrftPlrResponse> findPlayers(Long drftId, Long tmId) {
        return drftMapper.findPlayers(drftId, tmId).stream()
                .map(DrftPlrResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public DrftPlrResponse findPlayer(Long drftId, Long drftPlrId, Long tmId) {
        DrftPlrDao dao = drftMapper.findPlayer(drftPlrId, tmId);
        if (dao == null) throw new IllegalArgumentException("선수를 찾을 수 없습니다.");
        return DrftPlrResponse.from(dao);
    }

    @Transactional(readOnly = true)
    public List<DrftOrdResponse> findOrder(Long drftId) {
        return drftMapper.findOrder(drftId).stream()
                .map(DrftOrdResponse::from)
                .toList();
    }

    // ── 유틸리티 ─────────────────────────────────────────────────

    // 포지션별 목표 보유 인원수 (1군+2군 합산 기준)
    private static final Map<String, Integer> POSN_TARGET_CNT = Map.of(
            "10", 12,  // 투수
            "20", 3,   // 포수
            "21", 6,   // 내야수
            "22", 5    // 외야수
    );

    private double aiScore(DrftPlrDao plr, int rnd, Map<String, Double> posnNeedMap) {
        // 스카우팅 리포트 기준 보기 능력치 (없으면 실제값 fallback)
        int estPot  = plr.getEstPotAblt()  != null ? plr.getEstPotAblt()  : plr.getActPotAblt();
        int estOvrl = plr.getEstOvrlAblt() != null ? plr.getEstOvrlAblt() : plr.getActOvrlAblt();

        // 라운드별 가중치: 초반-잠재력 중시, 중반-균형, 후반-즉전감 중시
        double potWeight;
        double ovrlWeight;
        if (rnd <= 3) {
            potWeight  = 0.55;
            ovrlWeight = 0.25;
        } else if (rnd <= 7) {
            potWeight  = 0.40;
            ovrlWeight = 0.40;
        } else {
            potWeight  = 0.25;
            ovrlWeight = 0.55;
        }
        double abilityScore = estPot * potWeight + estOvrl * ovrlWeight;

        // 포지션 부족도: 능력치 갭 + 인원 갭으로 합산된 값 (0~30 범위)
        double posnNeed = posnNeedMap.getOrDefault(plr.getReprPosnCd(), 0.0);

        // 부상 위험 패널티 (1~20 → 0.25~5점)
        double riskPenalty = (plr.getInjRsk() != null ? plr.getInjRsk() : 10) / 4.0;

        // 결정에 약한 변동성 (±2점)
        double variance = ThreadLocalRandom.current().nextDouble(-2.0, 2.0);

        return abilityScore + posnNeed * 0.6 - riskPenalty + variance;
    }

    /**
     * 팀의 포지션별 부족도 맵을 계산한다.
     * - 능력치 갭: max(0, 55 - 해당 포지션 평균 OVRL)
     * - 인원 갭: max(0, 목표 인원수 - 현재 인원수) * 2.5
     */
    private Map<String, Double> buildPosnNeedMap(Long tmId) {
        List<TmPosnStrengthDao> rows = drftMapper.findTeamPosnStrength(tmId);
        Map<String, Double> avgOvrlByPosn = new HashMap<>();
        Map<String, Integer> cntByPosn = new HashMap<>();
        for (TmPosnStrengthDao r : rows) {
            avgOvrlByPosn.put(r.getReprPosnCd(),
                    r.getAvgOvrl() != null ? r.getAvgOvrl() : 50.0);
            cntByPosn.put(r.getReprPosnCd(),
                    r.getPlrCnt() != null ? r.getPlrCnt() : 0);
        }

        Map<String, Double> result = new HashMap<>();
        for (Map.Entry<String, Integer> e : POSN_TARGET_CNT.entrySet()) {
            String posnCd = e.getKey();
            int targetCnt = e.getValue();
            double avg = avgOvrlByPosn.getOrDefault(posnCd, 0.0);
            int curCnt = cntByPosn.getOrDefault(posnCd, 0);
            double abltGap = Math.max(0.0, 55.0 - avg);
            double cntGap = Math.max(0.0, targetCnt - curCnt) * 2.5;
            result.put(posnCd, abltGap + cntGap);
        }
        return result;
    }

    private String[] selectPositionByWeight(Random rng) {
        double r = rng.nextDouble();
        for (Object[] row : POSN_DIST) {
            if (r <= (double) row[2]) return new String[]{(String) row[0], (String) row[1]};
        }
        return new String[]{"10", "10"};
    }

    private String selectByWeight(String[] options, double[] probs, Random rng) {
        double r = rng.nextDouble();
        double cumul = 0;
        for (int i = 0; i < options.length; i++) {
            cumul += probs[i];
            if (r <= cumul) return options[i];
        }
        return options[options.length - 1];
    }

    private int randomPotential(Random rng) {
        double r = rng.nextDouble();
        if (r < 0.005) return 76 + rng.nextInt(5);   // Elite: 76-80 (0.5%)
        if (r < 0.025) return 71 + rng.nextInt(5);   // S:  71-75 (2%)
        if (r < 0.08)  return 65 + rng.nextInt(6);   // A+: 65-70 (5.5%)
        if (r < 0.20)  return 58 + rng.nextInt(7);   // A:  58-64 (12%)
        if (r < 0.40)  return 49 + rng.nextInt(9);   // B+: 49-57 (20%)
        if (r < 0.62)  return 40 + rng.nextInt(9);   // B:  40-48 (22%)
        if (r < 0.80)  return 32 + rng.nextInt(8);   // C:  32-39 (18%)
        return 20 + rng.nextInt(12);                  // D:  20-31 (20%)
    }

    private int randomCurrentAblt(int potAblt, String orgnCd, Random rng) {
        double factor = switch (orgnCd) {
            case "HS"   -> 0.45 + rng.nextDouble() * 0.15; // 0.45~0.60
            case "ERLY" -> 0.50 + rng.nextDouble() * 0.15; // 0.50~0.65
            case "COL"  -> 0.55 + rng.nextDouble() * 0.20; // 0.55~0.75
            case "TRYO" -> 0.55 + rng.nextDouble() * 0.20; // 0.55~0.75 (한 번 낙마, 재도전)
            default     -> 0.55 + rng.nextDouble() * 0.15;
        };
        return clamp((int) (potAblt * factor), 20, potAblt);
    }

    private String randomGrowth(Random rng) {
        double r = rng.nextDouble();
        if (r < 0.20) return "ERLY";
        if (r < 0.40) return "LATB";
        return "NRML";
    }

    private int ageByOrigin(String orgnCd, Random rng) {
        return switch (orgnCd) {
            case "HS"   -> 18 + rng.nextInt(2);  // 18~19세
            case "ERLY" -> 20 + rng.nextInt(2);  // 20~21세
            case "COL"  -> 22 + rng.nextInt(2);  // 22~23세
            case "TRYO" -> 22 + rng.nextInt(5);  // 22~26세 (낙마 후 재도전)
            default     -> 20 + rng.nextInt(4);
        };
    }

    private int estimateRound(int estPot) {
        if (estPot >= 75) return 1;
        if (estPot >= 68) return 2;
        if (estPot >= 61) return 3;
        if (estPot >= 54) return 4;
        if (estPot >= 47) return 6;
        if (estPot >= 40) return 8;
        return 10;
    }

    private long estimateRookieSalary(int rnd) {
        // 지명 라운드별 계약금 기준 (만원)
        if (rnd == 1)  return 30000L;
        if (rnd == 2)  return 10000L;
        if (rnd <= 4)  return 5000L;
        if (rnd <= 7)  return 3000L;
        return 2000L;
    }

    private String generateComment(DrftPlrDao plr, String grade) {
        boolean isPitcher = "10".equals(plr.getReprPosnCd());
        String base = switch (grade) {
            case "S+", "S", "S-" -> isPitcher ? "리그를 지배할 잠재력을 가진 에이스 후보" : "리그 최고의 타자가 될 재목";
            case "A+", "A"       -> isPitcher ? "1선발급으로 성장 가능한 유망주" : "주전 클린업 후보";
            case "A-", "B+"      -> isPitcher ? "선발 로테이션 진입을 기대할 수 있는 투수" : "주전 자리를 노릴 수 있는 타자";
            case "B", "B-"       -> isPitcher ? "불펜 전력으로 자리잡을 가능성이 있음" : "백업 또는 준주전급";
            default               -> "프로 적응 여부가 관건인 육성형 선수";
        };
        String growthNote = switch (plr.getGrwthTend()) {
            case "ERLY" -> " 빠른 성장이 예상되지만 피크 후 관리 필요.";
            case "LATB" -> " 늦게 꽃피는 타입으로 장기적 관점의 육성이 필요.";
            default     -> " 꾸준한 성장이 기대됨.";
        };
        return base + growthNote;
    }

    private String randomHsName(Random rng) {
        String[] names = {"북일고", "경남고", "광주일고", "덕수고", "휘문고", "대구상원고", "부산고", "서울고", "인천고", "전주고"};
        return names[rng.nextInt(names.length)];
    }

    private String randomUnivName(Random rng) {
        String[] names = {"연세대", "고려대", "성균관대", "동국대", "단국대", "경성대", "영남대", "원광대", "한양대", "인하대"};
        return names[rng.nextInt(names.length)];
    }

    private int randomHeight(String reprPosnCd, Random rng) {
        return switch (reprPosnCd) {
            case "10" -> 179 + rng.nextInt(12);  // 179-190cm
            case "20" -> 174 + rng.nextInt(9);   // 174-182cm
            case "21" -> 176 + rng.nextInt(10);  // 176-185cm
            default   -> 177 + rng.nextInt(10);  // 177-186cm
        };
    }

    private int randomWeight(int ht, Random rng) {
        double bmi = 21.5 + rng.nextDouble() * 5.5;
        return (int) Math.round(bmi * (ht / 100.0) * (ht / 100.0));
    }

    private String generatePrevRec(boolean isPitcher, int ovrl, String orgnCd, Random rng) {
        if (isPitcher) {
            double era = Math.max(1.20, 5.50 - (ovrl - 20) * 0.060 + (rng.nextDouble() - 0.5) * 0.80);
            int innings = switch (orgnCd) {
                case "COL", "ERLY", "TRYO" -> 60 + rng.nextInt(40);
                default                    -> 40 + rng.nextInt(30);
            };
            int k = Math.max(20, (int)(innings * (0.70 + (ovrl - 20) * 0.012) + rng.nextInt(15)));
            return String.format("ERA %.2f / %d이닝 / %d삼진", era, innings, k);
        } else {
            double ba = 0.200 + (ovrl - 20) * 0.0025 + (rng.nextDouble() - 0.5) * 0.020;
            int ab = switch (orgnCd) {
                case "COL", "ERLY", "TRYO" -> 160 + rng.nextInt(60);
                default                    -> 110 + rng.nextInt(60);
            };
            int h = Math.max(0, (int)(ab * ba));
            int hr = Math.max(0, (int)((ovrl - 30) * 0.07 + rng.nextInt(6)));
            return String.format(".%03d / %d안타 / %d홈런", Math.min(999, (int)(ba * 1000)), h, hr);
        }
    }

    private int gaussian(Random rng, int stdDev) {
        return (int) Math.round(rng.nextGaussian() * stdDev);
    }

    private int clamp(int val, int min, int max) {
        return Math.max(min, Math.min(max, val));
    }
}
