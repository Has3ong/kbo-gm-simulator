# API 명세

> Base URL: `http://localhost:8080/api`
> 모든 응답은 `{ success: boolean, data: T, message: string }` 형태

---

## 구단 (Teams)

### `GET /api/teams`
전체 구단 목록 반환.
- 10개 KBO 구단 기본 정보(ID, 이름, 약칭, 구장, 연고지) 반환

### `GET /api/teams/{tmId}`
특정 구단 상세 정보.
- 구단 기본 정보 + 팀 사기(tmMorl), 팬 만족도(fanStsfctn), 구단주 만족도(ownStsfctn) 포함

### `GET /api/teams/{tmId}/finance/{ssntYr}`
구단 재정 현황 (시즌별).
- 예산(bdgt), 지출(expns), 수입(incm), 잔액 등 재정 지표 반환

### `GET /api/teams/{tmId}/facility`
구단 시설 현황 목록.
- 5개 시설 유형(TRNG·YUTH·ANLY·SCTG·CAFE)별 현재 레벨(1~5) 반환
- 시설 등급은 선수 성장률·부상 회복·스카우팅 정확도 등에 영향

### `GET /api/teams/{tmId}/facility-upgrades`
구단 시설 업그레이드 이력.
- 완료된 업그레이드 이력(시설유형·레벨변경·비용·날짜) 반환

### `GET /api/teams/{tmId}/facility-upgrade-costs`
시설 업그레이드 비용 정보.
- 5개 시설 유형별 현재 레벨 → 다음 레벨 업그레이드 비용·공사 기간 반환
- 이미 최고 레벨(Lv.5)인 시설은 목록에서 제외

### `POST /api/teams/{tmId}/facility-upgrade`
시설 업그레이드 실행.
- Request Body: `{ "fcltyTypeCd": "TRNG"|"YUTH"|"ANLY"|"SCTG"|"CAFE" }`
- 비용 즉시 구단 예산에서 차감, `TM_FCLTY` 레벨 +1, `TM_FCLTY_UPGR` 이력 기록

### `GET /api/teams/{tmId}/stadium`
경기장 정보.
- 현재 사용 경기장 기본 정보(이름·좌석수·좌/우/중 펜스 거리) 반환

### `GET /api/teams/{tmId}/stadium-expansion-history`
경기장 증축 이력.
- 완료·진행·취소된 증축 이력(Tier·증가 좌석수·비용·상태·날짜) 반환

### `GET /api/teams/stadium-expansion-costs`
경기장 증축 비용 옵션 목록.
- `STDM_EXPN_COST_CFG`에서 관리하는 Tier별 증축 비용·증가 좌석수 반환

### `POST /api/teams/{tmId}/stadium-expansion`
경기장 증축 실행.
- Request Body: `{ "expnCfgId": number }`
- 비용 즉시 구단 예산에서 차감, `STDM` 좌석수 증가, `STDM_EXPN` 이력 기록

### `GET /api/teams/{tmId}/standings-history`
구단 연도별 순위 이력.
- 연도별 최종 순위·승·패·무·승률 반환
- 최근 연도 내림차순 정렬

### `GET /api/teams/{tmId}/finance-history`
구단 재정 이력 (시즌별 전체).
- 시즌별 예산·지출·수입·잔액 이력 목록 반환

### `GET /api/teams/{tmId}/market/{ssntYr}`
구단 마케팅 현황 (시즌별).
- 팬덤 규모(fndmSz), 티켓 판매(tcktSls), 굿즈 판매(gdsSls) 등 반환

---

## 선수 (Players)

### `GET /api/players?tmId=&plrSttsCd=`
선수 목록 (필터링 가능).
- `tmId`: 구단 ID 필터
- `plrSttsCd`: 선수 상태 코드 필터 (`ACT`=활성, `INJ`=부상, `REL`=방출, `RET`=은퇴)
- 선수 기본 정보 + 포지션 + 현재 팀 정보 반환

### `GET /api/players/{plrId}`
특정 선수 상세 정보.
- 기본 정보(이름·생년월일·국적·신체 등) + 현재 팀 + 상태 반환

### `GET /api/players/{plrId}/abilities`
선수 능력치 목록.
- 능력치 코드, 명칭, 수치, 등급(S+~D) 반환
- 타자: 접촉·장타·선구·수비 등 / 투수: 구속·제구·구위 등

### `GET /api/players/{plrId}/positions`
선수 포지션 목록.
- 주 포지션 + 가능 포지션 목록 반환

### `GET /api/players/{plrId}/traits`
선수 특성 목록.
- 선수 고유 특성(클러치·리더십·부상 내성 등) 반환

### `GET /api/players/{plrId}/contract`
선수 현재 계약 정보.
- 계약 유형(FA·드래프트·외국인 등), 계약 기간, 연봉, 옵션 조건 반환

### `PUT /api/players/{plrId}/player-edit`
선수 정보 직접 수정 (단장 권한).
- Request Body:
  ```json
  {
    "ssntYr": 2026,
    "fatg": 30,
    "cond": 70,
    "potAblt": 65,
    "abilities": { "CNT": 55, "PWR": 60 },
    "positions": { "21": 70, "22": 50 }
  }
  ```
- 피로도(fatg 1~100), 컨디션(cond 1~100), 잠재능력치(potAblt 20~80), 개별 능력치, 포지션 숙련도 수정 가능
- 종합 능력치(`PLR_OVRL_ABLT`)는 개별 능력치 평균으로 자동 재산출

---

## 스태프 (Staffs)

### `GET /api/staffs?tmId=&stffTypeCd=`
스태프 목록 (필터링 가능).
- `tmId`: 구단 ID 필터
- `stffTypeCd`: 직종 필터 (`MGR`=감독, `COACH`=코치, `SCUT`=스카우터, `MED`=의무·트레이너, `ANLY`=분석가)
- 스태프 기본 정보 + 소속 구단 + 연봉 반환

### `GET /api/staffs/{stffId}`
특정 스태프 상세 정보.
- 기본 정보(이름·국적·외국인 여부·경력 등) 반환

### `GET /api/staffs/{stffId}/abilities`
스태프 능력치 목록.
- 직종별 능력치(선수 육성·분석·스카우팅 등) 반환

---

## 시즌 (Seasons)

### `GET /api/seasons`
전체 시즌 목록.
- 연도별 시즌 기본 정보 목록 반환

### `GET /api/seasons/{ssntYr}`
특정 연도 시즌 정보.
- 시즌 상태(`PRE`·`REG`·`POST`·`OFF`·`CMPL`), 현재 날짜, 정규시즌·포스트시즌 일정 반환

### `GET /api/seasons/{ssntYr}/standings`
시즌 순위표.
- 전 구단 순위, 승·패·무, 승률, 게임차, 최근 10경기, 연속 결과, 득실차, 팀 사기, 포스트시즌 진출 상태 반환
- 포스트시즌 상태: `UNDC`=미결정, `ELIM`=탈락, `CLWC`=와일드카드, `CLPS`=포스트 확정, `CL1P`=1위, `CHMP`=우승

### `GET /api/seasons/{ssntYr}/season-reload`
시즌 상태 및 최신 이벤트 목록 통합 조회.
- 시즌 현황(상태·현재 날짜·정규/포스트시즌 일정)과 최신 이벤트(뉴스) 목록을 한 번에 반환
- 홈 화면 초기 로드 및 새로고침 버튼에서 사용
- 이벤트 항목: 이벤트 일자·제목·내용·관련 구단/선수
- *(구 `/events` 엔드포인트와 통합됨)*

---

## 경기 (Games)

### `GET /api/games?ssntYr=&gameDt=&tmId=`
경기 목록 (필터링 가능).
- `ssntYr`: 시즌 연도 필터
- `gameDt`: 특정 날짜 경기 조회 (ISO 8601: `YYYY-MM-DD`)
- `tmId`: 특정 구단 경기 조회 (홈·원정 모두 포함)
- 경기 결과(홈/원정 팀, 점수), 경기 유형(정규·포스트시즌) 반환

### `GET /api/games/{gameId}`
특정 경기 상세 정보.
- 경기 기본 정보 + 상세 스코어 반환

---

## 기록 (Records)

### `GET /api/records/batters?ssntYr=&tmId=`
타자 시즌 기록 목록.
- `ssntYr`: 시즌 연도 필터
- `tmId`: 구단 필터
- 타율·출루율·장타율·OPS, 안타·홈런·타점·도루 등 주요 타격 스탯 반환

### `GET /api/records/pitchers?ssntYr=&tmId=`
투수 시즌 기록 목록.
- `ssntYr`: 시즌 연도 필터
- `tmId`: 구단 필터
- 평균자책점·WHIP·이닝·탈삼진·승패 등 주요 투구 스탯 반환

---

## 드래프트 (Draft)

### `POST /api/draft?ssntYr=&userTmId=&drftDt=`
드래프트 이벤트 생성.
- 해당 연도 드래프트가 이미 존재하면 기존 이벤트 반환
- `drftDt` 생략 시 현재 날짜로 설정

### `GET /api/draft/{ssntYr}?userTmId=`
드래프트 조회 (연도별).
- 드래프트 상태, 라운드 수, 전체/유저팀 지명 수, 현재 픽 번호 반환

### `POST /api/draft/{drftId}/generate?userTmId=`
드래프트 풀 생성.
- 유망주 400명 자동 생성
- 팀별 스카우팅 리포트 생성 (팀의 스카우팅 수준에 따라 정확도 차이)
- 전년도 순위 역순으로 지명 순서(11라운드×10팀=110픽) 생성
- 상태 → `SCOUTING`으로 변경

### `POST /api/draft/{drftId}/start?userTmId=`
드래프트 시작.
- 상태가 `SCOUTING` 또는 `READY`일 때 `IN_PROGRESS`로 변경

### `GET /api/draft/{drftId}/players?tmId=`
드래프트 후보 목록.
- 팀별 스카우팅 추정치(현재·잠재 능력치, 예상 라운드, 등급, 코멘트) 포함
- 실제 능력치는 비공개 (유저·AI 모두 추정치만 확인 가능)
- 드래프트 보드 우선순위·메모도 함께 반환

### `GET /api/draft/{drftId}/players/{drftPlrId}?tmId=`
드래프트 후보 상세 조회.

### `GET /api/draft/{drftId}/order`
지명 순서 전체 조회.
- 라운드별·픽 번호별 팀·지명 결과·상태 반환

### `POST /api/draft/{drftId}/pick?userTmId=`
유저 선수 지명 (Request Body: `{ "drftPlrId": number }`).
- 현재 픽이 유저 팀 차례여야 함
- 지명 즉시 자동 계약·입단 처리 (PLR 테이블에 선수 생성)
- 지명된 선수는 해당 팀 2군으로 자동 배치

### `POST /api/draft/{drftId}/simulate?userTmId=`
AI 자동 지명 (유저 픽까지).
- 현재 픽부터 유저 팀 픽이 올 때까지 AI가 자동 지명
- AI 지명 점수 = 잠재력×0.35 + 현재능력×0.20 + 포지션필요도×0.25 - 부상위험×패널티
- 완료된 AI 픽 목록 반환

### `GET /api/draft/{drftId}/board?tmId=`
드래프트 보드 조회.
- 유저가 등록한 선수 우선순위 목록 반환

### `PUT /api/draft/{drftId}/board/{drftPlrId}?tmId=`
드래프트 보드 등록/수정 (Request Body: `{ "prioOrd": number, "doNotPick": "Y"|"N", "memo": string }`).
- 동일 (drftId, drftPlrId, tmId) 조합이면 UPDATE, 없으면 INSERT

### `DELETE /api/draft/{drftId}/board/{drftPlrId}?tmId=`
드래프트 보드 항목 삭제.

---

## 로스터 (Roster)

### `GET /api/roster/{tmId}?ssntYr=`
전체 로스터 조회 (1군 + 2군).
- `ssntYr`: 시즌 연도 (필수)
- 선수 기본 정보(이름·포지션·능력치·연봉·투타), 엔트리 레벨(1군/2군), 마지막 변경일 반환
- 정렬: 엔트리 레벨 → 대표 포지션(투수/포수/내야/외야) → 능력치 내림차순

### `GET /api/roster/{tmId}/entry?ssntYr=`
1군 엔트리 조회 (최대 28인).
- 1군 등록 선수만 반환

### `POST /api/roster/{tmId}/callup`
콜업 — 2군 선수를 1군으로 등록 (Request Body: `{ "plrId": number, "ssntYr": number, "chngDt": "YYYY-MM-DD" }`).
- `chngDt` 생략 시 오늘 날짜로 처리
- 1군 엔트리가 28인 이상이면 오류
- 부상(INJ) 선수는 콜업 불가
- PLR_ENTY_HIST에 변경 이력 자동 기록

### `POST /api/roster/{tmId}/option`
말소 — 1군 선수를 2군으로 내림 (Request Body: `{ "plrId": number, "ssntYr": number, "chngDt": "YYYY-MM-DD" }`).
- PLR_ENTY_HIST에 변경 이력 자동 기록

### `POST /api/roster/{tmId}/init?ssntYr=`
시즌 로스터 초기화.
- 해당 팀 소속 활성 선수(AT·INJ) 전원을 2군으로 등록
- 이미 등록된 선수는 건너뜀 (멱등 처리)
- 드래프트 입단 선수는 signPlayer 시 자동 등록되므로 별도 호출 불필요

---

## 외국인 선수 (Foreign Players)

### `GET /api/frgn-plr/candidates?ssntYr=`
외국인 선수 후보 목록 조회.
- 시즌별 FRGN_PLR_CAND 테이블 데이터 반환
- STATUS_CD='AVAILABLE' 선수 위주로 표시
- 각 후보: 이름·국적·나이·종합능력치·잠재능력치·포지션·희망연봉·현재 상태

### `POST /api/frgn-plr/offer`
외국인 선수 오퍼 제출.
- Request Body: `{ "ssntYr": number, "candId": number, "offerSal": number }`
- 오퍼 제출 시 FRGN_PLR_OFFER 테이블 저장
- 다음 날 진행하기 시 결과 처리 (`processDailyOffers()`)

### `GET /api/frgn-plr/signed-info?ssntYr=`
유저 팀 외국인 선수 계약 현황.
- `signedCnt`: 현재 계약된 외국인 선수 수
- `maxFrgnPlr`: 최대 계약 가능 수 (서비스 상수 `MAX_FRGN_PLR = 3`)
- 팝업 헤더에 "현재 N명 / 최대 3명" 형식으로 표시

---

## 방송국 스폰서 (Broadcast Sponsor)

### `GET /api/broadcast`
방송국 스폰서 목록 조회.
- 모든 방송국 스폰서(SBS/KBS/MBC) 정보 반환
- 계약금·승리수당·포스트수당·우승수당 포함

### `POST /api/broadcast/select`
방송국 스폰서 선택.
- Request Body: `{ "brdcstCd": "SBS"|"KBS"|"MBC" }`
- 최초 선택 시: 계약금 즉시 수익 반영, 스태프 후보 생성, AI 팀 방송국 랜덤 배정
- `GAME_CFG(BRDCST_SPNSR)` 및 `TM_BRDCST` 양쪽에 저장
- BRDCST 뉴스 이벤트 2건 생성 (유저 계약 체결 + AI 구단 현황)
- `GAME_CFG(STFF_HIRED=0)` 리셋 → 감독·코치 선임 버튼 활성화

---

## 개발자 모드 (Dev)

### `GET /api/dev/facility-costs`
시설 업그레이드 비용 전체 조회.
- `FCLTY_UPGR_COST_CFG` 테이블 전체 반환
- 시설 종류(TRNG/YUTH/ANLY/SCTG/CAFE) × 레벨(1→2 ~ 9→10) 매트릭스

### `PUT /api/dev/facility-costs`
시설 업그레이드 비용 일괄 수정.
- Request Body: `[{ "fcltyTypeCd": string, "fromLvl": number, "upgrdCost": number }]`
- 개발자 모드 화면에서 인라인 편집 후 일괄 저장

---

## 공통코드 (Common Codes)

### `GET /api/cmn-cd?cdGrpId=`
공통코드 조회.
- `cdGrpId`: 코드 그룹 ID (생략 시 전체 반환)
- 코드값·코드명·설명 반환
