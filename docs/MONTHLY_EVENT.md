# 월간 정산 이벤트 (Monthly Settlement Event)

> **파일**: `MonthlyEventService.java`  
> **엔드포인트**: `GET /api/game/monthly-settle?ssntYr={ssntYr}&mon={mon}`  
> **방식**: SSE (Server-Sent Events) — 단계별 실시간 진행률 스트리밍  
> **트리거**: 게임 내 날짜(`SSNT.CUR_DT`)가 새 월의 1일로 진입할 때  
> **총 단계**: 6

---

## 개요

매월 1일, 전월 성적을 정산하고 유저에게 월간 리포트를 제공한다.  
`mon` 파라미터는 **정산 대상 월** (ex: 5월 1일이 되면 `mon=4` 전달).

---

## 단계별 상세

### Step 1 — 전월 팀 성적 정리
| 항목 | 내용 |
|------|------|
| 상태 | ✅ 구현 완료 |
| 조회 테이블 | `GAME` (GAME_STTS_CD='02' 완료 경기) |
| 저장 테이블 | `TM_MON_REC`, `STND` |
| 설명 | 전월에 완료된 경기를 집계해 팀별 월간 승·패·무·득점·실점을 저장. 시즌 누적 순위(`STND`)도 갱신 |
| 집계 기준 | `GAME.GAME_DT`의 MONTH = `mon`, `GAME_STTS_CD = '02'` |
| 저장 필드 | `TM_MON_REC`: W, L, T, RS, RA / `STND`: W, L, T, PCT, GB, STND_RNK |
| 비고 | 경기가 없는 월(개막 전 등)은 0으로 저장 |

---

### Step 2 — 전월 선수 기록 정리
| 항목 | 내용 |
|------|------|
| 상태 | ✅ 구현 완료 |
| 조회 테이블 | `PLR_BATR_GAME_REC`, `PLR_PTCH_GAME_REC`, `GAME` |
| 저장 테이블 | `PLR_BATR_MON_REC`, `PLR_PTCH_MON_REC` |
| 설명 | 경기별 선수 기록을 월 단위로 집계. 타율·출루율·장타율·ERA·WHIP 등 비율 스탯 자동 산출 |
| 타자 집계 | G, PA, AB, H, 2B, 3B, HR, RBI, R, BB, IBB, SO, SB, CS, HBP, SAC, SF, GIDP → BA, OBP, SLG, OPS 계산 |
| 투수 집계 | G, GS, IP_OUT, BF, H, HR, R, ER, BB, IBB, SO, HBP, W, L, SV, HLD → ERA, WHIP 계산 |
| 비고 | `PLR_BATR_GAME_REC`에 데이터가 없으면 스킵 (경기 시뮬레이션 미실행 시) |

---

### Step 3 — 월간 MVP / 우수 선수 선정
| 항목 | 내용 |
|------|------|
| 상태 | ✅ 구현 완료 |
| 조회 테이블 | `PLR_BATR_MON_REC`, `PLR_PTCH_MON_REC`, `PLR`, `TM` |
| 저장 테이블 | `SSNT_EVNT` |
| 선정 기준 — 타자 | `PA >= 40` 중 `OPS` 최고 (동점 시 HR → RBI 순) |
| 선정 기준 — 투수 | `IP_OUT >= 45` (15이닝) 중 `ERA` 최저 (동점 시 W → SO 순) |
| 생성 이벤트 | 월간 MVP 타자 1명 + 월간 MVP 투수 1명 = **2건** `SSNT_EVNT` |
| 이벤트 유형 | `EVNT_TYPE_CD='MVP'` |
| 개선 필요 | 팀별 우수 선수(각 팀 1명), 부문별 수상(홈런왕·도루왕·탈삼진왕) 추가 |

---

### Step 4 — 구단 월간 수익·비용 정산
| 항목 | 내용 |
|------|------|
| 상태 | ✅ 구현 완료 (방송 수익 추가 필요) |
| 조회 테이블 | `TM_MON_REC`, `TM_MKT_SSNT`, `PLR_TM_CNTRCT`, `GAME_CFG`, `BRDCST_SPNSR` |
| 저장 테이블 | `TM_FNC_SSNT` |
| 수익 ① 티켓 | 홈 경기 수 × 평균 관중(AVG_ATND_CNT) × 티켓 단가(만원) × 팀 인기 지수(PPLT_RTG) |
| 수익 ② 방송 승리 수당 | 당월 승리 수 × 계약 방송국 WIN_BONUS (만원/승) |
| 비용 계산 | 선수 연봉 월할 = 전체 계약 선수 연봉 합계 ÷ 시즌 개월 수(6) |
| 저장 방식 | `TM_FNC_SSNT` UPSERT — 당월 수익을 누적합산 |
| 비고 | 마케팅·시설·코칭 비용 등 상세 항목은 `Rule.md` 재정 규칙 참조 |
| 개선 필요 | 관중 수 시뮬레이션(날씨·팀 성적 연동), 굿즈/스폰서 수입 세분화 |

#### 방송국 승리 수당 계산 로직

```
1. GAME_CFG WHERE CFG_KEY = 'BRDCST_SPNSR' → 계약 방송국 코드(brdcstCd) 조회
2. BRDCST_SPNSR WHERE BRDCST_CD = brdcstCd → WIN_BONUS (만원/승) 조회
3. TM_MON_REC WHERE TM_ID = userTmId AND SSNT_YR = ssntYr AND MON = mon → 당월 W (승리 수) 조회
4. 방송 수익 = WIN_BONUS × W
5. TM_FNC_SSNT.BCST_REV += 방송 수익
   TM_FNC_SSNT.CUR_CASH += 방송 수익
```

**적용 대상**: 유저 팀만 (AI 팀은 방송 계약 없음)

**예시** (KBS 계약, 월 10승 기준):
| 방송국 | WIN_BONUS | 월 10승 수익 |
|-------|----------|-------------|
| SBS (안정형) | 100만원/승 | 1,000만원 |
| KBS (균형형) | 600만원/승 | 6,000만원 |
| MBC (도전형) | 1,500만원/승 | 1억 5,000만원 |

---

### Step 5 — 팬 만족도 · 구단주 만족도 변화
| 항목 | 내용 |
|------|------|
| 상태 | ✅ 구현 완료 |
| 조회 테이블 | `TM_MON_REC`, `STND`, `TM_MKT_SSNT` |
| 저장 테이블 | `STND` (TM_MORL), `TM_MKT_SSNT` (FAN_STSFCTN, OWN_STSFCTN) |
| 팬 만족도 변화 | 승률 > 0.500 시 +2, ≥ 0.600 시 +3, ≤ 0.400 시 -2, ≤ 0.300 시 -3. 팬 충성도(FAN_LYLTY)가 높을수록 하락폭 완충 |
| 구단주 만족도 변화 | 팬 만족도와 동일 기준 + 재정 흑자 시 +1, 적자 시 -1 |
| 팀 분위기(MORL) | 월간 3연승 이상 +2, 5연패 이하 -3. 범위: 20~80 |
| 이벤트 생성 | 팬 만족도 급등(±10 이상) 시 `SSNT_EVNT` 생성 (`EVNT_TYPE_CD='FAN'`) |
| 개선 필요 | 특정 선수 활약 시 팬 반응, 부상·방출에 따른 팬 반발 이벤트 |

---

### Step 6 — 유저 월간 리포트 제공
| 항목 | 내용 |
|------|------|
| 상태 | ✅ 구현 완료 |
| 조회 테이블 | `TM_MON_REC`, `PLR_BATR_MON_REC`, `PLR_PTCH_MON_REC`, `TM_FNC_SSNT`, `STND` |
| 저장 테이블 | `SSNT_EVNT` |
| 리포트 내용 | ① 팀 월간 성적(승·패·승률·순위) ② 팀 내 이달의 선수(타자·투수 1명씩) ③ 재정 수지(수입·지출·현금) ④ 팬 만족도 변화 |
| 이벤트 유형 | `EVNT_TYPE_CD='NEWS'`, 제목 = `{ssntYr}년 {mon}월 월간 리포트` |
| 비고 | 유저 팀(`GAME_CFG.USER_TM_ID`)에만 생성 |
| 개선 필요 | 리포트 전용 화면 구성, 이전 달 비교 트렌드 표시 |

---

## 트리거 방식

```
게임 날짜 진행 흐름:
SSNT.CUR_DT  →  +1일씩 전진  →  새 월 1일 도달
                                        ↓
                           /api/game/monthly-settle 호출
                           (ssntYr, mon = 전월)
```

| 상황 | 파라미터 예시 |
|------|--------------|
| 5월 1일이 됨 → 4월 정산 | `ssntYr=2026&mon=4` |
| 6월 1일이 됨 → 5월 정산 | `ssntYr=2026&mon=5` |

---

## 데이터 흐름

```
경기 시뮬레이션
   ↓ 경기 완료 시
PLR_BATR_GAME_REC, PLR_PTCH_GAME_REC, GAME(HOME/AWAY_SCORE 갱신)
   ↓ 월말 정산 (월간 이벤트 Step 1~2)
PLR_BATR_MON_REC, PLR_PTCH_MON_REC, TM_MON_REC, STND
   ↓ 평가 및 이벤트 (Step 3~6)
SSNT_EVNT, TM_FNC_SSNT, TM_MKT_SSNT, STND(MORL)
```

---

## 향후 개선 사항

| 우선순위 | 항목 |
|----------|------|
| 높음 | Step 2: 경기 시뮬레이션 연동 후 실제 게임 기록 집계 |
| 높음 | Step 4: 방송국 승리 수당 월간 정산 로직 구현 (MonthlyEventService + MonthlyEventMapper 수정) |
| 높음 | Step 4: 팀별 초기 TM_FNC_SSNT 데이터 시즌 시작 시 생성 (SEASON_START Step 5 개선과 연계) |
| 완료 | Step 5: STND에 TM_MORL·FAN_STSFCTN·OWN_STSFCTN·PSTSSNT_STTS 등 컬럼 추가 (V25 마이그레이션) |
| 중간 | Step 3: 팀별 우수 선수 수상 + 부문별 리그 선두 알림 |
| 중간 | Step 6: 전월 대비 변화량 포함 리포트 |
| 낮음 | 월간 이벤트 → 오프시즌 정산(FA·드래프트 이벤트 생성) 연계 |
