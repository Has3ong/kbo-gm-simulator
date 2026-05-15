# 시즌 종료 프로세스 (SEASON_END)

## 개요

- **트리거**: 매년 11월 1일 (`CUR_DT` 진행 후 `day == 1 && mon == 11`)
- **선행 조건**: 10월 월간 정산 완료 후 자동 실행
- **총 단계**: 14단계
- **API**: `GET /api/game/season-end?ssntYr={ssntYr}`
- **방식**: SSE(Server-Sent Events) 스트리밍

## 트리거 흐름

```
진행하기 → advanceDate (11/1) → 10월 월간 정산(triggerMonthlySettle) → 완료 후 → 시즌 종료(triggerSeasonEnd)
```

## 14단계 상세

### Step 1 — 조건 확인

- SSNT 조회: `SSNT_STTS_CD` 확인
- 시즌 상태가 `POST`(포스트시즌)인지 검증
- 이미 종료된 시즌인지 확인 (`OFF` 상태면 스킵)
- 현재 날짜(`CUR_DT`) 확인

### Step 2 — 최종 순위 확정

- `STND` 테이블의 `PCT`, `GB`, `STND_RNK` 재계산
- 마지막 순위 정렬 완료 후 순위 고정
- 관련 테이블: `STND`

### Step 3 — 챔피언 결정

- 최종 순위 1위 팀 or `PSTSSNT_STTS = 'CHMP'` 팀을 챔피언으로 결정
- 챔피언 이벤트(`EVNT_TYPE_CD = 'POST'`) 생성
- 관련 테이블: `STND`, `SSNT_EVNT`

### Step 4 — 시즌 기록 확정

- `PLR_BATR_MON_REC` → `PLR_BATR_SSNT_REC` 시즌 집계 UPSERT
- `PLR_PTCH_MON_REC` → `PLR_PTCH_SSNT_REC` 시즌 집계 UPSERT
- 시즌 합산: `SUM(월별기록)` by `PLR_ID, SSNT_YR`
- 관련 테이블: `PLR_BATR_MON_REC`, `PLR_BATR_SSNT_REC`, `PLR_PTCH_MON_REC`, `PLR_PTCH_SSNT_REC`

### Step 5 — 골든글러브 선정

- 포지션별 최우수 선수 선정
  - 투수: ERA 최저 (IP_OUT >= 120 이상, 즉 40이닝 이상)
  - 포수(C): OPS 최고 (PA >= 200)
  - 1루수~우익수: OPS 최고 (PA >= 250)
  - DH: OPS 최고 (PA >= 250)
- 골든글러브 이벤트(`EVNT_TYPE_CD = 'REC'`) 생성
- 관련 테이블: `PLR_BATR_SSNT_REC`, `PLR_PTCH_SSNT_REC`, `PLR_POSN`, `SSNT_EVNT`

### Step 6 — MVP 선정

- 시즌 MVP(타자): 전체 타자 중 OPS 최고 (PA >= 400)
- 시즌 MVP(투수): 전체 투수 중 ERA 최저 (IP_OUT >= 300, 즉 100이닝 이상)
- 각각 이벤트(`EVNT_TYPE_CD = 'MVP'`) 생성
- 관련 테이블: `PLR_BATR_SSNT_REC`, `PLR_PTCH_SSNT_REC`, `SSNT_EVNT`

### Step 7 — 팬·구단주 평가

- 최종 시즌 성적 기반 팬·구단주 만족도 최종 조정
  - 1위: +5, 2~3위: +2, 4~6위: 0, 7~8위: -2, 9~10위: -5
- 결과를 `TM_MKT_SSNT`에 반영
- 관련 테이블: `STND`, `TM_MKT_SSNT`

### Step 8 — 재정 최종 정산

- 포스트시즌 진출 보너스 정산 (1~4위 팀에 재정 지원)
- 유저팀 최종 현금(`CUR_CASH`) 확정
- 관련 테이블: `TM_FNC_SSNT`

### Step 9 — 선수 성장·노화

- `PLR_OVRL_ABLT`와 `PLR_POT_ABLT` 차이 기반으로 성장/노화 적용
  - 잠재치 대비 현재 능력이 낮을수록(20% 미만) 성장 가능성 높음: +1~+3
  - 잠재치에 근접(80% 이상)하거나 초과한 경우: 노화 가능성, -1~-2
  - 노화는 `PLR_OVRL_ABLT >= 70`인 선수에게만 적용
- 성장 시 개별 `PLR_ABLT` 항목도 비례 조정
- 범위: 20~80 고정
- 관련 테이블: `PLR`, `PLR_ABLT`

### Step 10 — 계약 만료·FA 처리

- `FA_CNTRCT_END_DT`가 시즌 종료일(`SSNT_END_DT`) 이하인 계약 만료 처리
- 만료 선수 상태 변경: `PLR_STTS_CD = 'FA'`, `TM_ID = NULL`
- 계약 이력 저장: `PLR_TM_CNTRCT_HIST`
- FA 이벤트(`EVNT_TYPE_CD = 'SIGN'`) 생성
- 관련 테이블: `PLR`, `PLR_TM_CNTRCT`, `PLR_TM_CNTRCT_HIST`, `SSNT_EVNT`

### Step 11 — 은퇴·방출 처리

- 은퇴 조건: `PLR_OVRL_ABLT <= 40` AND `PLR_POT_ABLT <= 50` AND FA 상태이거나 계약 만료
  - 즉, 능력치가 낮고 잠재력도 낮은 고령 선수
- 은퇴 처리: `PLR_STTS_CD = 'RET'`, `TM_ID = NULL`
- 은퇴 이벤트(`EVNT_TYPE_CD = 'REL'`) 생성
- 관련 테이블: `PLR`, `SSNT_EVNT`

### Step 12 — 드래프트 준비

- 다음 시즌 드래프트 이벤트 생성 (`DRFT` 테이블)
  - `DRFT_DT`: 다음 시즌 2월 1일
  - `DRFT_STTS_CD`: 'READY'
- 역순위 드래프트 순번 생성 (`DRFT_ORD` 테이블)
  - 10위 → 1픽, 1위 → 10픽 (라운드 1)
- 관련 테이블: `DRFT`, `DRFT_ORD`

### Step 13 — 오프시즌 전환

- `SSNT_STTS_CD` = `'OFF'` 업데이트 (STATUS TRANSITION이 이미 처리했을 수 있으므로 재확인)
- 오프시즌 이벤트(`EVNT_TYPE_CD = 'NEWS'`) 생성
- 관련 테이블: `SSNT`, `SSNT_EVNT`

### Step 14 — 최종 리포트 생성

- 유저 팀 기준 시즌 총결산 리포트 이벤트 생성
  - 시즌 성적 요약, 개인 기록, 재정, 팬 만족도 등
- 이벤트(`EVNT_TYPE_CD = 'NEWS'`) 생성
- 관련 테이블: `STND`, `PLR_BATR_SSNT_REC`, `PLR_PTCH_SSNT_REC`, `TM_FNC_SSNT`, `SSNT_EVNT`

## 관련 파일

| 파일 | 역할 |
|------|------|
| `SeasonEndProgressDto.java` | SSE 진행 DTO |
| `SeasonEndMapper.java` | MyBatis 매퍼 인터페이스 |
| `SeasonEndMapper.xml` | SQL 매퍼 XML |
| `SeasonEndService.java` | 14단계 비즈니스 로직 |
| `SeasonEndController.java` | SSE API 엔드포인트 (`/api/game/season-end`) |
| `SeasonPageHooks.ts` | 프론트엔드 자동 트리거 (11월 1일 월간 정산 완료 후) |
