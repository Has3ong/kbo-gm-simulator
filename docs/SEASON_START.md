# 시즌 시작 프로세스 (Season Start Process)

> **파일**: `GameStartService.java`  
> **엔드포인트**: `GET /api/game/start?tmId={tmId}&ssntYr={ssntYr}`  
> **방식**: SSE (Server-Sent Events) — 단계별 실시간 진행률 스트리밍  
> **총 단계**: 14

---

## 개요

유저가 팀을 선택하고 시즌 시작 버튼을 클릭하면 실행된다.  
비기초 데이터를 초기화한 뒤 해당 시즌의 모든 초기 데이터를 생성한다.

---

## 단계별 상세

### Step 1 — 팀 유효성 확인
| 항목 | 내용 |
|------|------|
| 상태 | ✅ 구현 완료 |
| 조회 테이블 | `TM`, `TM_STDM` |
| 설명 | 선택한 `tmId`가 실제로 존재하는 팀인지 검증. 홈 구장(HOME_STDM_ID)도 함께 조회해 이후 일정 생성에 사용 |
| 실패 시 | SSE에 에러 메시지 전송 후 종료 |

---

### Step 2 — 비기초 데이터 초기화
| 항목 | 내용 |
|------|------|
| 상태 | ✅ 구현 완료 |
| 삭제 원칙 | **SSNT_YR 없는 테이블** → `DELETE FROM table` (전체 삭제) <br/> **SSNT_YR 있는 테이블** → `DELETE FROM table WHERE SSNT_YR >= ssntYr` (역대 기록 보호) |
| SSNT_YR 없음 — 전체 삭제 | `PLR_BATR_GAME_REC`, `PLR_PTCH_GAME_REC` (GAME 자식) <br/> `DRFT_BOARD`, `DRFT_ORD`, `DRFT_SCUT_RPT`, `DRFT_PLR` (DRFT 자식) <br/> `FRGN_PLR_CAND_STAT`, `FRGN_PLR_CAND_ABLT` (FRGN_PLR_CAND 자식) <br/> `STFF_CAND_ABLT`, `STFF_CAND`, `STFF_TM_CNTRCT`, `STFF_TM`, `STFF_ABLT`, `STFF` <br/> `PLR_TM_CNTRCT_HIST`, `TM_FCLTY_UPGR`, `STDM_EXPN` |
| SSNT_YR 있음 — 시즌 연도 이상 삭제 (`WHERE SSNT_YR >= ssntYr`) | **로스터**: `TM_BULLPEN`, `TM_ROTATION`, `TM_LINEUP`, `PLR_ENTY_HIST`, `PLR_ENTY` <br/> **경기 기록**: `PLR_BATR_MON_REC`, `PLR_PTCH_MON_REC`, `PLR_BATR_TM_SSNT_REC`, `PLR_PTCH_TM_SSNT_REC`, `PLR_BATR_SSNT_REC`★, `PLR_PTCH_SSNT_REC`★ <br/> **팀 기록**: `TM_MON_REC`, `TM_SSNT_REC` <br/> **이벤트·경기**: `SSNT_EVNT`, `PSTSSNT_GAME`, `PSTSSNT_SRS`, `GAME` <br/> **순위·이력**: `STND`, `PLR_POSN_SSNT`, `PLR_ANSL_SAL_HIST` <br/> **재정·시장**: `TM_FIN_LOG`, `TM_FNC_SSNT`, `TM_MKT_SSNT` <br/> **드래프트·외국인·방송**: `DRFT`, `FRGN_PLR_OFFER`, `FRGN_PLR_CAND`, `TM_BRDCST` <br/> **선수 상태**: `PLR_FATG_COND`, `PLR_GRWTH_LOG`, `PLR_ABLT_MON`, `PLR_ABLT_SSNT`★ <br/> **시즌 마스터**: `SSNT` |
| ★ 역대 기록 포함 | `PLR_BATR_SSNT_REC`, `PLR_PTCH_SSNT_REC`, `PLR_ABLT_SSNT` — 1982~2025 실적 보유. SSNT_YR 조건으로 역대 기록은 보호하고 게임 시즌 데이터만 삭제 |
| in-game 계약 정리 (`resetInGameContracts`) | 시즌 시작일(`{ssntYr}-02-01`) 이후 발생한 PLR/PLR_TM/PLR_TM_CNTRCT 변경 되돌리기: <br/> ① in-game 신규 영입 선수(외국인·드래프트 픽) 식별 후 cascade 삭제 (`PLR`, `PLR_ABLT`, `PLR_POSN`, `PLR_TRT`, `PLR_HIDE_ABLT`, `PLR_TM`, `PLR_TM_CNTRCT`) <br/> ② 시드 선수 in-game 신규 `PLR_TM`/`PLR_TM_CNTRCT` 행 삭제 (`TM_BGNG_DT >= 시작일`, `FA_CNTRCT_BGNG_DT >= 시작일`) <br/> ③ in-game 방출 되돌리기: `TM_END_DT >= 시작일` → `NULL`, `PLR_STTS_CD='REL'`인 선수의 `FA_CNTRCT_END_DT >= 시작일` → `NULL` <br/> ④ `PLR_STTS_CD='REL'` 선수를 활성 `PLR_TM`을 기준으로 `'AT'` 상태와 `TM_ID` 재연결 |
| 유지 테이블 | `TM`, `PLR`(시드), `STDM`, `TM_STDM`, `STDM_HIST`, `PLR_POSN`(시드), `PLR_ABLT`(시드), `PLR_TM`(시드), `PLR_TM_CNTRCT`(시드), `TM_FCLTY`, `BRDCST_SPNSR`, `FCLTY_UPGR_COST_CFG`, `STDM_EXPN_COST_CFG`, `CMN_CD` 등 기초 마스터 |
| 비고 | 1982~2025 실제 기록 및 시드 데이터는 보호. in-game으로 만들어진 데이터(`SSNT_YR >= ssntYr`)는 모두 삭제된다. FK 순서 보장: 자식 테이블을 부모보다 먼저 삭제 |

---

### Step 3 — 시즌 마스터 생성
| 항목 | 내용 |
|------|------|
| 상태 | ✅ 구현 완료 |
| 삽입 테이블 | `SSNT` |
| 설명 | 시즌 연도, 개막 전 기간, 정규시즌 기간, 현재 날짜(CUR_DT = 정규시즌 개막일) 설정 |
| 주요 값 | `SSNT_BGNG_DT` = 1/18 (개막 2주 전), `REG_SSNT_BGNG_DT` = 2/1, `REG_SSNT_END_DT` = 8/31, `CUR_DT` = 2/1 |

---

### Step 4 — 유저 팀 저장
| 항목 | 내용 |
|------|------|
| 상태 | ✅ 구현 완료 |
| 저장 테이블 | `GAME_CFG` |
| 설명 | `CFG_KEY='USER_TM_ID'`, `CFG_VAL={tmId}` 형태로 유저 선택 팀 저장 |

---

### Step 5 — 팀 시즌 순위·시작 예산 초기화
| 항목 | 내용 |
|------|------|
| 상태 | ✅ 구현 완료 |
| 삽입 테이블 | `STND`, `TM_FNC_SSNT` |
| 설명 | 전체 10개 팀을 0승 0패 0무로 STND 초기화 (초기 순위는 TM_ID 오름차순). 동시에 `TM_FNC_SSNT`에 `STR_CASH = CUR_CASH = TOT_BDGT = 1,000,000만원 (=100억)`을 입력하여 모든 구단의 시즌 시작 현금을 100억으로 균등 부여 |
| 안전망 | `BrdcstSpnsrService.select()`(최초 호출 시)에서도 `INSERT IGNORE` 기반 `ensureInitialFinances(ssntYr)`가 동작하여, 시즌 시작 단계를 거치지 않은 데이터 시드 케이스에도 100억 시작 현금이 누락 없이 적용된다 |

---

### Step 6 — 로스터 초기화 (선수 엔트리)
| 항목 | 내용 |
|------|------|
| 상태 | ✅ 구현 완료 |
| 조회 테이블 | `PLR`, `PLR_TM_CNTRCT` |
| 삽입 테이블 | `PLR_ENTY` |
| 설명 | 유효한 계약(FA_CNTRCT_END_DT IS NULL or >= CURDATE, PLR_STTS_CD='AT')이 있는 전체 선수를 1군 엔트리로 등록. 엔트리 날짜 = 정규시즌 개막일 |

---

### Step 7 — 라인업 자동 생성
| 항목 | 내용 |
|------|------|
| 상태 | ✅ 구현 완료 |
| 삽입 테이블 | `TM_LINEUP` |
| 설명 | 각 팀의 야수 포지션(포수~지명타자, 9개)에 최적 선수를 배정. `POSN_CD` 기준 적합 선수 우선, 부족 시 여분 야수로 채움 |
| 기준 | `REPR_POSN_CD != '10'` (비투수) 선수 중 능력치 내림차순 |
| 개선 필요 | 포지션 숙련도(`PLR_POSN.POSN_PRFC_ABLT`) 반영 로직 고도화 |

---

### Step 8 — 선발 로테이션 자동 생성
| 항목 | 내용 |
|------|------|
| 상태 | ✅ 구현 완료 |
| 삽입 테이블 | `TM_ROTATION` |
| 설명 | 팀별 선발투수(POSN_CD='10') 상위 5명을 로테이션 배정. 5명 미만 시 기타 투수로 보완 |

---

### Step 9 — 불펜 역할 자동 생성
| 항목 | 내용 |
|------|------|
| 상태 | ✅ 구현 완료 |
| 삽입 테이블 | `TM_BULLPEN` |
| 역할 배정 | 선발 로테이션 5명 제외한 투수 중 능력치 순: 마무리(CL) 1명 → 셋업(SU) 2명 → 중간계투(MR) 나머지 |

---

### Step 10 — 정규시즌 일정 생성
| 항목 | 내용 |
|------|------|
| 상태 | ✅ 구현 완료 |
| 삽입 테이블 | `GAME` |
| 규모 | 10개 팀 × 9개 상대팀 × 16경기 = **720경기** (홈 8경기 + 원정 8경기) |
| 알고리즘 | 전체 매치업을 시즌 연도로 seed된 Random으로 shuffle → 하루 5경기씩 편성 (같은 팀이 하루 2번 출전 불가) |
| 시작일 | 정규시즌 개막일(2/1)부터 순차 배정 |
| 요일 규칙 | **월요일 경기 없음** (화~일 6일 편성). 매주 월요일은 자동 건너뜀 |
| 구장 | `TM_STDM` 기반 홈팀 구장 자동 배정 |
| 관중 수당 | 주말(토·일) 경기는 주중(화~금)보다 관중 수 높게 적용 (시뮬레이션 단계에서 처리 예정) |

---

### Step 11 — 시즌 캘린더 구성
| 항목 | 내용 |
|------|------|
| 상태 | ✅ 구현 완료 (GAME 테이블로 대체) |
| 설명 | 별도 캘린더 테이블 없이 `GAME.GAME_DT` 목록이 곧 시즌 캘린더. 현재는 확인(no-op) 단계 |
| 개선 필요 | 올스타전, 포스트시즌 예정일 등 별도 이벤트 캘린더 테이블 추가 검토 |

---

### Step 12 — 현재 날짜 설정
| 항목 | 내용 |
|------|------|
| 상태 | ✅ 구현 완료 (Step 3에서 처리) |
| 설명 | `SSNT.CUR_DT`는 Step 3 `insertSsnt()` 시 이미 `regStart`(개막일)로 설정됨. 이 단계는 확인 단계 |
| 개선 필요 | 스프링 캠프·시범경기 기간 별도 처리 로직 추가 검토 |

---

### Step 13 — 시작 이벤트/뉴스 생성
| 항목 | 내용 |
|------|------|
| 상태 | ✅ 구현 완료 |
| 삽입 테이블 | `SSNT_EVNT` |
| 생성 이벤트 | 유저 팀 개막 환영 이벤트(1건) |
| 이벤트 유형 | `EVNT_TYPE_CD='NEWS'` |
| 방송국 스폰서 | 시즌 시작 후 SeasonPage 상단에서 SBS/KBS/MBC 중 선택. 선택 시 계약금 즉시 지급. 선택 정보는 `GAME_CFG(CFG_KEY='BRDCST_SPNSR')`에 저장 |

---

### Step 14 — 시즌 시작 완료
| 항목 | 내용 |
|------|------|
| 상태 | ✅ 구현 완료 |
| 설명 | `done=true` SSE 이벤트 전송 후 프론트엔드가 `/season` 화면으로 이동 |

---

## 향후 개선 사항

| 우선순위 | 항목 |
|----------|------|
| 높음 | Step 7: 포지션 숙련도 반영 라인업 알고리즘 개선 |
| 높음 | Step 5: `TM_FNC_SSNT` 초기 재정 데이터 설정 (선수 연봉 합산) |
| 높음 | Step 5: `TM_MKT_SSNT` 초기 팬덤/시장 데이터 설정 |
| 중간 | Step 10: 우천 취소·더블헤더 로직 추가 |
| 중간 | Step 11: 올스타전·포스트시즌 예정일 캘린더 생성 |
| 낮음 | Step 8·9: 유저 수동 조정 허용 (시즌 시작 전 로스터 관리 화면) |
