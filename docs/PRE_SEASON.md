# 프리시즌(PRE) 필수 이벤트 프로세스

> **상태**: `SSNT.SSNT_STTS_CD = 'PRE'`  
> **시작 날짜**: CUR_DT = 2월 1일 (시즌 시작 직후)  
> **종료 조건**: 모든 5단계 필수 이벤트 완료 → CUR_DT가 REG_SSNT_BGNG_DT 도달 시 자동 REG 전환  
> **진행 차단**: `GET /api/seasons/{ssntYr}/advance-check` — canAdvance = false 이면 진행 버튼 비활성화

---

## 개요

PRE 시즌에서는 정규시즌 시작 전 아래 5가지 필수 이벤트를 순서대로 완료해야 한다.  
각 이벤트 완료 여부는 `GAME_CFG` 테이블 또는 관련 테이블 조회로 판단한다.

| 단계 | 이벤트 | CUR_DT | 완료 판단 방법 |
|------|--------|--------|----------------|
| 1 | 방송국 스폰서 선택 | 2/1 | `GAME_CFG(BRDCST_SPNSR)` 존재 여부 |
| 2 | 감독·코치 선임 | 2/1 | `GAME_CFG(STFF_HIRED) = 1` |
| 3 | 외국인 선수 계약 | 2/1~2/10 | — (선택적) |
| 4 | 스프링 캠프 선택 | 2/15 이벤트 발생 후 | `GAME_CFG(SPRING_CAMP_DONE)` = 1 → CUR_DT = 3/15 |
| 5 | 로스터 확정 | 3/15 | `GAME_CFG(ROSTER_CONFIRMED)` = 1 |

---

## 단계 1 — 방송국 스폰서 선택

| 항목 | 내용 |
|------|------|
| 트리거 | 시즌 시작(2/1) 시 `SSNT_EVNT(EVNT_TYPE_CD='BRDCST')` HTML 이벤트 자동 생성 |
| UI | SeasonPage 뉴스 탭 → 방송국 선택 이벤트 클릭 → 뉴스 상세 패널에 SBS/KBS/MBC 카드 표시 |
| 선택 흐름 | 카드의 "선택" 버튼 → 확정 다이얼로그 → `POST /api/broadcast-sponsors/select` |
| 완료 처리 1 | `GAME_CFG(BRDCST_SPNSR)` 저장, `TM_BRDCST` INSERT, 계약금 즉시 지급 |
| 완료 처리 2 | 유저 계약 `BRDCST` 뉴스 생성, AI 구단 랜덤 방송국 배정 + `TM_BRDCST` 저장, AI 구단 현황 `BRDCST` 뉴스 생성 |
| 부수 처리 | 선택 즉시 `StffHireService.onBrdcstSelected()` 호출 → 감독 6명·코치 10명 후보 생성 (`STFF_CAND`), `GAME_CFG(STFF_HIRED=0)` 리셋, `STFF` 안내 뉴스 자동 생성 (감독·코치 선임 유도) |
| 감독·코치 선임 진입 | 방송국 선택 완료 후 자동 생성된 `STFF` 뉴스 상세 패널 하단의 "감독·코치 선임하기" 버튼으로 진입 (STFF_HIRED=0일 때만 노출) |
| 이벤트 목록 필수 표시 | 방송국 선택 전 BRDCST 이벤트에 `필수` 칩 표시 (선택 완료 후 사라짐) |
| 차단 조건 | 미선택 시 진행 차단 |

---

## 단계 2 — 감독·코치 선임

| 항목 | 내용 |
|------|------|
| 트리거 | 방송국 선택 직후 자동 생성된 `STFF` 안내 뉴스 (`STFF_HIRED=0` 상태에서만 노출) |
| UI | 뉴스 탭 `STFF` 이벤트 상세 패널 → "감독·코치 선임하기" 버튼 → `StaffHireModal` |
| 후보 생성 | `onBrdcstSelected()` 시 감독 6명 + 코치 10명 후보 자동 생성 (`STFF_CAND`, `STFF_CAND_ABLT`) |
| 감독 선임 | 1명 필수 (재계약 또는 신규) |
| 코치 선임 | 최대 2명 (재계약 또는 신규) |
| 완료 처리 1 | `STFF_TM_CNTRCT` 저장, `STFF_CAND` / `STFF_CAND_ABLT` 전체 삭제 |
| 완료 처리 2 | `GAME_CFG(STFF_HIRED=1)` 저장 → 버튼 숨김 |
| 완료 처리 3 | 모든 AI 팀 감독 1명·코치 2명 자동 선임 → `STFF` 통합 완료 뉴스 생성 (유저+AI 현황 HTML 테이블) |
| 완료 처리 4 | 외국인 선수 후보 40명 생성 (`FRGN_PLR_CAND`), CUR_DT → 2/1, `FRGN_OPEN` 이벤트 생성 |
| 완료 판단 | `GAME_CFG(STFF_HIRED) = '1'` |
| 이벤트 목록 필수 표시 | 선임 전 STFF 이벤트에 `필수` 칩 표시 (선임 완료 후 사라짐) |
| 차단 조건 | 미완료 시 진행 차단 |

**후보 능력치 정보 (표시 항목)**

| 컬럼 | 설명 |
|------|------|
| 이름 (STFF_NM) | |
| 경력 (STFF_EXP_YR) | 단위: 년 |
| 종합 (OVRL_RTG) | 1~20 스케일 |
| 계약금 (SIGN_BONUS) | 만원 |
| 연봉 (ANSL_SAL) | 만원 |
| 능력치 (STFF_CAND_ABLT) | 최대 6개 표시 |

---

## 단계 3 — 외국인 선수 계약

| 항목 | 내용 |
|------|------|
| 가능 기간 | 2/1 ~ 2/10 |
| 필수 여부 | 선택 (필수 게이트 아님) |
| 트리거 | 방송국 선택 후 "외국인 계약" 버튼 상시 표시 |
| 종료 조건 | 2/10 경과 또는 유저 "그만하기" 클릭 |

**후보 풀**
- 투수 25명 + 야수 15명 = **40명 전원 표시 (생략 불가)**
- 계약 전: 이름·나이·국적·포지션·과거 스탯만 공개, 능력치 숨김
- 계약 후: 능력치 공개 및 `PLR_ABLT` 저장, `PLR_ENTY`(2군) 자동 등록

**오퍼 처리 흐름**
```
유저 오퍼 전송 (연봉 금액 입력)
  → 해당 선수 오퍼 상태 저장
  → 다음 날 날짜 진행 시 승낙/거절 판정
     승낙 확률 = base_prob × (오퍼 / 희망 연봉)
     승낙 → PLR_TM_CNTRCT 저장, PLR 생성, PLR_ENTY(2군) 등록
     거절 → 다음 날 재오퍼 가능
```

**AI 경쟁**
- AI 팀도 동일 후보 풀에서 매일 자동 오퍼 (`SsntService.advanceDate` → `FrgnPlrService.processDailyOffers`)
- 이미 계약된 선수(`AI_SIGNED`/`SIGNED`)는 타팀 오퍼 불가, 모달에서 계약 구단명과 함께 표시
- 팀당 최대 3명 (`PLR.PLR_FRGN_YN='1' AND PLR_STTS_CD='AT'` 기준)
- 최대 보유 도달 시 모달 상단에 안내 Alert + 모든 오퍼 입력 비활성화

**외국인 선수 방출**
- 선수 상세 화면에서 자신 구단의 외국인(PLR_FRGN_YN='1', PLR_STTS_CD='AT') 선수에 "외국인 계약 해지" 버튼 표시
- `DELETE /api/players/{plrId}/release-foreign` 호출 → `PLR.PLR_STTS_CD='REL'`, `TM_ID=NULL`, `PLR_TM`/`PLR_TM_CNTRCT` 종료, 현 시즌 `PLR_ENTY`/`TM_LINEUP`/`TM_ROTATION`/`TM_BULLPEN` 정리, `FRGN_PLR_CAND.SGND_TM_ID` 해제 → 동일 시즌 추가 영입 가능
- `FRGN` 방출 뉴스 자동 생성

---

## 단계 4 — 스프링 캠프 선택

| 항목 | 내용 |
|------|------|
| 트리거 | 감독·코치 선임 완료 후 "스프링 캠프" 버튼 활성화 |
| UI | `SpringCampModal` — 7개 장소 카드 선택 |
| 완료 처리 | `GAME_CFG(SPRING_CAMP_LOC)` = 장소코드, `GAME_CFG(SPRING_CAMP_DONE=1)` 저장 |
| 날짜 점프 | CUR_DT → **3월 15일** |
| 성장 처리 | 유저 구단 소속 선수 전원 능력치 성장 (캠프 Tier 기반, `PLR_GRWTH_LOG` 저장) |
| 뉴스 생성 | `SSNT_EVNT(EVNT_TYPE_CD='GRWTH')` — 성장 요약 뉴스 |
| 후속 이벤트 | `SSNT_EVNT(EVNT_TYPE_CD='ROSTER_CONFIRM')` — 로스터 확정 안내 |
| 차단 조건 | 미완료 시 진행 차단 |

**캠프 등급별 파라미터**

| Tier | 비용 | 성장 능력치 수 | 능력치당 최대 성장 |
|------|------|----------------|-------------------|
| 1 | 5억원 | 1 | 1 |
| 2 | 10억원 | 2 | 1 |
| 3 | 20억원 | 3 | 2 |
| 4 | 35억원 | 4 | 2 |
| 5 | 55억원 | 5 | 3 |
| 6 | 80억원 | 5 | 4 |
| 7 | 120억원 | 6 | 4 |

---

## 단계 5 — 로스터 확정

| 항목 | 내용 |
|------|------|
| 트리거 | 3/15 스프링 캠프 완료 후 ROSTER_CONFIRM 이벤트 클릭 |
| UI | `RosterConfirmPage` — 1군 엔트리 선택 + 타순 드래그&드랍 + 선발로테이션 |
| 완료 처리 | `PLR_ENTY` 갱신, `TM_LINEUP` 갱신, `TM_ROTATION` 갱신, `GAME_CFG(ROSTER_CONFIRMED=1)` 저장 |
| 차단 조건 | 미완료 시 정규시즌 진행 차단 |

**1군 엔트리 규칙**
- 최소 20명 / 최대 29명
- 외국인 선수 최대 3명
- 미달/초과 시 확정 버튼 비활성화

**선발 로테이션 설정**
- 1선발 / 2선발 / 3선발 / 4선발 / 5선발 각 1명 지정
- 중간계투(RP) / 마무리(CL) 복수 지정 가능

**타순 설정**
- 1군 야수 중 9명을 드래그&드랍으로 1번~9번 타순 배치
- 지명타자(DH) 포함

---

## advance-check 응답 구조 (PRE 시즌)

```json
{
  "canAdvance": false,
  "broadcasterSelected": true,
  "stffHired": false,
  "springCampDone": false,
  "rosterConfirmed": false,
  "incompleteGamesCount": 0,
  "currentDate": "2026-02-01"
}
```

PRE 시즌의 `canAdvance = true` 조건:
```
broadcasterSelected AND stffHired AND springCampDone AND rosterConfirmed AND incompleteGamesCount == 0
```

---

## 관련 파일

| 레이어 | 파일 |
|--------|------|
| Controller | `BrdcstSpnsrController`, `StffHireController`, `SpringCampController`, `SsntController` |
| Service | `BrdcstSpnsrService`, `StffHireService`, `SpringCampService`, `SsntService` |
| Frontend Modal | `StaffHireModal.tsx`, `SpringCampModal.tsx` |
| Frontend Page | `SeasonPage.tsx`, `SeasonPageHooks.ts`, `RosterConfirmPage.tsx` |
| Frontend Hooks | `useStaffHire.ts`, `useSpringCamp.ts` |
| DB | `GAME_CFG`, `STFF_CAND`, `STFF_CAND_ABLT`, `STFF_TM_CNTRCT`, `PLR_GRWTH_LOG`, `PLR_ENTY`, `TM_LINEUP`, `TM_ROTATION` |
