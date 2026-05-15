# KBO 단장 시뮬레이터 — DB 스키마

## 네이밍 규칙

| 구분 | 규칙 | 예시 |
|------|------|------|
| 테이블명 | 대문자 + 언더스코어 | `PLR_ABLT` |
| 컬럼명 | 대문자 + 언더스코어 | `PLR_NM`, `FA_AMT` |
| PK 시퀀스 | `~_ID` | `PLR_ID`, `TM_ID` |
| 이름 | `~_NM` | `PLR_NM`, `TM_KR_NM` |
| 코드 | `~_CD` | `POSN_CD`, `ABLT_CD` |
| 날짜 | `~_DT` | `FA_CNTRCT_BGNG_DT` |
| 금액 | `~_AMT` | `FA_AMT` |
| 수치 | `~_VAL` | `ABLT_VAL` |
| 능력치 | `~_ABLT` | `POSN_PRFC_ABLT` |
| 영문 | `~_ENG_~` | `TM_ENG_NM` |
| 한글 | `~_KR_~` | `TM_KR_NM` |
| 짧은 | `~_SHRT_~` | `TM_SHRT_KR_NM` |

---

## 테이블 목록

| 테이블 | 설명 |
|--------|------|
| `CMN_CD` | 공통코드 |
| `STDM` | 경기장 |
| `STDM_HIST` | 경기장 이력 |
| `TM` | 팀 |
| `TM_HIST` | 팀 이력 |
| `TM_STDM` | 팀-경기장 관계 |
| `TM_FNC_SSNT` | 팀 재정 시즌별 |
| `TM_FCLTY` | 팀 시설 현황 |
| `TM_FCLTY_UPGR` | 팀 시설 업그레이드 이력 |
| `FCLTY_UPGR_COST_CFG` | 시설 업그레이드 비용 설정 (코드 관리) |
| `STDM_EXPN` | 경기장 증축 이력 |
| `STDM_EXPN_COST_CFG` | 경기장 증축 비용 설정 (코드 관리) |
| `TM_MKT_SSNT` | 팀 시장·팬덤 시즌별 |
| `TM_GAME_REC` | 팀 경기 기록 |
| `TM_SSNT_REC` | 팀 시즌 누적 기록 |
| `TM_MON_REC` | 팀 월간 누적 기록 |
| `PLR` | 선수 |
| `PLR_TM` | 선수-팀 소속 |
| `PLR_TM_CNTRCT` | 선수-팀 계약 |
| `PLR_TM_CNTRCT_HIST` | 선수-팀 계약 이력 |
| `PLR_POSN` | 선수-포지션 관계 (현재) |
| `PLR_POSN_SSNT` | 선수-포지션 연도별 이력 |
| `PLR_ABLT` | 선수-능력치 (현재) |
| `PLR_ABLT_MON` | 선수-능력치 월별 이력 |
| `PLR_ABLT_SSNT` | 선수-능력치 연도별 이력 |
| `PLR_HIDE_ABLT` | 선수 히든 능력치 |
| `PLR_TRT` | 선수 특성 |
| `PLR_ANSL_SAL_HIST` | 선수 연봉 연도별 이력 |
| `STFF` | 스태프 (감독·코치·스카우터·의무·분석가) |
| `STFF_TM` | 스태프-팀 소속 |
| `STFF_TM_CNTRCT` | 스태프 계약 |
| `STFF_ABLT` | 스태프 능력치 |
| `VW_PLR_ABLT` | 선수 능력치 등급 뷰 |
| `SSNT` | 시즌 마스터 |
| `STND` | 팀 순위 |
| `SSNT_EVNT` | 시즌 이벤트·뉴스 |
| `PSTSSNT_SRS` | 포스트시즌 시리즈 |
| `PSTSSNT_GAME` | 포스트시즌 경기 |
| `GAME` | 경기 |
| `PLR_BATR_GAME_REC` | 타자 경기 기록 |
| `PLR_BATR_MON_REC` | 타자 월 집계 기록 |
| `PLR_BATR_SSNT_REC` | 타자 시즌 집계 기록 |
| `PLR_BATR_TM_SSNT_REC` | 타자 팀별 시즌 집계 기록 |
| `PLR_PTCH_GAME_REC` | 투수 경기 기록 |
| `PLR_PTCH_MON_REC` | 투수 월 집계 기록 |
| `PLR_PTCH_SSNT_REC` | 투수 시즌 집계 기록 |
| `PLR_PTCH_TM_SSNT_REC` | 투수 팀별 시즌 집계 기록 |
| `STND` | 팀 시즌 최종 순위 |
| `DRFT` | 드래프트 이벤트 마스터 |
| `DRFT_PLR` | 드래프트 대상 선수풀 (유망주) |
| `DRFT_SCUT_RPT` | 팀별 스카우팅 리포트 |
| `DRFT_ORD` | 드래프트 지명 순서 및 결과 |
| `DRFT_BOARD` | 유저 드래프트 보드 |
| `PLR_ENTY` | 선수 엔트리 현황 (1군/2군) |
| `PLR_ENTY_HIST` | 선수 엔트리 변경 이력 (콜업·말소) |
| `FRGN_PLR_CAND` | 외국인 선수 후보 (시즌별 생성, DB 영구 저장) |
| `TM_BRDCST` | 팀-시즌별 방송국 계약 이력 (유저·AI 팀 모두) |

---

## CMN_CD (공통코드)

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| CD_ID | VARCHAR(20) | ✓ | ✓ | 코드 그룹 식별자 |
| CD_VAL | VARCHAR(20) | ✓ | ✓ | 코드 값 |
| CD_NM | VARCHAR(100) | | ✓ | 코드 한글명 |
| CD_ENG_NM | VARCHAR(100) | | | 코드 영문명 |
| CD_DESC | VARCHAR(500) | | | 코드 설명 |

### 코드 그룹

| CD_ID | 설명 |
|-------|------|
| `POSN` | 포지션코드 |
| `REPR_POSN` | 대표 포지션코드 |
| `ABLT` | 능력치코드 |
| `CITY` | 연고도시코드 |
| `GAME_STTS` | 경기상태코드 |
| `BAT_PTCH_HAND` | 투타코드 |
| `TURF_TYPE` | 잔디종류코드 |
| `CNTRCT_TYPE` | 계약 종류코드 |
| `PLR_STTS` | 선수 상태코드 |
| `HIDE_ABLT` | 히든 능력치코드 |
| `FCLTY_TYPE` | 시설 종류코드 |
| `FCLTY_STTS` | 시설 업그레이드 상태코드 |
| `STDM_EXPN_STTS` | 경기장 증축 상태코드 |
| `STFF_TYPE` | 스태프 직종코드 |
| `STFF_ABLT` | 스태프 능력치코드 |
| `GAME_TYPE` | 경기 종류코드 |
| `PLR_TRT_TYPE` | 선수 특성코드 |
| `SSNT_STTS` | 시즌 상태코드 |
| `EVNT_TYPE` | 시즌 이벤트 종류코드 |
| `SRS_STTS` | 포스트시즌 시리즈 상태코드 |
| `PSTSSNT_STTS` | 팀 포스트시즌 진출 상태코드 |

### POSN — 포지션코드

| CD_VAL | CD_NM | CD_ENG_NM |
|--------|-------|-----------|
| 10 | 선발투수 | Starting Pitcher (SP) |
| 11 | 중간계투 | Relief Pitcher (RP) |
| 12 | 마무리 | Closer (CP) |
| 20 | 포수 | Catcher (C) |
| 21 | 1루수 | First Baseman (1B) |
| 22 | 2루수 | Second Baseman (2B) |
| 23 | 3루수 | Third Baseman (3B) |
| 24 | 유격수 | Shortstop (SS) |
| 25 | 좌익수 | Left Fielder (LF) |
| 26 | 중견수 | Center Fielder (CF) |
| 27 | 우익수 | Right Fielder (RF) |
| 28 | 지명타자 | Designated Hitter (DH) |

### REPR_POSN — 대표 포지션코드

| CD_VAL | CD_NM | CD_ENG_NM | 포함 포지션 |
|--------|-------|-----------|-------------|
| 10 | 투수 | Pitcher | SP, RP, CP |
| 20 | 포수 | Catcher | C |
| 21 | 내야수 | Infielder | 1B, 2B, 3B, SS |
| 22 | 외야수 | Outfielder | LF, CF, RF, DH |

### ABLT — 능력치코드

| CD_VAL | CD_NM | CD_ENG_NM | 구분 |
|--------|-------|-----------|------|
| CNT | 컨택 | Contact | 타자 |
| PWR | 파워 | Power | 타자 |
| RUN | 주루 | Base Running | 타자 |
| THR | 송구 | Throwing | 타자 |
| STL | 도루 | Stealing | 타자 |
| VEL | 구속 | Velocity | 투수 |
| CTL | 제구 | Control | 투수 |
| BRK | 변화구 | Breaking Ball | 투수 |
| STM | 체력 | Stamina | 투수 |
| P4S | 포심 | 4-Seam Fastball | 투수 |
| P2S | 투심 | 2-Seam Fastball | 투수 |
| PCT | 커터 | Cutter | 투수 |
| PSN | 싱커 | Sinker | 투수 |
| PSL | 슬라이더 | Slider | 투수 |
| PCB | 커브 | Curveball | 투수 |
| PCH | 체인지업 | Changeup | 투수 |
| PFK | 포크 | Forkball | 투수 |

### BAT_PTCH_HAND — 투타코드

| CD_VAL | CD_NM |
|--------|-------|
| RR | 우투우타 |
| RL | 우투좌타 |
| RS | 우투양타 |
| LL | 좌투좌타 |
| LR | 좌투우타 |
| LS | 좌투양타 |

### TURF_TYPE — 잔디종류코드

| CD_VAL | CD_NM |
|--------|-------|
| NT | 천연잔디 |
| AT | 인조잔디 |
| HB | 하이브리드 |

### CNTRCT_TYPE — 계약 종류코드

| CD_VAL | CD_NM | 설명 |
|--------|-------|------|
| FA | FA 계약 | 자유계약선수 계약 |
| RC | 재계약 | 기존 팀과 연장·재계약 |
| NK | 신인 계약 | 드래프트 신인 계약 |
| FR | 외국인 계약 | 외국인 선수 계약 |

### PLR_STTS — 선수 상태코드

| CD_VAL | CD_NM | CD_ENG_NM | 설명 |
|--------|-------|-----------|------|
| AT | 활동 | Active | 정상 활동 중. 경기 출전 가능 |
| INJ | 부상 | Injured | 부상으로 이탈. 경기 출전 불가 |
| RET | 은퇴 | Retired | 은퇴. 경기 출전 불가 |
| FA | FA | Free Agent | 자유계약 상태. 소속팀 없음 |

> INJ·RET 상태의 선수는 GAME_REC(경기 기록) 등록 불가 — 애플리케이션 레이어에서 제한

### HIDE_ABLT — 히든 능력치코드

히든 능력치는 **1~20 스케일** (일반 능력치 20~80과 별도).  
GM·선수 본인에게도 비공개로, 게임 엔진 내부 연산에만 사용.

| CD_VAL | CD_NM | CD_ENG_NM | 설명 |
|--------|-------|-----------|------|
| FCN | 집중력 | Focus | 한 경기 내에서의 일관성. 높을수록 경기 중 집중력이 지속됨 |
| DRV | 승부욕 | Drive | 승리에 대한 헌신도 및 경기 중 결단력 |
| LDR | 리더십 | Leadership | 다른 선수에게 미치는 긍정적 영향력 |
| IRK | 부상위험도 | Injury Risk | 부상 빈도 및 확률. 높을수록 부상에 취약(유리몸) |
| CST | 일관성 | Consistency | 일정 경기 동안 얼마나 꾸준히 활약할 수 있는가 |
| DRT | 더티플레이 | Dirty Play | 비매너 행동 빈도. 상대를 흥분시켜 실수·카드를 유도하는 능력 |
| BGM | 중요경기 | Big Game | 중요경기에서 긴장하지 않는 능력 |
| AMB | 야망 | Ambition | 더 큰 것을 바라는 정도. 높으면 성장 빠르나 이적·연봉 요구 분쟁 가능 |
| PRF | 프로의식 | Professionalism | 필드 안팎 프로의식. 높으면 성장 빠르고 노화 속도 둔화 |
| SPT | 스포츠맨십 | Sportsmanship | 필드 내 정정당당함의 수치 |
| PAT | 참을성 | Patience | 동료·감독·연봉 협상 상황에서의 인내심 |

### FCLTY_TYPE — 시설 종류코드

| CD_VAL | CD_NM | CD_ENG_NM | 주요 효과 |
|--------|-------|-----------|-----------|
| TRNG | 훈련 시설 | Training Facility | 선수 능력치 성장률 보정 |
| YUTH | 육성 시설 | Youth Development | 2군 유망주 성장 가속 |
| ANLY | 분석 센터 | Analytics Center | 경기 전략 효율·상대 분석 정확도 |
| SCTG | 스카우팅 센터 | Scouting Center | 드래프트 스카우팅 정확도 |
| CAFE | 구단 카페테리아 | Team Cafeteria | 선수 컨디션·피로 회복 보정 |

### FCLTY_STTS — 시설 업그레이드 상태코드

| CD_VAL | CD_NM | CD_ENG_NM |
|--------|-------|-----------|
| PLAN | 계획중 | Planned |
| PROG | 진행중 | In Progress |
| CMPL | 완료 | Completed |
| CNCL | 취소 | Cancelled |

### STDM_EXPN_STTS — 경기장 증축 상태코드

| CD_VAL | CD_NM | CD_ENG_NM |
|--------|-------|-----------|
| PROG | 진행중 | In Progress |
| CMPL | 완료 | Completed |
| CNCL | 취소 | Cancelled |

### STFF_TYPE — 스태프 직종코드

| CD_VAL | CD_NM | CD_ENG_NM |
|--------|-------|-----------|
| MGR | 감독 | Manager |
| COACH | 코치 | Coach |
| SCUT | 스카우터 | Scout |
| MED | 의무·트레이너 | Medical / Trainer |
| ANLY | 분석가 | Analyst |

### STFF_ABLT — 스태프 능력치코드

스케일 **1~20** (선수 능력치 20~80과 독립 스케일).

**훈련 능력 (코치 주요)**

| CD_VAL | CD_NM | CD_ENG_NM | 설명 |
|--------|-------|-----------|------|
| TCNT | 컨택 훈련 | Coaching Contact | 타자의 컨택 능력을 향상시키는 훈련 능력 |
| TTCH | 기술 훈련 | Coaching Technical | 수비 기술 전반 향상을 위한 훈련 능력 |
| TPWR | 파워 훈련 | Coaching Power | 타자의 파워 능력을 향상시키는 훈련 능력 |
| TCTL | 제구 훈련 | Coaching Control | 투수의 제구 능력을 향상시키는 훈련 능력 |
| TSTM | 체력 훈련 | Coaching Stamina | 선수 체력·내구성 향상을 위한 훈련 능력 |
| TVEL | 구속 훈련 | Coaching Velocity | 투수의 구속 향상을 위한 훈련 능력 |
| TBRK | 변화구 훈련 | Coaching Breaking Ball | 투수의 변화구 완성도 향상 훈련 능력 |
| TRUN | 주루 훈련 | Coaching Base Running | 주루 판단력·속도 향상 훈련 능력 |
| TSTL | 도루 훈련 | Coaching Stealing | 도루 성공률 향상을 위한 훈련 능력 |

**공통 정신 능력 (전 직종)**

| CD_VAL | CD_NM | CD_ENG_NM | 설명 |
|--------|-------|-----------|------|
| DISC | 기강 유지 | Discipline | 스태프가 규율·원칙을 얼마나 중시하는가. 높으면 선수의 불만·불규칙 행동을 억제 |
| DET | 승부욕 | Determination | 일을 잘해내려는 내적 동기. 스태프 본인의 직무 완성도에 영향 |
| MOT | 의욕 부여 | Motivating | 선수에게 동기를 부여하는 능력. 팀 미팅·개인 대화·훈련 효과에 영향 |
| MAN | 인력 관리 | Man Management | 아랫사람을 효과적으로 다루는 능력. 사기 유지·갈등 관리에 영향 |
| ADP | 적응력 | Adaptability | 새 환경(구단·나라)에 빠르게 적응하는 능력 |

**의료 능력 (MED 주요)**

| CD_VAL | CD_NM | CD_ENG_NM | 설명 |
|--------|-------|-----------|------|
| SPS | 스포츠 과학 | Sports Science | 선수 체력·부상 위험을 세심하게 모니터링하는 능력 |
| PHY | 치료 능력 | Physiotherapy | 부상 방지 및 재활의 질. 높을수록 회복 기간 단축 |

**스카우팅 능력 (SCUT·ANLY 주요)**

| CD_VAL | CD_NM | CD_ENG_NM | 설명 |
|--------|-------|-----------|------|
| JPP | 성장 가능성 판단 | Judging Player Potential | 선수의 미래 성장 가능성을 정확히 평가하는 능력 |
| JPA | 현재 능력 판단 | Judging Player Ability | 선수의 현재 수준을 정확히 평가하는 능력 |
| JSA | 스태프 능력 판단 | Judging Staff Ability | 스태프 능력 수준을 평가하는 능력 |
| TAC | 전술 이해도 | Tactical Knowledge | 전술·게임 상황 이해도. 상대 분석·훈련 계획에 영향 |
| NEG | 협상 능력 | Negotiating | 이적·계약 협상을 유리하게 이끄는 능력 |
| DAT | 데이터 분석 | Analysing Data | 선수·팀 데이터를 이해하고 유용한 인사이트로 변환하는 능력 |

### GAME_TYPE — 경기 종류코드

| CD_VAL | CD_NM | CD_ENG_NM |
|--------|-------|-----------|
| REG | 정규시즌 | Regular Season |
| WC | 와일드카드 | Wild Card |
| SP | 준플레이오프 | Semi-Playoff |
| PO | 플레이오프 | Playoff |
| KS | 한국시리즈 | Korean Series |

### SSNT_STTS — 시즌 상태코드

| CD_VAL | CD_NM | CD_ENG_NM | 가능한 주요 행동 |
|--------|-------|-----------|-----------------|
| PRE | 프리시즌 | Pre-Season | 계약, 스프링캠프, 연습경기, 로스터 구성 |
| REG | 정규시즌 | Regular Season | 경기 진행, 콜업·말소, 트레이드, 부상 관리, 코치 계약 |
| POST | 포스트시즌 | Post-Season | 엔트리 고정, 플레이오프 경기 진행 |
| OFF | 오프시즌 | Off-Season | FA 계약, 방출, 드래프트, 연봉 협상 |
| CMPL | 완료 | Completed | 기록 보관, 수상 확정, 다음 시즌 생성 |

### EVNT_TYPE — 시즌 이벤트 종류코드

| CD_VAL | CD_NM | 설명 |
|--------|-------|------|
| INJ | 부상 | 선수 부상 발생 |
| RCV | 부상 회복 | 선수 복귀 |
| TRD | 트레이드 | 트레이드 발생 |
| SIGN | 계약 | 선수·스태프 계약 체결 |
| REL | 방출 | 선수 방출 |
| WARN | 구단주 경고 | 구단주로부터 경고 메시지 |
| FAN | 팬 반응 | 팬 여론 변화 알림 |
| CALL | 콜업 추천 | 마이너 콜업 추천 알림 |
| MVP | 월간 MVP | 월간 MVP 발표 |
| POST | 포스트시즌 | 포스트시즌 진출 확정 |
| REC | 기록 달성 | 개인·팀 기록 달성 |
| NEWS | 일반 뉴스 | 기타 일반 뉴스 |
| BRDCST | 방송국 계약 | 방송국 스폰서 선택/계약 이벤트. HTML 콘텐츠 포함 가능 |
| STFF | 스태프 선임 | 감독·코치 선임 안내 이벤트. HTML 콘텐츠 + 선임 버튼 포함 |
| GRWTH | 성장 | 스프링캠프 후 선수 성장 결과 |
| RCNF | 로스터 확정 | 로스터 확정 요청 이벤트 |
| FRGN_OVER | 외국인 초과 | 1군 외국인 선수 3명 초과 경고 |
| FRGN | 외국인 계약 | 외국인 선수 계약 체결/거절 결과 |
| FRGN_OPEN | 용병계약시작 | 외국인 선수 계약 기간 시작 안내 (2/1~2/10) |
| SPRNG | 스프링캠프 | 스프링 캠프 선택 필수 이벤트 (2/15 자동 발생) |
| STFF_AI | 타 구단 선임 | AI 구단 감독·코치 선임 요약 (파이프 구분 테이블 형식) |

> **EVNT_TYPE_CD 비고**: `SSNT_EVNT.EVNT_TYPE_CD`는 `CMN_CD(EVNT_TYPE)` FK 없이 VARCHAR로 관리.  
> 프론트엔드 `EVENT_TYPE_LABELS` / `EVENT_CHIP_COLOR`에서 코드별 표시명·칩 색상 정의.

### SRS_STTS — 포스트시즌 시리즈 상태코드

| CD_VAL | CD_NM | CD_ENG_NM |
|--------|-------|-----------|
| PROG | 진행중 | In Progress |
| CMPL | 완료 | Completed |

### PSTSSNT_STTS — 팀 포스트시즌 진출 상태코드

| CD_VAL | CD_NM | CD_ENG_NM |
|--------|-------|-----------|
| UNDC | 미결정 | Undecided |
| ELIM | 탈락 | Eliminated |
| CLWC | 와일드카드 확정 | Clinched Wild Card |
| CLPS | 포스트시즌 확정 | Clinched Postseason |
| CL1P | 1위 확정 | Clinched First Place |
| CHMP | 우승 | Champion |

### PLR_TRT_TYPE — 선수 특성코드

선수에게 선천적으로 부여되는 특성. 복수 보유 가능. 게임 엔진 내 연산에 영향.  
상세 효과는 `Rule.md` 참조.

**신체·부상 관련**

| CD_VAL | CD_NM | CD_ENG_NM | 효과 요약 |
|--------|-------|-----------|----------|
| IRON | 금강불괴 | Iron Body | 부상 확률 크게 감소. IRK 히든 능력치 효과 무시 |
| GLAS | 유리몸 | Glass Body | 부상 확률 크게 증가. 경미한 충돌에도 부상 가능 |
| RCVR | 빠른 회복 | Quick Recovery | 부상 후 회복 기간 크게 단축 |
| LONG | 장수 | Longevity | 노화로 인한 능력치 하락 속도 둔화 |
| AGED | 노쇠화 | Rapid Aging | 능력치 하락 속도 빠름. 피크 이후 급격히 쇠퇴 |

**성장 관련**

| CD_VAL | CD_NM | CD_ENG_NM | 효과 요약 |
|--------|-------|-----------|----------|
| ERLB | 조숙 | Early Bloomer | 어린 나이에 빠르게 성장. 피크 도달 시기 빠름 |
| LATB | 만숙 | Late Bloomer | 늦게 성장. 커리어 후반까지 성장 가능 |

**투구 관련 (투수 전용)**

| CD_VAL | CD_NM | CD_ENG_NM | 효과 요약 |
|--------|-------|-----------|----------|
| ACEM | 에이스 기질 | Ace Mentality | 중요 경기(포스트시즌, 라이벌전)에서 투구 능력 상승 |
| CLSR | 마무리 기질 | Closer Mentality | 세이브 상황·9회에서 투구 집중력·효율 상승 |
| WKHS | 내구왕 | Workhorse | 많은 이닝 소화해도 구위 유지. STM 소모율 감소 |
| CTRL | 극도의 제구 | Control Artist | 볼넷 확률 크게 감소. 제구(CTL) 능력치 추가 보너스 |
| STRK | 탈삼진 머신 | Strikeout Machine | 삼진 유도 확률 상승 |
| LHKL | 좌타자 킬러 | Left-Hand Killer | 좌타자 상대 효율 상승 |
| RHKL | 우타자 킬러 | Right-Hand Killer | 우타자 상대 효율 상승 |

**타격 관련 (타자 전용)**

| CD_VAL | CD_NM | CD_ENG_NM | 효과 요약 |
|--------|-------|-----------|----------|
| CLTH | 클러치 히터 | Clutch Hitter | 득점권(1·2루, 만루)에서 타율·장타율 보너스 |
| PWRH | 파워 히터 | Power Hitter | 홈런·장타 확률 추가 보너스. PWR 능력치 연산 강화 |
| CTMN | 컨택 머신 | Contact Machine | 삼진 아웃 확률 크게 감소. 컨택(CNT) 능력치 연산 강화 |
| DSPY | 선구안 | Plate Discipline | 볼넷 선택 능력 향상. 헛스윙 감소 |
| BDBL | 배드볼 히터 | Bad Ball Hitter | 스트라이크존 외 공에도 강한 타격 |
| SPDM | 번개발 | Speed Demon | 도루 성공률·주루 능력 추가 보너스. RUN·STL 연산 강화 |

**정신·성격 관련**

| CD_VAL | CD_NM | CD_ENG_NM | 효과 요약 |
|--------|-------|-----------|----------|
| COMP | 승부사 | Competitor | 중요 상황에서 집중력·결단력 상승. BGM 히든 능력치 효과 배가 |
| MNTL | 멘탈 강자 | Mental Giant | 연패·역경 속에서도 능력치 유지. 압박에 강함 |
| TPLR | 팀 플레이어 | Team Player | 팀 사기·분위기에 긍정적 영향. LDR 히든 능력치 효과 보조 |
| GRND | 악바리 | Grinder | 체력·컨디션 낮아도 능력치 감소 폭 작음 |
| DRTY | 더티 플레이어 | Dirty Player | 비매너 플레이 빈도 증가. DRT 히든 능력치 효과 배가 |
| SPRT | 스포츠맨 | Sportsman | 항상 클린 플레이. 퇴장·경고 확률 0 |

---

## STDM (경기장)

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| STDM_ID | BIGINT AUTO_INCREMENT | ✓ | ✓ | 경기장ID |
| STDM_KR_NM | VARCHAR(100) | | ✓ | 경기장 한글명 |
| STDM_ENG_NM | VARCHAR(150) | | | 경기장 영문명 |
| STDM_SHRT_KR_NM | VARCHAR(30) | | | 짧은 한글명 |
| STDM_SHRT_ENG_NM | VARCHAR(30) | | | 짧은 영문명 |
| STDM_LOC | VARCHAR(200) | | | 소재지 |
| STDM_ESTBLSH_DT | DATE | | | 개장일자 |
| STDM_SEAT_CNT | INT | | | 수용 좌석수 |
| LF_DIST | SMALLINT | | | 좌펜스 거리 (m) |
| LCF_DIST | SMALLINT | | | 좌중간 펜스 거리 (m) |
| CF_DIST | SMALLINT | | | 중앙 펜스 거리 (m) |
| RCF_DIST | SMALLINT | | | 우중간 펜스 거리 (m) |
| RF_DIST | SMALLINT | | | 우펜스 거리 (m) |
| FENCE_HGT | DECIMAL(4,1) | | | 펜스 높이 (m) |
| TURF_TYPE_CD | CHAR(2) FK→CMN_CD(TURF_TYPE) | | | 잔디종류코드 |

> STDM_HIST에 동일 컬럼 포함 — 리모델링 시 이력 보존

### KBO 경기장 STDM_ID

| STDM_ID | STDM_SHRT_KR_NM | 사용 구단 |
|---------|-----------------|-----------|
| 1 | 챔피언스 필드 | KIA |
| 2 | 라이온즈파크 | 삼성 |
| 3 | 잠실 | LG, 두산 (공용) |
| 4 | KT위즈파크 | KT |
| 5 | 랜더스필드 | SSG |
| 6 | 사직 | 롯데 |
| 7 | 이글스파크 | 한화 |
| 8 | NC파크 | NC |
| 9 | 고척돔 | 키움 |

---

## STDM_HIST (경기장 이력)

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| STDM_ID | BIGINT FK→STDM | ✓ | ✓ | 경기장ID |
| HIST_SEQ | INT | ✓ | ✓ | 이력순번 |
| HIST_DT | DATE | | ✓ | 변경일자 |
| STDM_KR_NM | VARCHAR(100) | | ✓ | 경기장 한글명 |
| STDM_ENG_NM | VARCHAR(150) | | | 경기장 영문명 |
| STDM_SHRT_KR_NM | VARCHAR(30) | | | 짧은 한글명 |
| STDM_SHRT_ENG_NM | VARCHAR(30) | | | 짧은 영문명 |
| STDM_LOC | VARCHAR(200) | | | 소재지 |
| STDM_SEAT_CNT | INT | | | 수용 좌석수 |
| LF_DIST | SMALLINT | | | 좌펜스 거리 (m) |
| LCF_DIST | SMALLINT | | | 좌중간 펜스 거리 (m) |
| CF_DIST | SMALLINT | | | 중앙 펜스 거리 (m) |
| RCF_DIST | SMALLINT | | | 우중간 펜스 거리 (m) |
| RF_DIST | SMALLINT | | | 우펜스 거리 (m) |
| FENCE_HGT | DECIMAL(4,1) | | | 펜스 높이 (m) |
| TURF_TYPE_CD | CHAR(2) | | | 잔디종류코드 |

---

## TM (팀)

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| TM_ID | BIGINT AUTO_INCREMENT | ✓ | ✓ | 팀ID |
| TM_KR_NM | VARCHAR(50) | | ✓ | 팀 한글명 |
| TM_ENG_NM | VARCHAR(100) | | | 팀 영문명 |
| TM_SHRT_KR_NM | VARCHAR(20) | | | 팀 짧은 한글명 |
| TM_SHRT_ENG_NM | VARCHAR(20) | | | 팀 짧은 영문명 |
| TM_ESTBLSH_DT | DATE | | | 팀 설립일자 |
| CITY_CD | VARCHAR(10) FK→CMN_CD(CITY) | | | 연고도시코드 |
| STDM_ID | BIGINT FK→STDM | | | 주 사용 경기장ID |

### KBO 10개 구단 TM_ID

| TM_ID | TM_KR_NM | TM_SHRT_ENG_NM |
|-------|----------|----------------|
| 1 | KIA 타이거즈 | KIA |
| 2 | 삼성 라이온즈 | SS |
| 3 | LG 트윈스 | LG |
| 4 | 두산 베어스 | OB |
| 5 | KT 위즈 | KT |
| 6 | SSG 랜더스 | SSG |
| 7 | 롯데 자이언츠 | LT |
| 8 | 한화 이글스 | HH |
| 9 | NC 다이노스 | NC |
| 10 | 키움 히어로즈 | WO |

---

## PLR (선수)

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| PLR_ID | BIGINT AUTO_INCREMENT | ✓ | ✓ | 선수ID |
| PLR_NM | VARCHAR(50) | | ✓ | 선수명 (한글) |
| PLR_ENG_NM | VARCHAR(100) | | | 선수 영문명 |
| PLR_HGT | SMALLINT | | | 키 (cm) |
| PLR_WGT | SMALLINT | | | 몸무게 (kg) |
| PLR_BRTH_LOC | VARCHAR(100) | | | 출생지 |
| PLR_HS_NM | VARCHAR(100) | | | 출신 고등학교 |
| PLR_DRFT_RND | TINYINT | | | 드래프트 라운드 |
| PLR_DRFT_NO | SMALLINT | | | 드래프트 지명 순번 (라운드 내) |
| PLR_BAT_PTCH_HAND_CD | CHAR(2) FK→CMN_CD(BAT_PTCH_HAND) | | | 투타코드 |
| PLR_ANSL_SAL | BIGINT | | | 연봉 (단위: 만원) |
| PLR_NTNLT | VARCHAR(50) | | | 국적 |
| PLR_FRGN_YN | CHAR(1) | | | 외국인 여부 ('1'=외국인, '0'=국내) |
| PLR_STTS_CD | CHAR(3) FK→CMN_CD(PLR_STTS) | | ✓ | 선수 상태코드 (AT/INJ/RET/FA) |
| PLR_OVRL_ABLT | TINYINT | | | 현재 종합능력치 (20~80). 성장·노화에 따라 변동 |
| PLR_POT_ABLT | TINYINT | | | 잠재능력치 (20~80). 최대 성장 한계, 불변 |
| TM_ID | BIGINT FK→TM | | | 현재 소속팀ID (FA·은퇴 시 NULL) |

### 선수 PLR_ID 범위

| 범위 | 구단 |
|------|------|
| 1~10 | KIA 타이거즈 |
| 11~20 | 삼성 라이온즈 |
| 21~30 | LG 트윈스 |
| 31~40 | 두산 베어스 |
| 41~50 | KT 위즈 |
| 51~60 | SSG 랜더스 |
| 61~70 | 롯데 자이언츠 |
| 71~80 | 한화 이글스 |
| 81~90 | NC 다이노스 |
| 91~100 | 키움 히어로즈 |

---

## TM_HIST (팀 이력)

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| TM_ID | BIGINT FK→TM | ✓ | ✓ | 팀ID |
| HIST_SEQ | INT | ✓ | ✓ | 이력순번 |
| HIST_DT | DATE | | ✓ | 변경일자 |
| TM_KR_NM | VARCHAR(50) | | ✓ | 팀 한글명 |
| TM_ENG_NM | VARCHAR(100) | | | 팀 영문명 |
| TM_SHRT_KR_NM | VARCHAR(20) | | | 팀 짧은 한글명 |
| TM_SHRT_ENG_NM | VARCHAR(20) | | | 팀 짧은 영문명 |
| CITY_CD | VARCHAR(10) | | | 연고도시코드 |
| STDM_ID | BIGINT | | | 경기장ID |

---

## TM_STDM (팀-경기장 관계)

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| TM_ID | BIGINT FK→TM | ✓ | ✓ | 팀ID |
| STDM_ID | BIGINT FK→STDM | ✓ | ✓ | 경기장ID |
| STDM_USE_DT | DATE | | ✓ | 사용 시작일자 |
| STDM_END_DT | DATE | | | 사용 종료일자 (NULL=현재 사용) |

---

## TM_FNC_SSNT (팀 재정 시즌별)

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| TM_ID | BIGINT FK→TM | ✓ | ✓ | 팀ID |
| SSNT_YR | YEAR | ✓ | ✓ | 시즌 연도 |
| STR_CASH | BIGINT | | | 시즌 시작 시 보유 현금 (만원) |
| CUR_CASH | BIGINT | | | 현재 보유 현금 (만원) |
| TOT_BDGT | BIGINT | | | 시즌 전체 운영 예산 (만원) |
| PLR_SAL_BDGT | BIGINT | | | 선수단 연봉 예산 (만원) |
| COACH_BDGT | BIGINT | | | 코치 예산 (만원) |
| DVLP_BDGT | BIGINT | | | 육성·훈련 예산 (만원) |
| MKT_BDGT | BIGINT | | | 마케팅 예산 (만원) |
| FCLTY_BDGT | BIGINT | | | 시설 투자 예산 (만원) |
| CUR_PLR_SAL_COST | BIGINT | | | 현재 사용 중인 선수단 연봉 총액 (만원) |
| CUR_SCUT_COST | BIGINT | | | 현재까지 사용한 스카우팅 비용 (만원) |
| CUR_DVLP_COST | BIGINT | | | 현재까지 사용한 육성 비용 (만원) |
| CUR_MKT_COST | BIGINT | | | 현재까지 사용한 마케팅 비용 (만원) |
| CUR_FCLTY_COST | BIGINT | | | 현재까지 사용한 시설 투자 비용 (만원) |
| TCKT_REV | BIGINT | | | 입장권 수익 (만원) |
| SSNT_TCKT_REV | BIGINT | | | 시즌권 수익 (만원) |
| MRCH_REV | BIGINT | | | 굿즈·상품 판매 수익 (만원) |
| SPNS_REV | BIGINT | | | 스폰서 수익 (만원) |
| BCST_REV | BIGINT | | | 중계권·리그 배분 수익 (만원) |
| PSTSSNT_REV | BIGINT | | | 포스트시즌 추가 수익 (만원) |
| ETC_REV | BIGINT | | | 기타 수익 (만원) |
| PLR_SAL_COST | BIGINT | | | 선수 연봉 지출 (만원) |
| STFF_COST | BIGINT | | | 코칭스태프·프런트 인건비 (만원) |
| OPR_COST | BIGINT | | | 일반 운영비 (만원) |
| OWN_SUPP | BIGINT | | | 구단주·모기업 추가 지원금 (만원) |
| DEBT | BIGINT | | | 구단 부채·누적 적자 (만원, 양수=부채) |

---

## TM_FCLTY (팀 시설 현황)

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| TM_ID | BIGINT FK→TM | ✓ | ✓ | 팀ID |
| FCLTY_TYPE_CD | VARCHAR(4) FK→CMN_CD(FCLTY_TYPE) | ✓ | ✓ | 시설 종류코드 |
| FCLTY_LVL | TINYINT | | ✓ | 시설 레벨 (1~10) |

> 레벨 1=최하, 10=최고. 경기장 증축(STDM)은 레벨 개념 없음. 업그레이드 이력은 TM_FCLTY_UPGR에 기록.
> **시즌 종료 시 자동 하락**: 매 시즌 종료 후 STDM 제외 시설이 각각 랜덤 1~3단계 하락 (최소 1단계 유지). 신기술 등장으로 기존 시설이 상대적으로 노후화되는 규칙.

---

## FCLTY_UPGR_COST_CFG (시설 업그레이드 비용 설정)

시설 종류별·레벨별 업그레이드 비용 및 기간을 코드로 관리.

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| FCLTY_TYPE_CD | VARCHAR(4) | ✓ | ✓ | 시설 종류코드 |
| FROM_LVL | TINYINT | ✓ | ✓ | 현재 레벨 |
| TO_LVL | TINYINT | | ✓ | 업그레이드 후 레벨 (항상 FROM_LVL+1) |
| UPGR_COST | BIGINT | | ✓ | 업그레이드 비용 (만원) |
| UPGR_DAYS | INT | | ✓ | 공사 기간 (일) |

---

## STDM_EXPN (경기장 증축 이력)

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| EXPN_ID | BIGINT AUTO_INCREMENT | ✓ | ✓ | 증축ID |
| STDM_ID | BIGINT FK→STDM | | ✓ | 경기장ID |
| TM_ID | BIGINT FK→TM | | ✓ | 팀ID |
| BFR_SEAT_CNT | INT | | ✓ | 증축 전 좌석수 |
| AFT_SEAT_CNT | INT | | ✓ | 증축 후 좌석수 |
| EXPN_COST | BIGINT | | ✓ | 증축 비용 (만원) |
| EXPN_BGNG_DT | DATE | | ✓ | 공사 시작일 |
| EXPN_END_DT | DATE | | | 완료 예정일 |
| EXPN_STTS_CD | VARCHAR(4) FK→CMN_CD(STDM_EXPN_STTS) | | ✓ | 진행상태 (PROG/CMPL/CNCL) |

---

## STDM_EXPN_COST_CFG (경기장 증축 비용 설정)

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| EXPN_STEP | TINYINT | ✓ | ✓ | 증축 단계 |
| ADD_SEAT_CNT | INT | | ✓ | 증가 좌석수 |
| EXPN_COST | BIGINT | | ✓ | 증축 비용 (만원) |
| EXPN_DAYS | INT | | ✓ | 공사 기간 (일) |
| EXPN_DESC | VARCHAR(200) | | | 설명 |

---

## TM_FCLTY_UPGR (팀 시설 업그레이드 이력)

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| UPGR_ID | BIGINT AUTO_INCREMENT | ✓ | ✓ | 업그레이드ID |
| TM_ID | BIGINT FK→TM | | ✓ | 팀ID |
| FCLTY_TYPE_CD | VARCHAR(4) FK→CMN_CD(FCLTY_TYPE) | | ✓ | 시설 종류코드 |
| FROM_LVL | TINYINT | | ✓ | 업그레이드 전 레벨 |
| TO_LVL | TINYINT | | ✓ | 업그레이드 후 레벨 |
| UPGR_COST | BIGINT | | ✓ | 투자 금액 (만원) |
| UPGR_BGNG_DT | DATE | | ✓ | 공사 시작일 |
| UPGR_END_DT | DATE | | | 완료 예정일 (CMPL 시 실제 완료일) |
| UPGR_STTS_CD | VARCHAR(4) FK→CMN_CD(FCLTY_STTS) | | ✓ | 업그레이드 상태 (PLAN/PROG/CMPL/CNCL) |

---

## TM_MKT_SSNT (팀 시장·팬덤 시즌별)

스케일 20~80 (선수 능력치 동일 기준).

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| TM_ID | BIGINT FK→TM | ✓ | ✓ | 팀ID |
| SSNT_YR | YEAR | ✓ | ✓ | 시즌 연도 |
| MKT_SZ | TINYINT | | | 연고 시장 규모 (20~80). 수익 잠재력에 영향 |
| PPLT_RTG | TINYINT | | | 팀 인기 (20~80). 관중·굿즈·스폰서 수익에 영향 |
| FAN_LYLTY | TINYINT | | | 팬 충성도 (20~80). 성적 하락 시 관중 감소 완충 |
| FAN_EXP | TINYINT | | | 팬 기대치 (20~80). 높을수록 성적 부진 시 여론 악화 큼 |
| REG_INTRST | TINYINT | | | 지역 야구 관심도 (20~80). 장기 관중 기반에 영향 |
| NATNL_PPLT | TINYINT | | | 전국구 인기 (20~80). 원정 관중·굿즈·미디어 효과에 영향 |
| MRCH_PWR | TINYINT | | | 굿즈 판매력 (20~80). 스타 선수·성적에 영향받음 |
| AVG_ATND_CNT | INT | | | 현재 시즌 경기당 평균 관중 수 |
| SSNT_TCKT_HLDR | INT | | | 시즌권 보유자 수 |

---

## PLR_TM (선수-팀 소속)

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| PLR_ID | BIGINT FK→PLR | ✓ | ✓ | 선수ID |
| TM_ID | BIGINT FK→TM | ✓ | ✓ | 팀ID |
| TM_BGNG_DT | DATE | ✓ | ✓ | 소속 시작일자 |
| TM_END_DT | DATE | | | 소속 종료일자 (NULL=현재 소속) |

> PK에 TM_BGNG_DT 포함 — 동일 팀 재입단(A→B→A 복귀 이적) 복수 기록 지원

---

## PLR_TM_CNTRCT (선수-팀 계약)

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| PLR_ID | BIGINT FK→PLR | ✓ | ✓ | 선수ID |
| TM_ID | BIGINT FK→TM | ✓ | ✓ | 팀ID |
| FA_CNTRCT_BGNG_DT | DATE | ✓ | ✓ | 계약 시작일 |
| FA_AMT | BIGINT | | | 계약 총액 (단위: 만원) |
| FA_CNTRCT_END_DT | DATE | | | 계약 종료일 |
| REPR_POSN_CD | CHAR(2) | | | 대표 포지션코드 (REPR_POSN) |
| CNTRCT_TYPE_CD | CHAR(2) FK→CMN_CD(CNTRCT_TYPE) | | | 계약 종류 (FA/RC/NK/FR) |

> PK에 FA_CNTRCT_BGNG_DT 포함 — 동일 팀과 복수 계약(재계약·FA 복귀) 지원

---

## PLR_TM_CNTRCT_HIST (선수-팀 계약 이력)

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| PLR_ID | BIGINT FK→PLR | ✓ | ✓ | 선수ID |
| TM_ID | BIGINT FK→TM | ✓ | ✓ | 팀ID |
| FA_CNTRCT_BGNG_DT | DATE | ✓ | ✓ | 계약 시작일 (부모 PK 참조) |
| HIST_SEQ | INT | ✓ | ✓ | 이력순번 |
| HIST_DT | DATE | | ✓ | 변경일자 |
| FA_AMT | BIGINT | | | 계약 총액 (단위: 만원) |
| FA_CNTRCT_END_DT | DATE | | | 계약 종료일 |
| REPR_POSN_CD | CHAR(2) | | | 대표 포지션코드 (REPR_POSN) |
| CNTRCT_TYPE_CD | CHAR(2) | | | 계약 종류 |

---

## PLR_POSN (선수-포지션 관계)

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| PLR_ID | BIGINT FK→PLR | ✓ | ✓ | 선수ID |
| POSN_CD | CHAR(2) | ✓ | ✓ | 포지션코드 (POSN, 2자리) |
| POSN_PRFC_ABLT | TINYINT | | ✓ | 포지션 숙련도 능력치 (20~80) |

---

## PLR_ABLT (선수-능력치)

현재 능력치. 이력 계층:

```
PLR_ABLT (현재값)
  ├─ PLR_ABLT_MON   ← 매월 말 스냅샷 (시즌 내 성장 곡선)
  └─ PLR_ABLT_SSNT  ← 시즌 시작 스냅샷 (연도 간 비교)
```

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| PLR_ID | BIGINT FK→PLR | ✓ | ✓ | 선수ID |
| ABLT_CD | VARCHAR(5) | ✓ | ✓ | 능력치코드 (ABLT) |
| ABLT_VAL | TINYINT | | ✓ | 능력치 수치 (20~80, 50=KBO 평균) |

---

## PLR_ABLT_MON (선수 능력치 월별 이력)

매월 말 PLR_ABLT 스냅샷. 시즌 내 성장·부상·트레이닝 효과 곡선 추적.

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| PLR_ID | BIGINT FK→PLR | ✓ | ✓ | 선수ID |
| SSNT_YR | YEAR | ✓ | ✓ | 시즌 연도 |
| MON | TINYINT | ✓ | ✓ | 월 (1~12) |
| ABLT_CD | VARCHAR(5) FK→CMN_CD(ABLT) | ✓ | ✓ | 능력치코드 |
| ABLT_VAL | TINYINT | | ✓ | 능력치 수치 (20~80) |

---

## PLR_ABLT_SSNT (선수 능력치 연도별 이력)

매 시즌 시작 시 PLR_ABLT 스냅샷. 연도 간 장기 성장·노화 비교 기반.

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| PLR_ID | BIGINT FK→PLR | ✓ | ✓ | 선수ID |
| SSNT_YR | YEAR | ✓ | ✓ | 시즌 연도 |
| ABLT_CD | VARCHAR(5) FK→CMN_CD(ABLT) | ✓ | ✓ | 능력치코드 |
| ABLT_VAL | TINYINT | | ✓ | 능력치 수치 (20~80) |

---

## PLR_HIDE_ABLT (선수 히든 능력치)

GM·선수 모두에게 비공개. 게임 엔진 내부 연산 전용. 한 번 설정된 값은 원칙적으로 불변이나, 특정 이벤트(코칭, 부상 등)에 의해 일부 항목은 변동될 수 있음.

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| PLR_ID | BIGINT FK→PLR | ✓ | ✓ | 선수ID |
| HIDE_ABLT_CD | VARCHAR(3) FK→CMN_CD(HIDE_ABLT) | ✓ | ✓ | 히든 능력치코드 |
| HIDE_ABLT_VAL | TINYINT | | ✓ | 히든 능력치 수치 (1~20) |

> 스케일 1~20 (일반 능력치 20~80과 독립 스케일). 10=평균

---

## PLR_TRT (선수 특성)

선수에게 선천적으로 부여되는 특성. 복수 보유 가능하며 게임 생성 시 설정, 이후 불변.

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| PLR_ID | BIGINT FK→PLR | ✓ | ✓ | 선수ID |
| TRT_CD | VARCHAR(4) FK→CMN_CD(PLR_TRT_TYPE) | ✓ | ✓ | 특성코드 |

> 특성 효과는 `Rule.md — 선수 특성 시스템` 참조

---

## PLR_POSN_SSNT (선수 포지션 연도별 이력)

매 시즌 시작 시 PLR_POSN 스냅샷.

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| PLR_ID | BIGINT FK→PLR | ✓ | ✓ | 선수ID |
| SSNT_YR | YEAR | ✓ | ✓ | 시즌 연도 |
| POSN_CD | CHAR(2) FK→CMN_CD(POSN) | ✓ | ✓ | 포지션코드 |
| POSN_PRFC_ABLT | TINYINT | | ✓ | 포지션 숙련도 (20~80) |

---

## PLR_ANSL_SAL_HIST (선수 연봉 연도별 이력)

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| PLR_ID | BIGINT FK→PLR | ✓ | ✓ | 선수ID |
| SSNT_YR | YEAR | ✓ | ✓ | 시즌 연도 |
| ANSL_SAL | BIGINT | | ✓ | 연봉 (단위: 만원) |

---

## STFF (스태프)

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| STFF_ID | BIGINT AUTO_INCREMENT | ✓ | ✓ | 스태프ID |
| STFF_NM | VARCHAR(50) | | ✓ | 스태프명 (한글) |
| STFF_ENG_NM | VARCHAR(100) | | | 스태프 영문명 |
| STFF_TYPE_CD | VARCHAR(5) FK→CMN_CD(STFF_TYPE) | | ✓ | 직종코드 (MGR/COACH/SCUT/MED/ANLY) |
| STFF_NTNLT | VARCHAR(50) | | | 국적 |
| STFF_FRGN_YN | CHAR(1) | | | 외국인 여부 ('1'=외국인, '0'=국내) |
| STFF_BRTH_DT | DATE | | | 생년월일 |
| STFF_EXP_YR | TINYINT | | | 경력 연수 |
| STFF_ANSL_SAL | BIGINT | | | 연봉 (만원) |
| STFF_STTS_CD | CHAR(3) FK→CMN_CD(PLR_STTS) | | ✓ | 상태코드 (AT/RET/FA) |
| TM_ID | BIGINT FK→TM | | | 현재 소속팀ID |

---

## STFF_TM (스태프-팀 소속)

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| STFF_ID | BIGINT FK→STFF | ✓ | ✓ | 스태프ID |
| TM_ID | BIGINT FK→TM | ✓ | ✓ | 팀ID |
| STFF_BGNG_DT | DATE | ✓ | ✓ | 소속 시작일자 |
| STFF_END_DT | DATE | | | 소속 종료일자 (NULL=현재 소속) |

---

## STFF_TM_CNTRCT (스태프 계약)

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| STFF_ID | BIGINT FK→STFF | ✓ | ✓ | 스태프ID |
| TM_ID | BIGINT FK→TM | ✓ | ✓ | 팀ID |
| CNTRCT_BGNG_DT | DATE | ✓ | ✓ | 계약 시작일 |
| ANSL_SAL | BIGINT | | | 연봉 (만원) |
| CNTRCT_END_DT | DATE | | | 계약 종료일 |
| STFF_ROLE_CD | VARCHAR(5) | | | 담당 역할 코드 (직종 내 세부 역할) |

---

## STFF_ABLT (스태프 능력치)

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| STFF_ID | BIGINT FK→STFF | ✓ | ✓ | 스태프ID |
| STFF_ABLT_CD | VARCHAR(4) FK→CMN_CD(STFF_ABLT) | ✓ | ✓ | 스태프 능력치코드 |
| STFF_ABLT_VAL | TINYINT | | ✓ | 능력치 수치 (1~20) |

---

## SSNT (시즌 마스터)

시즌 전체 진행 상태와 현재 날짜 포인터를 관리한다.

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| SSNT_YR | YEAR | ✓ | ✓ | 시즌 연도 |
| SSNT_STTS_CD | VARCHAR(4) FK→CMN_CD(SSNT_STTS) | | ✓ | 시즌 상태코드 (PRE/REG/POST/OFF/CMPL) |
| SSNT_BGNG_DT | DATE | | ✓ | 시즌 전체 시작일 (스프링캠프 포함) |
| REG_SSNT_BGNG_DT | DATE | | | 정규시즌 개막일 |
| REG_SSNT_END_DT | DATE | | | 정규시즌 종료일 |
| PSTSSNT_BGNG_DT | DATE | | | 포스트시즌 시작일 |
| PSTSSNT_END_DT | DATE | | | 포스트시즌 종료일 |
| SSNT_END_DT | DATE | | | 시즌 전체 종료일 |
| CUR_DT | DATE | | ✓ | 현재 진행 날짜 (게임 루프 포인터) |

> `CUR_DT` 는 유저가 "다음 날 진행" 버튼을 누를 때 서버가 참조하는 핵심 포인터.

---

## STND (팀 순위·상태)

시즌 중 매일 갱신되는 팀 순위 및 상태 테이블.  
야구 세부 기록은 `TM_SSNT_REC` / `TM_MON_REC` 에 분리 저장.

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| TM_ID | BIGINT FK→TM | ✓ | ✓ | 팀ID |
| SSNT_YR | YEAR | ✓ | ✓ | 시즌 연도 |
| W | SMALLINT | | ✓ | 승 |
| L | SMALLINT | | ✓ | 패 |
| T | SMALLINT | | ✓ | 무 |
| PCT | DECIMAL(5,4) | | | 승률 (W / (W+L), 소수 4자리) |
| GB | DECIMAL(4,1) | | | 게임차 (수위팀 대비) |
| HOME_W | SMALLINT | | | 홈 승 |
| HOME_L | SMALLINT | | | 홈 패 |
| AWAY_W | SMALLINT | | | 원정 승 |
| AWAY_L | SMALLINT | | | 원정 패 |
| RS | SMALLINT | | | 득점 (Runs Scored) |
| RA | SMALLINT | | | 실점 (Runs Allowed) |
| RUN_DIFF | SMALLINT | | | 득실차 (RS - RA) |
| STRK_TYPE | CHAR(1) | | | 연속 유형 (W=연승 / L=연패 / D=연무승부 / N=없음) |
| STRK_CNT | TINYINT UNSIGNED | | | 연속 경기 수 |
| L10_W | TINYINT | | | 최근 10경기 승 |
| L10_L | TINYINT | | | 최근 10경기 패 |
| L10_T | TINYINT | | | 최근 10경기 무 |
| STND_RNK | TINYINT | | | 현재 순위 |
| TM_MORL | TINYINT | | | 팀 분위기 (20~80). 연승·연패에 따라 변동 |
| FAN_STSFCTN | TINYINT | | | 팬 만족도 (20~80). 성적·이벤트에 따라 변동 |
| OWN_STSFCTN | TINYINT | | | 구단주 만족도 (20~80). 성적·예산 집행에 따라 변동 |
| PSTSSNT_STTS | CHAR(4) FK→CMN_CD(PSTSSNT_STTS) | | | 포스트시즌 진출 상태 (UNDC/ELIM/CLWC/CLPS/CL1P/CHMP) |

---

## TM_SSNT_REC (팀 시즌 누적 기록)

팀의 타격·투구·수비 세부 기록을 시즌 단위로 누적.  
STND가 순위·상태 중심이라면, TM_SSNT_REC는 야구 기록 중심.

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| TM_ID | BIGINT FK→TM | ✓ | ✓ | 팀ID |
| SSNT_YR | YEAR | ✓ | ✓ | 시즌 연도 |
| RS | SMALLINT UNSIGNED | | ✓ | 득점 |
| RA | SMALLINT UNSIGNED | | ✓ | 실점 |
| H | SMALLINT UNSIGNED | | ✓ | 안타 |
| DOBL | SMALLINT UNSIGNED | | | 2루타 |
| TRPL | SMALLINT UNSIGNED | | | 3루타 |
| HR | SMALLINT UNSIGNED | | | 홈런 |
| BB | SMALLINT UNSIGNED | | | 볼넷 |
| SO | SMALLINT UNSIGNED | | | 삼진 |
| SB | SMALLINT UNSIGNED | | | 도루 |
| CS | SMALLINT UNSIGNED | | | 도루 실패 |
| E | SMALLINT UNSIGNED | | | 실책 |
| IP_OUT | INT UNSIGNED | | | 팀 투구 이닝 (아웃카운트, 3=1이닝) |
| HA | SMALLINT UNSIGNED | | | 피안타 |
| HRA | SMALLINT UNSIGNED | | | 피홈런 |
| BBA | SMALLINT UNSIGNED | | | 허용 볼넷 |
| SOA | SMALLINT UNSIGNED | | | 탈삼진 |
| ERA | SMALLINT UNSIGNED | | | 자책점 |

---

## TM_MON_REC (팀 월간 누적 기록)

팀 기록 월간 집계. 월간 MVP, 월간 성적 비교에 사용.

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| TM_ID | BIGINT FK→TM | ✓ | ✓ | 팀ID |
| SSNT_YR | YEAR | ✓ | ✓ | 시즌 연도 |
| MON | TINYINT | ✓ | ✓ | 월 (1~12) |
| W | SMALLINT UNSIGNED | | ✓ | 월간 승 |
| L | SMALLINT UNSIGNED | | ✓ | 월간 패 |
| T | SMALLINT UNSIGNED | | ✓ | 월간 무 |
| RS | SMALLINT UNSIGNED | | ✓ | 월간 득점 |
| RA | SMALLINT UNSIGNED | | ✓ | 월간 실점 |
| H | SMALLINT UNSIGNED | | | 월간 안타 |
| DOBL | SMALLINT UNSIGNED | | | 월간 2루타 |
| TRPL | SMALLINT UNSIGNED | | | 월간 3루타 |
| HR | SMALLINT UNSIGNED | | | 월간 홈런 |
| BB | SMALLINT UNSIGNED | | | 월간 볼넷 |
| SO | SMALLINT UNSIGNED | | | 월간 삼진 |
| SB | SMALLINT UNSIGNED | | | 월간 도루 |
| CS | SMALLINT UNSIGNED | | | 월간 도루 실패 |
| E | SMALLINT UNSIGNED | | | 월간 실책 |
| IP_OUT | INT UNSIGNED | | | 월간 팀 투구 이닝 (아웃카운트) |
| HA | SMALLINT UNSIGNED | | | 월간 피안타 |
| HRA | SMALLINT UNSIGNED | | | 월간 피홈런 |
| BBA | SMALLINT UNSIGNED | | | 월간 허용 볼넷 |
| SOA | SMALLINT UNSIGNED | | | 월간 탈삼진 |
| ERA | SMALLINT UNSIGNED | | | 월간 자책점 |

---

## PLR_FATG_COND (선수 피로도·컨디션)

선수별 시즌 피로도(FATG)와 컨디션(COND) 관리. 경기 출전/미출전 시 자동 갱신.

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| PLR_ID | BIGINT FK→PLR | ✓ | ✓ | 선수ID |
| SSNT_YR | YEAR | ✓ | ✓ | 시즌 연도 |
| FATG | TINYINT UNSIGNED | | ✓ | 피로도 (1~100, 높을수록 피로) |
| COND | TINYINT UNSIGNED | | ✓ | 컨디션 (1~100, 높을수록 좋음) |
| UPD_DT | DATETIME | | ✓ | 마지막 갱신 일시 (자동갱신) |

> - 기본값: FATG=30, COND=70 (시즌 시작 시)
> - 체력(STM) 능력치가 높을수록 피로도 증가량 감소 (STM 60+: 0.8배, STM 40-: 1.2배)
> - 컨디션은 매일 ±5 랜덤 변동 (경기 후 추가 변동 발생)
> - 능력치 보정: 피로도 70+/컨디션 40- 구간에서 실제 능력치 최대 25% 감소

---

## SSNT_EVNT (시즌 이벤트·뉴스)

시즌 중 발생하는 모든 이벤트를 기록. UI 뉴스피드의 소스 데이터.

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| EVNT_ID | BIGINT AUTO_INCREMENT | ✓ | ✓ | 이벤트ID |
| SSNT_YR | YEAR | | ✓ | 시즌 연도 |
| EVNT_DT | DATE | | ✓ | 이벤트 발생일자 |
| TM_ID | BIGINT FK→TM | | | 관련 팀ID (없으면 NULL) |
| PLR_ID | BIGINT FK→PLR | | | 관련 선수ID (없으면 NULL) |
| EVNT_TYPE_CD | VARCHAR(4) FK→CMN_CD(EVNT_TYPE) | | ✓ | 이벤트 종류코드 |
| EVNT_TTLT | VARCHAR(200) | | ✓ | 이벤트 제목 |
| EVNT_CNTS | TEXT | | | 이벤트 상세 내용 |
| RD_YN | CHAR(1) | | ✓ | 읽기 여부 (0=미읽음, 1=읽음, 기본값 '0') |

---

## PSTSSNT_SRS (포스트시즌 시리즈)

포스트시즌 4개 라운드 각각을 하나의 시리즈로 관리.

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| SSNT_YR | YEAR | ✓ | ✓ | 시즌 연도 |
| RND_CD | CHAR(2) FK→CMN_CD(GAME_TYPE) | ✓ | ✓ | 라운드코드 (WC/SP/PO/KS) |
| TM1_ID | BIGINT FK→TM | | ✓ | 팀1 ID (높은 시드) |
| TM2_ID | BIGINT FK→TM | | ✓ | 팀2 ID (낮은 시드) |
| TM1_WIN_CNT | TINYINT | | ✓ | 팀1 시리즈 승 수 |
| TM2_WIN_CNT | TINYINT | | ✓ | 팀2 시리즈 승 수 |
| WIN_TM_ID | BIGINT FK→TM | | | 시리즈 승자 팀ID (진행중이면 NULL) |
| SRS_STTS_CD | CHAR(4) FK→CMN_CD(SRS_STTS) | | ✓ | 시리즈 상태 (PROG=진행중 / CMPL=완료) |

> 포스트시즌 라운드별 승리 조건: WC=1전 2선승 / SP=3전 2선승 / PO=5전 3선승 / KS=7전 4선승

---

## PSTSSNT_GAME (포스트시즌 경기)

포스트시즌 각 경기를 GAME 테이블과 연결.

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| SSNT_YR | YEAR | ✓ | ✓ | 시즌 연도 |
| RND_CD | CHAR(2) | ✓ | ✓ | 라운드코드 (WC/SP/PO/KS) |
| GAME_NO | TINYINT | ✓ | ✓ | 시리즈 내 경기번호 (1부터) |
| GAME_ID | BIGINT FK→GAME | | ✓ | 경기ID |

---

## VW_PLR_ABLT (능력치 등급 변환 뷰)

`PLR_ABLT`에 `ABLT_GRADE` 컬럼을 추가하여 조회 편의 제공.

| 컬럼 | 설명 |
|------|------|
| PLR_ID | 선수ID |
| ABLT_CD | 능력치코드 |
| ABLT_NM | 능력치 한글명 (CMN_CD 조인) |
| ABLT_ENG_NM | 능력치 영문명 |
| ABLT_VAL | 능력치 수치 (20~80) |
| ABLT_GRADE | 등급 문자열 |

### 등급 변환 기준

| ABLT_VAL | ABLT_GRADE |
|----------|------------|
| 76~80 | S+ |
| 71~75 | S |
| 66~70 | S- |
| 61~65 | A+ |
| 56~60 | A |
| 51~55 | A- |
| 46~50 | B+ |
| 41~45 | B |
| 36~40 | B- |
| 31~35 | C+ |
| 26~30 | C |
| 23~25 | C- |
| 20~22 | D |

> 같은 기준이 `AbilityGradeConverter.java` 유틸 클래스에도 구현되어 있음

---

## 경기 기록 테이블 구조

```
GAME (경기 기본 정보)
│
├── TM_GAME_REC  ← 팀 경기 기록
│       ↓ 집계
│   TM_MON_REC   (팀 월별)
│   TM_SSNT_REC  (팀 시즌)
│
├── PLR_BATR_GAME_REC  ← source of truth (타자)
│       ↓ 집계
│   PLR_BATR_MON_REC   (타자 월별)
│   PLR_BATR_SSNT_REC  (타자 시즌)
│   PLR_BATR_TM_SSNT_REC (타자 팀별 시즌)
│
└── PLR_PTCH_GAME_REC  ← source of truth (투수)
        ↓ 집계
    PLR_PTCH_MON_REC   (투수 월별)
    PLR_PTCH_SSNT_REC  (투수 시즌)
    PLR_PTCH_TM_SSNT_REC (투수 팀별 시즌)
```

### GAME

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| GAME_ID | BIGINT AUTO_INCREMENT | ✓ | ✓ | 경기ID |
| SSNT_YR | YEAR | | ✓ | 시즌 연도 |
| GAME_DT | DATE | | ✓ | 경기 일자 |
| HOME_TM_ID | BIGINT FK→TM | | ✓ | 홈팀ID |
| AWAY_TM_ID | BIGINT FK→TM | | ✓ | 원정팀ID |
| STDM_ID | BIGINT FK→STDM | | | 경기장ID |
| HOME_SCORE | TINYINT UNSIGNED | | | 홈팀 득점 |
| AWAY_SCORE | TINYINT UNSIGNED | | | 원정팀 득점 |
| GAME_STTS_CD | CHAR(2) | | ✓ | 경기상태코드 (01=예정~06=무효) |
| GAME_TYPE_CD | CHAR(3) FK→CMN_CD(GAME_TYPE) | | ✓ | 경기 종류 (REG=정규/WC/SP/PO/KS) |
| IS_AGGRG_YN | CHAR(1) | | ✓ | 기록 누적 완료 여부 ('Y'=완료/'N'=미완료, 기본값 'N') |
| AGGRG_DT | DATETIME | | | 기록 누적 처리 완료 시각 |

> `IS_AGGRG_YN = 'N'` 인 경기만 누적 대상. 처리 후 'Y'로 변경. 중복 누적 방지 핵심 컬럼.

### TM_GAME_REC (팀 경기 기록)

경기별 팀 단위 집계 기록. 팀 시즌/월간 누적의 원본.

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| GAME_ID | BIGINT FK→GAME | ✓ | ✓ | 경기ID |
| TM_ID | BIGINT FK→TM | ✓ | ✓ | 팀ID |
| RSLT | CHAR(1) | | ✓ | 경기 결과 (W=승 / L=패 / D=무) |
| RS | TINYINT UNSIGNED | | ✓ | 득점 |
| RA | TINYINT UNSIGNED | | ✓ | 실점 |
| H | TINYINT UNSIGNED | | | 안타 |
| DOBL | TINYINT UNSIGNED | | | 2루타 |
| TRPL | TINYINT UNSIGNED | | | 3루타 |
| HR | TINYINT UNSIGNED | | | 홈런 |
| BB | TINYINT UNSIGNED | | | 볼넷 |
| SO | TINYINT UNSIGNED | | | 삼진 |
| SB | TINYINT UNSIGNED | | | 도루 |
| CS | TINYINT UNSIGNED | | | 도루 실패 |
| E | TINYINT UNSIGNED | | | 실책 |
| IP_OUT | TINYINT UNSIGNED | | | 팀 투구 이닝 (아웃카운트) |
| HA | TINYINT UNSIGNED | | | 피안타 |
| HRA | TINYINT UNSIGNED | | | 피홈런 |
| BBA | TINYINT UNSIGNED | | | 허용 볼넷 |
| SOA | TINYINT UNSIGNED | | | 탈삼진 |
| ERA | TINYINT UNSIGNED | | | 자책점 |

### PLR_BATR_GAME_REC (타자 경기 기록)

| 컬럼 | 타입 | PK | 설명 |
|------|------|----|------|
| PLR_ID | BIGINT FK→PLR | ✓ | 선수ID |
| GAME_ID | BIGINT FK→GAME | ✓ | 경기ID |
| TM_ID | BIGINT FK→TM | | 소속팀ID |
| BAT_ORD | TINYINT | | 타순 |
| POSN_CD | CHAR(2) | | 출장 포지션 |
| PA/AB/H/DOBL/TRPL/HR/RBI/R/BB/IBB/SO/SB/CS/HBP/SAC/SF/GIDP | INT | | 타격 기록 (기본값 0) |

### PLR_BATR_MON_REC / PLR_BATR_SSNT_REC / PLR_BATR_TM_SSNT_REC

타자 경기 기록 집계. PK 구성:
- 월: `(PLR_ID, SSNT_YR, MON, TM_ID)`
- 시즌: `(PLR_ID, SSNT_YR)`
- 팀별 시즌: `(PLR_ID, SSNT_YR, TM_ID)`

집계 컬럼: PA/AB/H/DOBL/TRPL/HR/RBI/R/BB/IBB/SO/SB/CS/HBP/SAC/SF/GIDP  
계산지표 (저장 안 함, 조회 시 계산): `BA` (H/AB), `OBP` ((H+BB+HBP)/(AB+BB+HBP+SF)), `SLG` (총루타/AB), `OPS` (OBP+SLG)

### PLR_PTCH_GAME_REC (투수 경기 기록)

| 컬럼 | 타입 | PK | 설명 |
|------|------|----|------|
| PLR_ID | BIGINT FK→PLR | ✓ | 선수ID |
| GAME_ID | BIGINT FK→GAME | ✓ | 경기ID |
| TM_ID | BIGINT FK→TM | | 소속팀ID |
| PTCH_ROLE_CD | CHAR(2) | | 투수 역할 (10=SP/11=RP/12=CP) |
| IP_OUT | INT | | 투구이닝 (아웃카운트, 3=1이닝) |
| BF/H/DOBL/TRPL/HR/R/ER/BB/IBB/SO/HBP/W/L/SV/HLD/BSV/CG/SHO | INT | | 투수 기록 (기본값 0) |
| PITCHES/STRIKES | INT | | 투구수/스트라이크 |

> BSV=블론세이브, CG=완투, SHO=완봉

### PLR_PTCH_MON_REC / PLR_PTCH_SSNT_REC / PLR_PTCH_TM_SSNT_REC

투수 경기 기록 집계. PK 구성:
- 월: `(PLR_ID, SSNT_YR, MON, TM_ID)`
- 시즌: `(PLR_ID, SSNT_YR)`
- 팀별 시즌: `(PLR_ID, SSNT_YR, TM_ID)`

집계 컬럼: BF/H/DOBL/TRPL/HR/R/ER/BB/IBB/SO/HBP/W/L/SV/HLD/BSV/CG/SHO + PITCHES  
계산지표 (저장 안 함, 조회 시 계산): `ERA` (ER×27/IP_OUT), `WHIP` ((BB+H)×3/IP_OUT), `K/9` (SO×27/IP_OUT), `BB/9` (BB×27/IP_OUT)

---

---

## STND (팀 순위)

드래프트 순서 산정 및 포스트시즌 진출 기준으로 사용.

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| TM_ID | BIGINT FK→TM | ✓ | ✓ | 팀ID |
| SSNT_YR | YEAR | ✓ | ✓ | 시즌 연도 |
| W | SMALLINT | | ✓ | 승 |
| L | SMALLINT | | ✓ | 패 |
| T | SMALLINT | | ✓ | 무 |
| PCT | DECIMAL(5,4) | | | 승률 = W / (W+L) |
| GB | DECIMAL(4,1) | | | 게임차 (1위와의 차이) |
| STND_RNK | TINYINT | | | 최종 순위 |

---

## DRFT (드래프트 이벤트 마스터)

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| DRFT_ID | BIGINT AUTO_INCREMENT | ✓ | ✓ | 드래프트ID |
| SSNT_YR | YEAR | | ✓ | 시즌 연도 (입단 후 속할 시즌) |
| DRFT_DT | DATE | | ✓ | 드래프트 날짜 |
| DRFT_STTS_CD | VARCHAR(11) FK→CMN_CD(DRFT_STTS) | | ✓ | 드래프트 상태코드 |
| RND_CNT | TINYINT | | ✓ | 라운드 수 (기본 11) |
| MAX_PICK_CNT | SMALLINT | | ✓ | 최대 지명 수 (기본 110) |
| USER_TM_ID | BIGINT FK→TM | | ✓ | 유저 팀ID |

### DRFT_STTS — 드래프트 상태코드

| CD_VAL | CD_NM | 설명 |
|--------|-------|------|
| CREATED | 생성됨 | 드래프트 이벤트만 생성된 상태 |
| SCOUTING | 스카우팅 | 스카우팅 가능 기간 |
| READY | 준비완료 | 지명 순서와 대상자 확정 상태 |
| IN_PROGRESS | 진행중 | 실제 지명 진행 중 |
| COMPLETED | 완료 | 모든 라운드 종료 |
| CANCELLED | 취소 | 드래프트 취소 |

---

## DRFT_PLR (드래프트 선수풀)

드래프트 대상 유망주. 지명·입단 전까지 PLR 테이블과 분리.

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| DRFT_PLR_ID | BIGINT AUTO_INCREMENT | ✓ | ✓ | 드래프트선수ID |
| DRFT_ID | BIGINT FK→DRFT | | ✓ | 드래프트ID |
| PLR_NM | VARCHAR(50) | | ✓ | 선수명 (한글) |
| PLR_ENG_NM | VARCHAR(100) | | | 선수 영문명 |
| PLR_AGE | TINYINT | | | 나이 |
| PLR_ORGN_CD | VARCHAR(5) FK→CMN_CD(PLR_ORGN) | | | 출신코드 |
| HS_NM | VARCHAR(100) | | | 출신 고등학교 |
| UNIV_NM | VARCHAR(100) | | | 출신 대학교 |
| POSN_CD | CHAR(2) FK→CMN_CD(POSN) | | ✓ | 주 포지션코드 |
| REPR_POSN_CD | CHAR(2) FK→CMN_CD(REPR_POSN) | | ✓ | 대표 포지션코드 |
| PLR_BAT_PTCH_HAND_CD | CHAR(2) FK→CMN_CD(BAT_PTCH_HAND) | | | 투타코드 |
| ACT_OVRL_ABLT | TINYINT | | ✓ | 실제 현재 능력치 (20~80, 내부 전용) |
| ACT_POT_ABLT | TINYINT | | ✓ | 실제 잠재 능력치 (20~80, 내부 전용) |
| GRWTH_TEND | VARCHAR(4) | | ✓ | 성장 성향 (ERLY/LATB/NRML) |
| INJ_RSK | TINYINT | | ✓ | 부상 위험도 (1~20) |
| IS_PICK_YN | CHAR(1) | | ✓ | 지명 여부 (Y/N) |
| IS_EXCL_YN | CHAR(1) | | ✓ | 지명 제외 여부 (Y/N) |
| PLR_ID | BIGINT FK→PLR | | | 입단 후 생성된 선수ID |

### PLR_ORGN — 선수 출신코드

| CD_VAL | CD_NM | 설명 |
|--------|-------|------|
| HS | 고졸 | 고등학교 졸업 |
| COL | 대졸 | 대학교 졸업 |
| ERLY | 얼리 | 대학 재학 중 드래프트 신청 |
| OVRSS | 해외출신 | 해외 아마추어/프로 출신 |
| IND | 독립리그 | 독립리그 출신 |

---

## DRFT_SCUT_RPT (드래프트 스카우팅 리포트)

팀별 스카우팅 추정치. 실제 능력치(ACT_OVRL_ABLT, ACT_POT_ABLT)에 노이즈를 적용한 값.  
정확도(ACCRCY)는 팀의 스카우팅 시설·스태프 수준에 따라 결정.

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| DRFT_PLR_ID | BIGINT FK→DRFT_PLR | ✓ | ✓ | 드래프트선수ID |
| TM_ID | BIGINT FK→TM | ✓ | ✓ | 팀ID |
| EST_OVRL_ABLT | TINYINT | | ✓ | 추정 현재 능력치 (팀별 관측치) |
| EST_POT_ABLT | TINYINT | | ✓ | 추정 잠재 능력치 (팀별 관측치) |
| EST_RND | TINYINT | | | 예상 지명 라운드 (1~11) |
| ACCRCY | TINYINT | | ✓ | 스카우팅 정확도 (1~10) |
| GRADE | VARCHAR(2) | | | 평가 등급 (S+/S/S-/A+/A/A-/B+/B/B-/C+/C/C-/D) |
| CMNT | VARCHAR(500) | | | 스카우트 코멘트 |

---

## DRFT_ORD (드래프트 지명 순서)

라운드별 픽 순서와 지명 결과를 저장. 지명 방식: 전년도 최종 순위 역순(비뱀파이어).

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| DRFT_ID | BIGINT FK→DRFT | ✓ | ✓ | 드래프트ID |
| PICK_NO | SMALLINT | ✓ | ✓ | 전체 픽 번호 (1~110) |
| RND | TINYINT | | ✓ | 라운드 번호 (1~11) |
| RND_PICK_NO | TINYINT | | ✓ | 라운드 내 픽 순서 (1~10) |
| TM_ID | BIGINT FK→TM | | ✓ | 지명 팀ID |
| PICK_STTS_CD | VARCHAR(7) FK→CMN_CD(PICK_STTS) | | ✓ | 픽 상태코드 |
| DRFT_PLR_ID | BIGINT FK→DRFT_PLR | | | 지명된 선수ID (NULL=미지명) |
| PLR_ID | BIGINT FK→PLR | | | 입단 후 선수ID (NULL=미서명) |

### PICK_STTS — 픽 상태코드

| CD_VAL | CD_NM | 설명 |
|--------|-------|------|
| PENDING | 대기중 | 지명 대기 중 |
| PICKED | 지명됨 | 선수 지명 완료 |
| SKIPPED | 패스 | 픽 건너뜀 |

---

## DRFT_BOARD (드래프트 보드)

유저가 선수별로 우선순위·메모·지명 제외 여부를 관리하는 개인 보드.

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| DRFT_ID | BIGINT FK→DRFT | ✓ | ✓ | 드래프트ID |
| DRFT_PLR_ID | BIGINT FK→DRFT_PLR | ✓ | ✓ | 드래프트선수ID |
| TM_ID | BIGINT FK→TM | ✓ | ✓ | 팀ID (보드 소유 팀) |
| PRIO_ORD | SMALLINT | | | 우선순위 (낮을수록 우선, NULL=미분류) |
| DO_NOT_PICK | CHAR(1) | | ✓ | 지명 제외 여부 (Y/N) |
| MEMO | VARCHAR(500) | | | 메모 |

---

## PLR_ENTY (선수 엔트리 현황)

선수의 시즌별 1군/2군 엔트리 상태. 드래프트 입단 시 자동으로 2군 등록.

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| PLR_ID | BIGINT FK→PLR | ✓ | ✓ | 선수ID |
| SSNT_YR | YEAR | ✓ | ✓ | 시즌 연도 |
| TM_ID | BIGINT FK→TM | | ✓ | 팀ID |
| ENTY_LVL_CD | CHAR(1) | | ✓ | 엔트리 레벨 ('1'=1군, '2'=2군) |
| ENTY_DT | DATE | | ✓ | 마지막 변경일 |

---

## PLR_ENTY_HIST (선수 엔트리 변경 이력)

콜업·말소·부상 말소 이력 추적.

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| ENTY_HIST_ID | BIGINT AUTO_INCREMENT | ✓ | ✓ | 이력ID |
| PLR_ID | BIGINT FK→PLR | | ✓ | 선수ID |
| TM_ID | BIGINT FK→TM | | ✓ | 팀ID |
| SSNT_YR | YEAR | | ✓ | 시즌 연도 |
| FROM_ENTY_LVL | CHAR(1) | | | 변경 전 레벨 (NULL=최초 등록) |
| TO_ENTY_LVL | CHAR(1) | | ✓ | 변경 후 레벨 |
| CHNG_DT | DATE | | ✓ | 변경일 |
| CHNG_RSN_CD | VARCHAR(10) | | | 변경 사유코드 (CALLUP/OPTION/INJ/INIT) |

---

## GAME_CFG (게임 전역 설정)

단일 행 키-값 저장소. 유저 팀, 현재 게임 날짜 등 전역 상태를 관리한다.

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| CFG_KEY | VARCHAR(50) | ✓ | ✓ | 설정 키 (USER_TM_ID, CUR_DT 등) |
| CFG_VAL | VARCHAR(500) | | | 설정 값 |
| UPD_DT | DATETIME | | ✓ | 마지막 갱신 일시 |

### 주요 CFG_KEY 값

| CFG_KEY | 설명 | 예시 |
|---------|------|------|
| USER_TM_ID | 유저가 선택한 팀 ID | 1 |
| BRDCST_SPNSR | 선택된 방송국 스폰서 코드 | SBS |

---

## BRDCST_SPNSR (방송국 스폰서)

시즌 시작 시 유저가 선택하는 방송국 스폰서 마스터 테이블. 유저의 선택 정보는 `GAME_CFG(CFG_KEY='BRDCST_SPNSR')`에 별도 저장되며, 전 구단의 계약 이력은 `TM_BRDCST`에 관리된다.
금액 단위: 만원 (700000 = 70억).

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| BRDCST_CD | CHAR(3) | ✓ | ✓ | 방송국 코드 (SBS/KBS/MBC) |
| BRDCST_NM | VARCHAR(20) | | ✓ | 방송국명 |
| CNTRCT_FEE | BIGINT | | ✓ | 계약금 (만원) |
| WIN_BONUS | INT | | ✓ | 경기 승리 수당 (만원/승) |
| POST_BONUS | BIGINT | | ✓ | 포스트시즌 진출 수당 (만원) |
| KS_BONUS | BIGINT | | ✓ | 한국시리즈 우승 수당 (만원) |

### 기초 데이터

| BRDCST_CD | BRDCST_NM | CNTRCT_FEE | WIN_BONUS | POST_BONUS | KS_BONUS |
|-----------|-----------|------------|-----------|------------|----------|
| SBS | SBS | 700000 (70억) | 500만/승 | 2억 | 8억 |
| KBS | KBS | 600000 (60억) | 1500만/승 | 5억 | 15억 |
| MBC | MBC | 500000 (50억) | 3000만/승 | 10억 | 25억 |

---

## TM_BRDCST (팀-시즌별 방송국 계약)

유저 팀과 AI 팀 모두의 방송국 계약 이력을 시즌별로 관리.
방송국 선택 시 `GAME_CFG(BRDCST_SPNSR)`와 이 테이블 양쪽에 동시 저장된다.

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| TM_ID | BIGINT FK→TM | ✓ | ✓ | 팀 ID |
| SSNT_YR | INT | ✓ | ✓ | 시즌 연도 |
| BRDCST_CD | VARCHAR(10) FK→BRDCST_SPNSR | | ✓ | 선택된 방송국 코드 |
| REG_DT | DATETIME | | | 계약 등록 일시 (DEFAULT NOW()) |

> AI 팀 배정: 유저가 방송국을 최초 선택하는 시점에 모든 AI 팀에 랜덤 배정.
> ON DUPLICATE KEY UPDATE 방식으로 재선택 가능.

---

## FRGN_PLR_CAND (외국인 선수 후보)

매 시즌 PRE 기간에 생성되는 외국인 선수 영입 후보 목록.
DB에 영구 저장되며, 계약된 선수는 PLR 테이블에 INSERT 후 PLR_ENTY에 등록된다.

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| CAND_ID | BIGINT AUTO_INCREMENT | ✓ | ✓ | 후보 ID |
| SSNT_YR | INT | | ✓ | 생성 시즌 연도 |
| PLR_NM | VARCHAR(50) | | ✓ | 선수명 |
| NATL_CD | VARCHAR(10) | | ✓ | 국적 코드 (USA·DOM·VEN·JPN·AUS 등) |
| PLR_TYPE_CD | VARCHAR(10) | | ✓ | 포지션 구분 (P=투수, H=타자) |
| AGE | INT | | ✓ | 나이 |
| OVRL | INT | | ✓ | 종합 능력치 (1~20) |
| POT_ABLT | INT | | ✓ | 잠재 능력치 |
| SALARY_REQ | BIGINT | | ✓ | 희망 연봉 (만원) |
| STATUS_CD | VARCHAR(10) | | ✓ | 상태 (AVAILABLE/SIGNED/AI_SIGNED/REJECTED) |
| SIGN_TM_ID | BIGINT FK→TM | | | 계약 체결 팀 ID (NULL=미계약) |
| REG_DT | DATETIME | | | 생성 일시 (DEFAULT NOW()) |

> **계약 흐름**: 오퍼 제출 → 다음 날 결과 처리 → 승낙 시 STATUS_CD='SIGNED', PLR 테이블 INSERT, PLR_ENTY 2군 등록.
> 최대 계약 수: `MAX_FRGN_PLR = 3` (서비스 상수로 관리).

---

## TM_LINEUP (팀 타순·수비 배치)

시즌별 각 팀의 기본 타순(1~9번)과 수비 포지션.

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| TM_ID | BIGINT FK→TM | ✓ | ✓ | 팀 ID |
| SSNT_YR | YEAR | ✓ | ✓ | 시즌 연도 |
| LINEUP_NO | TINYINT | ✓ | ✓ | 타순 번호 (1~9) |
| PLR_ID | BIGINT FK→PLR | | ✓ | 해당 타순의 선수 ID |
| POSN_CD | CHAR(2) FK→CMN_CD(POSN) | | ✓ | 수비 포지션 코드 |

---

## TM_ROTATION (팀 선발 로테이션)

시즌별 각 팀의 선발 투수 로테이션 순서.

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| TM_ID | BIGINT FK→TM | ✓ | ✓ | 팀 ID |
| SSNT_YR | YEAR | ✓ | ✓ | 시즌 연도 |
| ROT_ORD | TINYINT | ✓ | ✓ | 로테이션 순서 (1번 선발~5번 선발) |
| PLR_ID | BIGINT FK→PLR | | ✓ | 해당 순서의 선발 투수 선수 ID |

---

## TM_BULLPEN (팀 불펜 역할)

시즌별 각 팀의 불펜 투수 역할 배정.

| 컬럼 | 타입 | PK | NOT NULL | 설명 |
|------|------|----|----------|------|
| TM_ID | BIGINT FK→TM | ✓ | ✓ | 팀 ID |
| SSNT_YR | YEAR | ✓ | ✓ | 시즌 연도 |
| PLR_ID | BIGINT FK→PLR | ✓ | ✓ | 투수 선수 ID |
| ROLE_CD | CHAR(2) | | ✓ | 불펜 역할 코드 (CL: 마무리, SU: 셋업맨, MR: 중간계투) |

---

## Flyway 마이그레이션 순서

| 파일 | 내용 |
|------|------|
| V1__create_cmn_cd.sql | CMN_CD 테이블 DDL |
| V2__create_tm_plr.sql | TM, PLR 테이블 DDL |
| V3__create_plr_relations.sql | PLR_POSN, PLR_ABLT 테이블 DDL |
| V4__create_view.sql | VW_PLR_ABLT 뷰 DDL |
| V5__insert_cmn_cd.sql | 공통코드 초기 데이터 (POSN/REPR_POSN/ABLT/CITY/GAME_STTS) |
| V6__insert_tm.sql | KBO 10개 구단 데이터 |
| V7__insert_plr.sql | 선수 100명 기본 데이터 |
| V8__insert_plr_tm_posn.sql | 선수-포지션 데이터 |
| V9__insert_plr_ablt.sql | 선수 능력치 데이터 |
| V10__create_stdm_alter_tm.sql | STDM·STDM_HIST 생성 + TM ALTER + TM_HIST·TM_STDM 생성 |
| V11__create_plr_tm.sql | PLR_TM, PLR_TM_CNTRCT, PLR_TM_CNTRCT_HIST 테이블 DDL |
| V12__create_game_rec.sql | GAME, 타자/투수 경기·집계 기록 테이블 DDL |
| V13__insert_stdm_update_tm.sql | 경기장 데이터 + TM 연고도시·경기장 설정 + TM_STDM·TM_HIST 데이터 |
| V14__insert_plr_tm.sql | 선수-팀 소속·계약 데이터 |
| V15__alter_plr_stdm.sql | CMN_CD 신규코드(투타/잔디) + PLR·STDM·STDM_HIST 컬럼 추가 |
| V16__create_draft.sql | STND, DRFT, DRFT_PLR, DRFT_SCUT_RPT, DRFT_ORD, DRFT_BOARD DDL + CMN_CD 추가 |
| V17__create_roster.sql | PLR_ENTY, PLR_ENTY_HIST DDL |
| V18__insert_plr_2025.sql | 2025 KBO 시즌 기준 선수 319명 INSERT (PLR, PLR_TM, PLR_TM_CNTRCT, PLR_POSN, PLR_ABLT) |
| V19__create_missing_tables.sql | TM_FNC_SSNT, TM_FCLTY, TM_MKT_SSNT, PLR_ABLT_SSNT, PLR_TRT, PLR_POSN_SSNT, PLR_ANSL_SAL_HIST, STFF 관련, SSNT, SSNT_EVNT, PSTSSNT_SRS/GAME DDL |
| V20__create_game_cfg_lineup.sql | GAME_CFG, TM_LINEUP, TM_ROTATION, TM_BULLPEN DDL + GAME 테이블 GAME_TYPE_CD 컬럼 추가 |
| V23__create_brdcst_spnsr.sql | BRDCST_SPNSR DDL + SBS/KBS/MBC 기초 데이터 INSERT |
| V24__fatg_cond_hide_ablt.sql | PLR_FATG_COND DDL + SSNT_EVNT RD_YN 컬럼 추가 + STM 공통 능력치 INSERT |

> INSERT 문 상세는 `DATA.md` 참조
