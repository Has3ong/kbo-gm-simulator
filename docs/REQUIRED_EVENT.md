# 필수 이벤트 관리 (Required Event Gate)

> 시즌 진행(`진행하기` 버튼)을 위해 반드시 완료해야 하는 이벤트 목록.
> 미완료 이벤트가 존재하면 날짜 진행이 차단되며, 유저에게 이유가 표시된다.

---

## 게이트 체크 API

`GET /api/seasons/{ssntYr}/advance-check`

```json
{
  "canAdvance": true,
  "broadcasterSelected": true,
  "stffHired": true,
  "springCampDone": true,
  "rosterConfirmed": true,
  "incompleteGamesCount": 0,
  "currentDate": "2026-03-15"
}
```

PRE 시즌 canAdvance 조건: `broadcasterSelected AND stffHired AND springCampDone AND rosterConfirmed AND incompleteGamesCount == 0`

---

## 필수 이벤트 목록

### 1. 방송국 스폰서 선택
| 항목 | 내용 |
|------|------|
| 체크 방법 | `GAME_CFG WHERE CFG_KEY = 'BRDCST_SPNSR'` 존재 여부 |
| 발생 시점 | 시즌 시작(2/1) 시 `SSNT_EVNT(EVNT_TYPE_CD='BRDCST')` HTML 이벤트 자동 생성 |
| 미완료 시 | 진행하기 버튼 비활성화 + 안내 메시지 / 뉴스 목록에 `필수` 칩 표시 |
| 완료 방법 | 뉴스 상세 패널에서 SBS/KBS/MBC 카드 중 1개 선택 → 확정 |

---

### 2. 오늘 예정 경기 완료
| 항목 | 내용 |
|------|------|
| 체크 방법 | `GAME WHERE GAME_DT = 현재날짜 AND GAME_STTS_CD NOT IN ('03','05','06')` COUNT |
| 발생 시점 | 경기가 편성된 날(화~일) |
| 미완료 시 | 진행하기 비활성화 + `경기 시작하기` 버튼 활성화 |
| 완료 방법 | 경기 시작하기 버튼으로 경기 시뮬레이션 실행 |

---

### 3. 감독·코치 선임 (PRE 시즌)
| 항목 | 내용 |
|------|------|
| 상태 | ✅ 구현 완료 |
| 체크 방법 | `STFF_TM_CNTRCT` 직접 조회 — 유저팀 MGR ≥ 1 AND COACH ≥ 1 (CNTRCT_END_DT >= CURRENT_DATE) |
| 발생 시점 | 방송국 선택 완료 직후 `SSNT_EVNT(EVNT_TYPE_CD='STFF')` HTML 이벤트 자동 생성 |
| 미완료 시 | 진행하기 버튼 비활성화 + 안내 메시지 / STFF 이벤트에 `필수` 칩 표시 |
| 완료 방법 | 뉴스 탭 → STFF 이벤트 상세 → "감독·코치 선임하기" 버튼 → StaffHireModal에서 계약 완료 |
| 비고 | 상단 버튼 없음. 뉴스 내 버튼으로만 진입. 선임 완료 시 `필수` 칩 자동 소멸 |

---

### 4. 스프링 캠프 선택 (PRE 시즌)
| 항목 | 내용 |
|------|------|
| 상태 | ✅ 구현 완료 |
| 체크 방법 | `GAME_CFG WHERE CFG_KEY = 'SPRING_CAMP_DONE' AND CFG_VAL = '1'` |
| 발생 시점 | 감독·코치 선임 완료 후 |
| 미완료 시 | 진행하기 버튼 비활성화 + 안내 메시지 |
| 완료 방법 | SeasonPage "스프링 캠프 선택" 버튼 → SpringCampModal에서 장소 선택 완료 |
| 부수 효과 | CUR_DT → 3/15 점프, 선수 성장 처리, GRWTH/ROSTER_CONFIRM 이벤트 생성 |

---

### 5. 로스터 확정 (PRE 시즌, 3/15 이후)
| 항목 | 내용 |
|------|------|
| 상태 | 구현 예정 |
| 체크 방법 | `GAME_CFG WHERE CFG_KEY = 'ROSTER_CONFIRMED' AND CFG_VAL = '1'` |
| 발생 시점 | 스프링 캠프 완료(3/15) 이후 |
| 미완료 시 | 진행하기 버튼 비활성화 |
| 완료 방법 | ROSTER_CONFIRM 이벤트 클릭 → RosterConfirmPage에서 1군 엔트리·타순·로테이션 확정 |

---

## 날짜별 이벤트 발생 패턴

| 날짜 조건 | 발생 이벤트 | 필수 여부 |
|-----------|------------|----------|
| 매일 (화~일, REG/POST) | 오늘 경기 완료 | 필수 |
| 월요일 (REG/POST) | 주간 처리 실행 | 자동 (필수 없음) |
| 2/1 (PRE 시작) | 방송국 스폰서 선택 | 필수 |
| 2/1 이후 (PRE) | 감독·코치 선임 | 필수 |
| 2/1~2/10 (PRE) | 외국인 선수 계약 | 선택 |
| 2/10 이후 (PRE) | 스프링 캠프 선택 | 필수 |
| 3/15 (스프링캠프 후) | 로스터 확정 | 필수 |
| 드래프트 일정 | 드래프트 지명 | 필수 (구현 예정) |

---

## UI 동작 규칙

### `진행하기` 버튼
- 모든 필수 이벤트 완료 시: **활성화** (파란색)
- 오늘 경기가 남아 있을 때: **비활성화** + 툴팁 "오늘 경기를 완료해주세요"
- 방송국 미선택 시: **비활성화** + 툴팁 "방송국 스폰서를 먼저 선택해주세요"
- 감독·코치 미선임 시: **비활성화** + 툴팁 "감독·코치를 선임해주세요"
- 스프링캠프 미선택 시: **비활성화** + 툴팁 "스프링 캠프를 선택해주세요"
- 로스터 미확정 시: **비활성화** + 툴팁 "로스터를 확정해주세요"

### PRE 시즌 전용 버튼 (SeasonPage 상단)
- ~~"감독·코치 선임" 버튼~~ — 제거됨. 뉴스 탭 STFF 이벤트 상세에서만 진입 가능
- "스프링 캠프 선택" 버튼: `stffHired = true` AND `springCampDone = false` 일 때 표시
- "외국인 계약" 버튼: `broadcasterSelected = true` AND `springCampDone = false` 일 때 표시
- "로스터 확정" 버튼: `springCampDone = true` AND `rosterConfirmed = false` 일 때 표시

### 뉴스 이벤트 `필수` 칩 표시 조건
| 이벤트 타입 | 칩 표시 조건 |
|------------|-------------|
| `BRDCST` (HTML 타입) | `broadcasterSelected = false` |
| `STFF` | `stffHired = false` |

### `경기 시작하기` 버튼
- 오늘 예정 경기가 있고 아직 미완료일 때만 **활성화** (초록색)
- 클릭 시 경기 시뮬레이션 실행 → 완료 후 GAME_STTS_CD 업데이트

---

## 향후 개선 사항

| 우선순위 | 항목 |
|----------|------|
| 높음 | 경기 시작하기 버튼 → 실제 게임 시뮬레이션 연결 |
| 높음 | 라인업/로테이션 미설정 체크 추가 |
| 중간 | 필수 이벤트 목록 UI 표시 (완료/미완료 시각화) |
| 낮음 | 드래프트 일정 게이트 추가 |
