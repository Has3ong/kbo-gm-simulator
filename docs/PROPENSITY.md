# 구단주/팬 성향 (PROPENSITY)

KBO 단장 시뮬레이터의 구단주 성향과 팬/서포터즈 성향 시스템 문서입니다.

## DB 테이블

### TM_OWN_PRPNST (구단주 성향)
- **PK**: TM_ID (FK → TM)
- 모든 수치 필드: TINYINT UNSIGNED, 1~100 범위
- 시즌 시작 시 랜덤 생성, 이후 게임 이벤트에 따라 변경

| 필드명 (DB 컬럼) | Java 필드 | 설명 | 기본 범위 |
|---|---|---|---|
| PATIENCE | patience | 인내심 | 20~80 |
| AMBITION | ambition | 야망 | 20~80 |
| FINANCIAL_STRICTNESS | financialStrictness | 재정 엄격도 | 20~80 |
| INVESTMENT_WILLINGNESS | investmentWillingness | 투자 의지 | 20~80 |
| YOUTH_PREFERENCE | youthPreference | 육성 선호도 | 20~80 |
| STAR_PREFERENCE | starPreference | 스타 선수 선호도 | 20~80 |
| LOYALTY_TO_GM | loyaltyToGm | 단장 신뢰도 | 40~80 |
| REBUILD_TOLERANCE | rebuildTolerance | 리빌딩 허용도 | 20~80 |
| WIN_NOW_PREFERENCE | winNowPreference | 즉시 성과 선호도 | 20~80 |
| ANALYTICS_PREFERENCE | analyticsPreference | 데이터 분석 선호도 | 20~80 |
| SCOUTING_PREFERENCE | scoutingPreference | 전통 스카우팅 선호도 | 20~80 |
| FAN_PRESSURE_SENSITIVITY | fanPressureSensitivity | 팬 여론 민감도 | 20~80 |
| MEDIA_SENSITIVITY | mediaSensitivity | 미디어 민감도 | 20~80 |
| LOCAL_IDENTITY_PREFERENCE | localIdentityPreference | 지역 연고 중시도 | 20~80 |
| VETERAN_PREFERENCE | veteranPreference | 베테랑 선호도 | 20~80 |
| FOREIGN_PLAYER_INVESTMENT | foreignPlayerInvestment | 외국인 선수 투자 성향 | 20~80 |
| PERFORMANCE_OVER_POPULARITY | performanceOverPopularity | 성적 중시도 | 20~80 |
| RISK_TOLERANCE | riskTolerance | 리스크 감수도 | 20~80 |
| FACILITY_PREFERENCE | facilityPreference | 시설 투자 선호도 | 20~80 |
| STAFF_INVESTMENT_PREFERENCE | staffInvestmentPreference | 스태프 투자 선호도 | 20~80 |
| CURRENT_SATISFACTION | currentSatisfaction | 현재 만족도 (상태값) | 50 초기값 |
| FIRING_RISK | firingRisk | 해고 위험도 (상태값) | 10 초기값 |
| BUDGET_FLEXIBILITY | budgetFlexibility | 예산 승인 성향 | 20~80 |
| PITCHER_PREFERENCE | pitcherPreference | 투수 선호도 | 20~80 |
| BATTER_PREFERENCE | batterPreference | 타자 선호도 | 20~80 |

### TM_FAN_PRPNST (팬/서포터즈 성향)
- **PK**: TM_ID (FK → TM)
- 대부분 TINYINT UNSIGNED (1~100), 일부는 INT UNSIGNED (관중 수치)
- 시즌 시작 시 랜덤 생성

| 필드명 (DB 컬럼) | Java 필드 | 설명 | 기본 범위 |
|---|---|---|---|
| FAN_LOYALTY | fanLoyalty | 팬 충성도 | 20~80 |
| FAN_SATISFACTION | fanSatisfaction | 현재 팬 만족도 (상태값) | 50 초기값 |
| EXPECTATION_LEVEL | expectationLevel | 기대치 | 20~80 |
| PERFORMANCE_SENSITIVITY | performanceSensitivity | 성적 민감도 | 20~80 |
| REBUILD_PATIENCE | rebuildPatience | 리빌딩 인내도 | 20~80 |
| STAR_PLAYER_PREFERENCE | starPlayerPreference | 스타 선수 선호도 | 20~80 |
| FRANCHISE_PLAYER_ATTACHMENT | franchisePlayerAttachment | 프랜차이즈 선수 애착 | 20~80 |
| PROSPECT_PREFERENCE | prospectPreference | 유망주 선호도 | 20~80 |
| VETERAN_PREFERENCE | veteranPreference | 베테랑 선호도 | 20~80 |
| FOREIGN_PLAYER_EXPECTATION | foreignPlayerExpectation | 외국인 선수 기대치 | 20~80 |
| LOCAL_IDENTITY | localIdentity | 지역 연고 의식 | 20~80 |
| TRADITION_PREFERENCE | traditionPreference | 전통/역사 중시도 | 20~80 |
| SUPPORT_INTENSITY | supportIntensity | 응원 열기 | 20~80 |
| RIVALRY_INTENSITY | rivalryIntensity | 라이벌 의식 | 20~80 |
| ATTENDANCE_POWER | attendancePower | 관중 동원력 | 20~80 |
| MERCHANDISE_AFFINITY | merchandiseAffinity | 굿즈 구매 성향 | 20~80 |
| TICKET_PRICE_SENSITIVITY | ticketPriceSensitivity | 티켓 가격 민감도 | 20~80 |
| SEASON_TICKET_LOYALTY | seasonTicketLoyalty | 시즌권 충성도 | 20~80 |
| AWAY_FAN_POWER | awayFanPower | 원정 팬 파워 | 20~80 |
| MEDIA_AMPLIFICATION | mediaAmplification | 미디어 확산력 | 20~80 |
| CRITICISM_TENDENCY | criticismTendency | 비판 성향 | 20~80 |
| PATIENCE | patience | 인내심 | 20~80 |
| EMOTIONAL_VOLATILITY | emotionalVolatility | 감정 기복 | 20~80 |
| OFFENSE_PREFERENCE | offensePreference | 공격 야구 선호도 | 20~80 |
| PITCHING_PREFERENCE | pitchingPreference | 투수 야구 선호도 | 20~80 |
| DEFENSE_PREFERENCE | defensePreference | 수비/기본기 선호도 | 20~80 |
| AGGRESSIVE_MANAGEMENT_PREFERENCE | aggressiveManagementPreference | 공격적 운영 선호도 | 20~80 |
| CURRENT_POPULARITY | currentPopularity | 현재 인기 (상태값) | 30~70 초기값 |
| AVERAGE_ATTENDANCE | averageAttendance | 평균 관중 수 (INT UNSIGNED) | 5000~20000 초기값 |
| SEASON_TICKET_HOLDERS | seasonTicketHolders | 시즌권 보유자 수 (INT UNSIGNED) | 500~5000 초기값 |
| FAN_DISCONTENT | fanDiscontent | 팬 불만도 (상태값) | 10~40 초기값 |
| DEMAND_LEVEL | demandLevel | 팬 요구 수준 (상태값) | 20~60 초기값 |

## API 엔드포인트

### 구단주 성향
| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | /api/owner-prpnst | 전체 조회 |
| GET | /api/owner-prpnst/{tmId} | 팀별 조회 |
| PUT | /api/owner-prpnst/{tmId} | 수정 (없으면 생성) |

### 팬/서포터즈 성향
| 메서드 | 경로 | 설명 |
|---|---|---|
| GET | /api/fan-prpnst | 전체 조회 |
| GET | /api/fan-prpnst/{tmId} | 팀별 조회 |
| PUT | /api/fan-prpnst/{tmId} | 수정 (없으면 생성) |

## 관련 서비스

- `TmOwnPrpnstService`: `randomizeAll(List<Long> tmIds)` — 시즌 시작 시 모든 팀 성향 랜덤 생성
- `TmFanPrpnstService`: `randomizeAll(List<Long> tmIds)` — 시즌 시작 시 모든 팀 팬 성향 랜덤 생성
- `GameStartService.start()`: 시즌 시작 시 두 서비스의 `randomizeAll()` 호출

## 개발자 도구 (DevPage)

- **탭**: 구단주 성향 / 팬 성향
- 팀 선택 → 성향 수치 편집 → 저장
- 수치 범위: 1~100 (관중 수치 제외)
