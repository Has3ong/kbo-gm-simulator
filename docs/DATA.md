# KBO 단장 시뮬레이터 — 초기 데이터

> 실제 INSERT 실행은 Flyway 마이그레이션 파일(V5~V9)에서 처리.  
> 이 파일은 데이터 전체를 한 눈에 파악하기 위한 문서.

---

## CMN_CD — 공통코드 (V5)

### POSN — 포지션코드

| CD_VAL | CD_NM | CD_ENG_NM | CD_DESC |
|--------|-------|-----------|---------|
| 10 | 선발투수 | Starting Pitcher | 경기 시작부터 선발 등판하여 다수 이닝을 소화하는 투수 |
| 11 | 중간계투 | Relief Pitcher | 선발투수 이후 등판하는 불펜 투수 |
| 12 | 마무리 | Closer | 경기 마지막 이닝(주로 9회)을 담당하는 마무리 투수 |
| 20 | 포수 | Catcher | 홈플레이트 뒤에서 투수 배터리를 이루는 포지션 |
| 21 | 1루수 | First Baseman | 1루 베이스를 담당하는 내야수 |
| 22 | 2루수 | Second Baseman | 2루 베이스를 담당하는 내야수 |
| 23 | 3루수 | Third Baseman | 3루 베이스를 담당하는 내야수 |
| 24 | 유격수 | Shortstop | 2루와 3루 사이를 수비하는 내야수 |
| 25 | 좌익수 | Left Fielder | 좌측 외야를 담당하는 외야수 |
| 26 | 중견수 | Center Fielder | 중앙 외야를 담당하는 외야수, 외야 리더 |
| 27 | 우익수 | Right Fielder | 우측 외야를 담당하는 외야수 |
| 28 | 지명타자 | Designated Hitter | 수비 없이 타격만 전담하는 포지션 |

### REPR_POSN — 대표 포지션코드

| CD_VAL | CD_NM | CD_ENG_NM | CD_DESC |
|--------|-------|-----------|---------|
| 10 | 투수 | Pitcher | 선발·중간계투·마무리를 포함하는 투수 그룹 |
| 20 | 포수 | Catcher | 포수 포지션 |
| 21 | 내야수 | Infielder | 1루수·2루수·3루수·유격수를 포함하는 내야수 그룹 |
| 22 | 외야수 | Outfielder | 좌익수·중견수·우익수·지명타자를 포함하는 외야/타격 그룹 |

### ABLT — 능력치코드

| CD_VAL | CD_NM | CD_ENG_NM | 구분 | CD_DESC |
|--------|-------|-----------|------|---------|
| CNT | 컨택 | Contact | 타자 | 공을 정확하게 맞추는 능력. 타율과 직결 |
| PWR | 파워 | Power | 타자 | 타구에 힘을 실어 장타를 만드는 능력. 홈런·장타율과 직결 |
| RUN | 주루 | Base Running | 타자 | 베이스 주루 속도 및 상황 판단 능력 |
| THR | 송구 | Throwing | 타자 | 정확하고 강하게 공을 송구하는 수비 능력 |
| STL | 도루 | Stealing | 타자 | 도루 성공 능력 (출발 타이밍 + 스피드) |
| VEL | 구속 | Velocity | 투수 | 투구 볼의 최고 속도 능력 |
| CTL | 제구 | Control | 투수 | 원하는 코스에 정확히 던지는 능력. 볼넷 방지와 직결 |
| BRK | 변화구 | Breaking Ball | 투수 | 보유 변화구의 전반적인 날카로움과 완성도 |
| STM | 체력 | Stamina | 투수 | 투구 내구성 및 피로 회복력. 선발투수의 이닝 소화 능력과 불펜 연투 능력에 직결 |
| P4S | 포심 | 4-Seam Fastball | 투수 | 회전수가 높고 직선적인 기본 패스트볼 |
| P2S | 투심 | 2-Seam Fastball | 투수 | 좌우 무브먼트가 있는 패스트볼 |
| PCT | 커터 | Cutter | 투수 | 타자 손잡이 방향으로 날카롭게 꺾이는 패스트볼계열 |
| PSN | 싱커 | Sinker | 투수 | 아래 방향으로 가라앉는 그라운드볼 유도 구종 |
| PSL | 슬라이더 | Slider | 투수 | 가로 방향으로 꺾이는 대표적인 변화구 |
| PCB | 커브 | Curveball | 투수 | 큰 궤도로 아래로 휘는 변화구 |
| PCH | 체인지업 | Changeup | 투수 | 패스트볼과 유사한 폼이나 느린 속도로 타자를 교란 |
| PFK | 포크 | Forkball | 투수 | 낙차가 큰 낙구계열 변화구 (스플리터 포함) |

### CITY — 연고도시코드

| CD_VAL | CD_NM | CD_ENG_NM | CD_DESC |
|--------|-------|-----------|---------|
| GJU | 광주 | Gwangju | 광역시. 연고 구단: KIA 타이거즈 |
| DGU | 대구 | Daegu | 광역시. 연고 구단: 삼성 라이온즈 |
| SEL | 서울 | Seoul | 특별시. 연고 구단: LG 트윈스·두산 베어스·키움 히어로즈 |
| SWN | 수원 | Suwon | 경기도. 연고 구단: KT 위즈 |
| ICN | 인천 | Incheon | 광역시. 연고 구단: SSG 랜더스 |
| BSN | 부산 | Busan | 광역시. 연고 구단: 롯데 자이언츠 |
| DJN | 대전 | Daejeon | 광역시. 연고 구단: 한화 이글스 |
| CWN | 창원 | Changwon | 경남. 연고 구단: NC 다이노스 |

### GAME_STTS — 경기상태코드

| CD_VAL | CD_NM | CD_ENG_NM |
|--------|-------|-----------|
| 01 | 예정 | Scheduled |
| 02 | 진행중 | In Progress |
| 03 | 완료 | Completed |
| 04 | 우천중단 | Rain Delay |
| 05 | 취소 | Cancelled |
| 06 | 무효 | No Game |

### BAT_PTCH_HAND — 투타코드

| CD_VAL | CD_NM | CD_ENG_NM |
|--------|-------|-----------|
| RR | 우투우타 | Right/Right |
| RL | 우투좌타 | Right/Left |
| RS | 우투양타 | Right/Switch |
| LL | 좌투좌타 | Left/Left |
| LR | 좌투우타 | Left/Right |
| LS | 좌투양타 | Left/Switch |

### TURF_TYPE — 잔디종류코드

| CD_VAL | CD_NM | CD_ENG_NM |
|--------|-------|-----------|
| NT | 천연잔디 | Natural Turf |
| AT | 인조잔디 | Artificial Turf |
| HB | 하이브리드 | Hybrid Turf |

### CNTRCT_TYPE — 계약 종류코드

| CD_VAL | CD_NM | CD_ENG_NM | CD_DESC |
|--------|-------|-----------|---------|
| FA | FA 계약 | FA Contract | 자유계약선수 계약 |
| RC | 재계약 | Re-Contract | 기존 팀과 연장·재계약 |
| NK | 신인 계약 | Rookie Contract | 드래프트 신인 계약 |
| FR | 외국인 계약 | Foreign Contract | 외국인 선수 계약 |

### PLR_ORGN — 선수 출신코드 (드래프트 풀 생성 기준)

> 2025 KBO 실제 비율 기준: 고졸 1000명 / 대졸 250명 / 얼리 51명 / 트라이아웃 20명

| CD_VAL | CD_NM | CD_ENG_NM | CD_DESC | 드래프트 풀 비율 | 나이 범위 | 현재 능력치 계수 |
|--------|-------|-----------|---------|-----------------|----------|-----------------|
| HS | 고졸 | High School | 고등학교 졸업 | **75.7%** | 18~19세 | 0.45~0.60 |
| COL | 대졸 | College | 대학교 졸업 | **18.9%** | 22~23세 | 0.55~0.75 |
| ERLY | 얼리 | Early Draft | 대학 재학 중 드래프트 신청 | **3.9%** | 20~21세 | 0.50~0.65 |
| TRYO | 트라이아웃 | Tryout | 트라이아웃 참가자 (낙마 후 재도전) | **1.5%** | 22~26세 | 0.55~0.75 |
| OVRSS | 해외출신 | Overseas | 해외 아마추어/프로 출신 | — (드래프트 풀 미사용) | — | — |
| IND | 독립리그 | Independent | 독립리그 출신 | — (드래프트 풀 미사용) | — | — |

**참고**: `OVRSS`, `IND`는 DB 코드로 존재하지만 현재 드래프트 풀 생성(`DrftService.generatePool`)에서는 사용하지 않음.

### PLR_STTS — 선수 상태코드

| CD_VAL | CD_NM | CD_ENG_NM | CD_DESC |
|--------|-------|-----------|---------|
| AT | 활동 | Active | 정상 활동 중. 경기 출전 가능 |
| INJ | 부상 | Injured | 부상으로 이탈. 경기 출전 불가 |
| RET | 은퇴 | Retired | 은퇴. 경기 출전 불가 |
| FA | FA | Free Agent | 자유계약 상태. 소속팀 없음 |

### HIDE_ABLT — 히든 능력치코드

스케일 1~20. GM·선수 모두에게 비공개.

| CD_VAL | CD_NM | CD_ENG_NM | CD_DESC |
|--------|-------|-----------|---------|
| FCN | 집중력 | Focus | 한 경기 내에서의 일관성. 높을수록 경기 중 집중력이 지속됨 |
| DRV | 승부욕 | Drive | 승리에 대한 헌신도 및 경기 중 판단 실행 결단력 |
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

| CD_VAL | CD_NM | CD_ENG_NM | CD_DESC |
|--------|-------|-----------|---------|
| TRNG | 훈련시설 | Training Facility | 1군 선수들의 능력치 상승 보정 폭 증가 |
| YUTH | 유소년훈련시설 | Youth Training Facility | 2군 선수 및 22세 이하 선수의 능력치 상승 보정 폭 증가 |
| ANLY | 데이터분석시설 | Data Analytics Facility | 스카우팅 정보의 정확도 보정 |
| SCTG | 스카우터시설 | Scouting Facility | 스카우팅 범위 및 능력 보정 |
| CAFE | 사내식당시설 | Team Cafeteria | 선수들의 컨디션 상승 보정 폭 증가 |

> 확장 원칙: 새 시설 종류 추가 시 CMN_CD에 코드 INSERT + FCLTY_UPGR_COST_CFG에 비용 데이터 INSERT + TM_FCLTY 초기화만으로 즉시 반영

### FCLTY_UPGR_COST_CFG — 시설 업그레이드 비용 설정

| FROM_LVL | TO_LVL | UPGR_COST (만원) | UPGR_DAYS |
|----------|--------|-----------------|-----------|
| 1 | 2 | 5,000 | 30 |
| 2 | 3 | 15,000 | 60 |
| 3 | 4 | 30,000 | 90 |
| 4 | 5 | 60,000 | 180 |

> 모든 시설 동일 비용 기준. FCLTY_UPGR_COST_CFG 테이블에서 시설 유형별·레벨별로 개별 설정 가능.

### STDM_EXPN_COST_CFG — 경기장 증축 비용 설정

| EXPN_STEP | ADD_SEAT_CNT | EXPN_COST (만원) | EXPN_DAYS | 설명 |
|-----------|-------------|-----------------|-----------|------|
| 1 | 3,000석 | 30,000 | 180 | 소규모 증축. 외야 좌석 추가 |
| 2 | 5,000석 | 50,000 | 270 | 중규모 증축. 내야 2층 확장 |
| 3 | 10,000석 | 100,000 | 365 | 대규모 증축. 전면 리모델링 |

### FCLTY_STTS — 시설 업그레이드 상태코드

| CD_VAL | CD_NM | CD_ENG_NM | CD_DESC |
|--------|-------|-----------|---------|
| PLAN | 계획중 | Planned | 업그레이드 계획 수립. 아직 공사 시작 전 |
| PROG | 진행중 | In Progress | 공사 진행 중. 완료 전까지 해당 시설 효과 미적용 |
| CMPL | 완료 | Completed | 업그레이드 완료. 새 레벨 효과 적용 |
| CNCL | 취소 | Cancelled | 업그레이드 취소. 비용 일부 환불 처리 |

### STFF_TYPE — 스태프 직종코드

| CD_VAL | CD_NM | CD_ENG_NM | CD_DESC |
|--------|-------|-----------|---------|
| MGR | 감독 | Manager | 팀 전체 전략·라인업·불펜 운영을 총괄 |
| COACH | 코치 | Coach | 타격·투수·수비 등 세부 역할 담당 |
| SCUT | 스카우터 | Scout | 국내외 선수 발굴·평가 담당 |
| MED | 의무·트레이너 | Medical / Trainer | 부상 예방·재활·컨디션 관리 담당 |
| ANLY | 분석가 | Analyst | 데이터 기반 선수·상대팀 분석 담당 |

### STFF_ABLT — 스태프 능력치코드

스케일 1~20.

| CD_VAL | CD_NM | CD_ENG_NM | CD_DESC |
|--------|-------|-----------|---------|
| TCNT | 컨택 훈련 | Coaching Contact | 타자의 컨택 능력을 향상시키는 훈련 능력 |
| TTCH | 기술 훈련 | Coaching Technical | 수비·기술 전반 향상을 위한 훈련 능력 |
| TPWR | 파워 훈련 | Coaching Power | 타자의 파워 능력을 향상시키는 훈련 능력 |
| TCTL | 제구 훈련 | Coaching Control | 투수의 제구 능력을 향상시키는 훈련 능력 |
| TSTM | 체력 훈련 | Coaching Stamina | 선수 체력·내구성 향상을 위한 훈련 능력 |
| TVEL | 구속 훈련 | Coaching Velocity | 투수의 구속 향상을 위한 훈련 능력 |
| TBRK | 변화구 훈련 | Coaching Breaking Ball | 투수의 변화구 완성도 향상 훈련 능력 |
| TRUN | 주루 훈련 | Coaching Base Running | 주루 판단력·속도 향상 훈련 능력 |
| TSTL | 도루 훈련 | Coaching Stealing | 도루 성공률 향상을 위한 훈련 능력 |
| DISC | 기강 유지 | Discipline | 스태프가 규율·원칙을 얼마나 중시하는가. 높으면 선수의 불만·불규칙 행동 억제 |
| DET | 승부욕 | Determination | 일을 잘해내려는 내적 동기. 스태프 본인의 직무 완성도에 영향 |
| MOT | 의욕 부여 | Motivating | 선수에게 동기를 부여하는 능력. 팀 미팅·개인 대화·훈련 효과에 영향 |
| MAN | 인력 관리 | Man Management | 아랫사람을 효과적으로 다루는 능력. 사기 유지·갈등 관리에 영향 |
| ADP | 적응력 | Adaptability | 새 환경(구단·나라)에 빠르게 적응하는 능력 |
| SPS | 스포츠 과학 | Sports Science | 선수 체력·부상 위험을 세심하게 모니터링하는 능력 |
| PHY | 치료 능력 | Physiotherapy | 부상 방지·재활의 질. 높을수록 회복 기간 단축 |
| JPP | 성장 가능성 판단 | Judging Player Potential | 선수의 미래 성장 가능성을 정확히 평가하는 능력 |
| JPA | 현재 능력 판단 | Judging Player Ability | 선수의 현재 수준을 정확히 평가하는 능력 |
| JSA | 스태프 능력 판단 | Judging Staff Ability | 스태프 능력 수준을 평가하는 능력 |
| TAC | 전술 이해도 | Tactical Knowledge | 전술·게임 상황 이해도. 상대 분석·훈련 계획에 영향 |
| NEG | 협상 능력 | Negotiating | 이적·계약 협상을 유리하게 이끄는 능력 |
| DAT | 데이터 분석 | Analysing Data | 선수·팀 데이터를 이해하고 유용한 인사이트로 변환하는 능력 |

### GAME_TYPE — 경기 종류코드

| CD_VAL | CD_NM | CD_ENG_NM | CD_DESC |
|--------|-------|-----------|---------|
| REG | 정규시즌 | Regular Season | KBO 정규시즌 경기 |
| WC | 와일드카드 | Wild Card | 포스트시즌 와일드카드 결정전 |
| SP | 준플레이오프 | Semi-Playoff | 포스트시즌 준플레이오프 |
| PO | 플레이오프 | Playoff | 포스트시즌 플레이오프 |
| KS | 한국시리즈 | Korean Series | 한국시리즈 최종 결승 |

### PLR_TRT_TYPE — 선수 특성코드

**신체·부상 관련**

| CD_VAL | CD_NM | CD_ENG_NM | CD_DESC |
|--------|-------|-----------|---------|
| IRON | 금강불괴 | Iron Body | 부상 확률 크게 감소. IRK 히든 능력치 효과 무시. 강철 같은 신체 |
| GLAS | 유리몸 | Glass Body | 부상 확률 크게 증가. 경미한 충돌에도 부상 가능. 허약한 신체 |
| RCVR | 빠른 회복 | Quick Recovery | 부상 회복 기간이 평균 대비 크게 단축됨 |
| LONG | 장수 | Longevity | 노화로 인한 능력치 하락 속도 둔화. 커리어 후반까지 활약 가능 |
| AGED | 노쇠화 | Rapid Aging | 능력치 하락 속도 빠름. 피크 이후 급격한 쇠퇴 |

**성장 관련**

| CD_VAL | CD_NM | CD_ENG_NM | CD_DESC |
|--------|-------|-----------|---------|
| ERLB | 조숙 | Early Bloomer | 어린 나이에 빠르게 성장. 피크 도달 시기가 평균보다 빠름 |
| LATB | 만숙 | Late Bloomer | 늦게 성장하지만 커리어 후반까지 성장 가능. 은퇴 시기 늦음 |

**투구 관련 (투수 전용)**

| CD_VAL | CD_NM | CD_ENG_NM | CD_DESC |
|--------|-------|-----------|---------|
| ACEM | 에이스 기질 | Ace Mentality | 포스트시즌·라이벌전 등 중요 경기에서 투구 능력 상승 |
| CLSR | 마무리 기질 | Closer Mentality | 세이브 상황·9회 등 클로징 상황에서 투구 집중력·효율 상승 |
| WKHS | 내구왕 | Workhorse | 많은 이닝 소화해도 구위 유지. 체력(STM) 소모율 감소 |
| CTRL | 극도의 제구 | Control Artist | 볼넷 확률 크게 감소. CTL 능력치 연산 추가 보너스 |
| STRK | 탈삼진 머신 | Strikeout Machine | 삼진 유도 확률 상승. BRK·VEL 능력치 연산 강화 |
| LHKL | 좌타자 킬러 | Left-Hand Killer | 좌타자 상대 시 효율 상승 |
| RHKL | 우타자 킬러 | Right-Hand Killer | 우타자 상대 시 효율 상승 |

**타격 관련 (타자 전용)**

| CD_VAL | CD_NM | CD_ENG_NM | CD_DESC |
|--------|-------|-----------|---------|
| CLTH | 클러치 히터 | Clutch Hitter | 득점권(주자 1·2루, 만루) 상황에서 타율·장타율 보너스 |
| PWRH | 파워 히터 | Power Hitter | 홈런·장타 확률 추가 보너스. PWR 능력치 연산 강화 |
| CTMN | 컨택 머신 | Contact Machine | 삼진 아웃 확률 크게 감소. CNT 능력치 연산 강화 |
| DSPY | 선구안 | Plate Discipline | 볼넷 선택 능력 향상. 헛스윙·삼진 감소 |
| BDBL | 배드볼 히터 | Bad Ball Hitter | 스트라이크존 외 공에도 강한 타격. 볼 판정 투구에도 안타 가능 |
| SPDM | 번개발 | Speed Demon | 도루 성공률·주루 능력 추가 보너스. RUN·STL 능력치 연산 강화 |

**정신·성격 관련**

| CD_VAL | CD_NM | CD_ENG_NM | CD_DESC |
|--------|-------|-----------|---------|
| COMP | 승부사 | Competitor | 중요 상황에서 집중력·결단력 상승. BGM 히든 능력치 효과 배가 |
| MNTL | 멘탈 강자 | Mental Giant | 연패·부진 속에서도 능력치 유지. 압박·여론에 흔들리지 않음 |
| TPLR | 팀 플레이어 | Team Player | 팀 사기·분위기에 긍정적 영향. LDR 히든 능력치 효과 보조 |
| GRND | 악바리 | Grinder | 체력·컨디션이 낮아져도 능력치 감소 폭이 작음 |
| DRTY | 더티 플레이어 | Dirty Player | 비매너 플레이 빈도 증가. DRT 히든 능력치 효과 배가. 상대 자극·실수 유도 |
| SPRT | 스포츠맨 | Sportsman | 항상 클린 플레이. 퇴장·경고 확률 0. SPT 히든 능력치 최고 수준 고정 |

---

## TM — 팀 (V6)

| TM_ID | TM_KR_NM | TM_ENG_NM | TM_SHRT_KR_NM | TM_SHRT_ENG_NM | TM_ESTBLSH_DT |
|-------|----------|-----------|----------------|----------------|---------------|
| 1 | KIA 타이거즈 | KIA Tigers | KIA | KIA | 1982-01-10 |
| 2 | 삼성 라이온즈 | Samsung Lions | 삼성 | SS | 1982-01-10 |
| 3 | LG 트윈스 | LG Twins | LG | LG | 1990-01-10 |
| 4 | 두산 베어스 | Doosan Bears | 두산 | OB | 1982-01-10 |
| 5 | KT 위즈 | KT Wiz | KT | KT | 2013-01-10 |
| 6 | SSG 랜더스 | SSG Landers | SSG | SSG | 2000-01-10 |
| 7 | 롯데 자이언츠 | Lotte Giants | 롯데 | LT | 1975-03-04 |
| 8 | 한화 이글스 | Hanwha Eagles | 한화 | HH | 1986-01-10 |
| 9 | NC 다이노스 | NC Dinos | NC | NC | 2011-09-09 |
| 10 | 키움 히어로즈 | Kiwoom Heroes | 키움 | WO | 2008-01-10 |

---

## PLR — 선수 기본 정보 (V7)

### KIA 타이거즈 (TM_ID=1)

| PLR_ID | PLR_NM | PLR_ENG_NM |
|--------|--------|------------|
| 1 | 양현종 | Yang Hyeon-jong |
| 2 | 김도영 | Kim Do-young |
| 3 | 최형우 | Choi Hyoung-woo |
| 4 | 나성범 | Na Sung-bum |
| 5 | 소크라테스 브리토 | Socrates Brito |
| 6 | 이의리 | Lee Eui-ri |
| 7 | 황대인 | Hwang Dae-in |
| 8 | 박찬호 | Park Chan-ho |
| 9 | 한준수 | Han Jun-su |
| 10 | 정해영 | Jung Hae-young |

### 삼성 라이온즈 (TM_ID=2)

| PLR_ID | PLR_NM | PLR_ENG_NM |
|--------|--------|------------|
| 11 | 원태인 | Won Tae-in |
| 12 | 구자욱 | Koo Ja-wook |
| 13 | 이재현 | Lee Jae-hyun |
| 14 | 강민호 | Kang Min-ho |
| 15 | 박병호 | Park Byung-ho |
| 16 | 김헌곤 | Kim Heon-gon |
| 17 | 오승환 | Oh Seung-hwan |
| 18 | 서준원 | Seo Jun-won |
| 19 | 류지혁 | Ryu Ji-hyeok |
| 20 | 김지찬 | Kim Ji-chan |

### LG 트윈스 (TM_ID=3)

| PLR_ID | PLR_NM | PLR_ENG_NM |
|--------|--------|------------|
| 21 | 임찬규 | Im Chan-gyu |
| 22 | 오지환 | Oh Ji-hwan |
| 23 | 박해민 | Park Hae-min |
| 24 | 문보경 | Moon Bo-gyeong |
| 25 | 홍창기 | Hong Chang-ki |
| 26 | 오스틴 딘 | Austin Dean |
| 27 | 박동원 | Park Dong-won |
| 28 | 이정용 | Lee Jung-yong |
| 29 | 플럿코 | Casey Fluttko |
| 30 | 신민재 | Shin Min-jae |

### 두산 베어스 (TM_ID=4)

| PLR_ID | PLR_NM | PLR_ENG_NM |
|--------|--------|------------|
| 31 | 곽빈 | Kwak Bin |
| 32 | 양석환 | Yang Seok-hwan |
| 33 | 허경민 | Heo Gyeong-min |
| 34 | 강승호 | Kang Seung-ho |
| 35 | 정수빈 | Jung Su-bin |
| 36 | 박계범 | Park Gye-beom |
| 37 | 김강률 | Kim Gang-ryul |
| 38 | 로버트 가르시아 | Robert Garcia |
| 39 | 전민수 | Jeon Min-su |
| 40 | 권희동 | Kwon Hee-dong |

### KT 위즈 (TM_ID=5)

| PLR_ID | PLR_NM | PLR_ENG_NM |
|--------|--------|------------|
| 41 | 고영표 | Ko Young-pyo |
| 42 | 강백호 | Kang Baek-ho |
| 43 | 황재균 | Hwang Jae-gyun |
| 44 | 천성호 | Cheon Seong-ho |
| 45 | 배정대 | Bae Jung-dae |
| 46 | 로하스 | Mel Rojas Jr. |
| 47 | 엄상백 | Eom Sang-baek |
| 48 | 김재윤 | Kim Jae-yun |
| 49 | 박경수 | Park Kyung-su |
| 50 | 장성우 | Jang Seong-woo |

### SSG 랜더스 (TM_ID=6)

| PLR_ID | PLR_NM | PLR_ENG_NM |
|--------|--------|------------|
| 51 | 김광현 | Kim Kwang-hyun |
| 52 | 최지훈 | Choi Ji-hoon |
| 53 | 한유섬 | Han Yu-seom |
| 54 | 최정 | Choi Jeong |
| 55 | 박성한 | Park Sung-han |
| 56 | 오태곤 | Oh Tae-gon |
| 57 | 이재원 | Lee Jae-won |
| 58 | 문승원 | Moon Seung-won |
| 59 | 노경은 | Roh Gyeong-eun |
| 60 | 기예르모 에레디아 | Guillermo Heredia |

### 롯데 자이언츠 (TM_ID=7)

| PLR_ID | PLR_NM | PLR_ENG_NM |
|--------|--------|------------|
| 61 | 안치홍 | Ahn Chi-hong |
| 62 | 전준우 | Jeon Jun-woo |
| 63 | 한동희 | Han Dong-hee |
| 64 | 나균안 | Na Gyun-an |
| 65 | 윤동희 | Yoon Dong-hee |
| 66 | 고승민 | Ko Seung-min |
| 67 | 유강남 | Yu Kang-nam |
| 68 | 김원중 | Kim Won-joong |
| 69 | 빅터 레이예스 | Victor Reyes |
| 70 | 이인복 | Lee In-bok |

### 한화 이글스 (TM_ID=8)

| PLR_ID | PLR_NM | PLR_ENG_NM |
|--------|--------|------------|
| 71 | 류현진 | Ryu Hyun-jin |
| 72 | 노시환 | Noh Si-hwan |
| 73 | 채은성 | Chae Eun-sung |
| 74 | 문현빈 | Moon Hyun-bin |
| 75 | 김인환 | Kim In-hwan |
| 76 | 최재훈 | Choi Jae-hoon |
| 77 | 박상원 | Park Sang-won |
| 78 | 문동주 | Moon Dong-ju |
| 79 | 브라이언 모리슨 | Bryan Morrison |
| 80 | 페라자 | Jose Ferrazza |

### NC 다이노스 (TM_ID=9)

| PLR_ID | PLR_NM | PLR_ENG_NM |
|--------|--------|------------|
| 81 | 박민우 | Park Min-woo |
| 82 | 손아섭 | Son A-seop |
| 83 | 양의지 | Yang Eui-ji |
| 84 | 류진욱 | Ryu Jin-wook |
| 85 | 박건우 | Park Kun-woo |
| 86 | 박성호 | Park Sung-ho |
| 87 | 이재학 | Lee Jae-hak |
| 88 | 오영수 | Oh Young-su |
| 89 | 나성용 | Na Sung-yong |
| 90 | 김형준 | Kim Hyung-jun |

### 키움 히어로즈 (TM_ID=10)

| PLR_ID | PLR_NM | PLR_ENG_NM |
|--------|--------|------------|
| 91 | 안우진 | An Woo-jin |
| 92 | 이주형 | Lee Joo-hyung |
| 93 | 김혜성 | Kim Hye-seong |
| 94 | 송성문 | Song Sung-moon |
| 95 | 이원석 | Lee Won-seok |
| 96 | 이지영 | Lee Ji-young |
| 97 | 헤이수스 | Yefri Perez |
| 98 | 주승우 | Joo Seung-woo |
| 99 | 한현희 | Han Hyun-hee |
| 100 | 김웅빈 | Kim Woong-bin |

---

## PLR_POSN — 선수-포지션 (V8)

POSN_CD: 10=SP 11=RP 12=CP 20=C 21=1B 22=2B 23=3B 24=SS 25=LF 26=CF 27=RF 28=DH

| PLR_ID | PLR_NM | POSN_CD | 포지션 | POSN_PRFC_ABLT |
|--------|--------|---------|--------|----------------|
| 1 | 양현종 | 10 | SP | 55 |
| 2 | 김도영 | 24 | SS | 72 |
| 3 | 최형우 | 28 | DH | 48 |
| 4 | 나성범 | 27 | RF | 62 |
| 5 | 소크라테스 | 25 | LF | 60 |
| 6 | 이의리 | 10 | SP | 52 |
| 7 | 황대인 | 21 | 1B | 60 |
| 8 | 박찬호 | 22 | 2B | 62 |
| 9 | 한준수 | 20 | C | 65 |
| 10 | 정해영 | 12 | CP | 52 |
| ... | (이하 V8 SQL 참조) | | | |

---

## PLR_ABLT — 선수 능력치 (V9)

능력치 스케일: 20~80 (50=KBO 평균)  
등급 기준: 76+ S+ / 71+ S / 66+ S- / 61+ A+ / 56+ A / 51+ A- / 46+ B+ / 41+ B / 36+ B- / 31+ C+ / 26+ C / 23+ C- / ~22 D

### 주요 선수 능력치 요약

| PLR_ID | PLR_NM | 주요 능력치 | 특이사항 |
|--------|--------|-------------|----------|
| 1 | 양현종 | CTL=73 BRK=70 PCH=73 | 체인지업 특화 좌완 에이스 |
| 2 | 김도영 | CNT=70 RUN=72 STL=74 | 올라운더 유격수 |
| 3 | 최형우 | CNT=73 PWR=70 RUN=30 | 타격 특화 DH |
| 14 | 강민호 | THR=70 | KBO 최고 어깨 포수 중 하나 |
| 15 | 박병호 | PWR=72 | 홈런 타자 |
| 17 | 오승환 | CTL=72 PSL=72 | 슬라이더 마무리 |
| 20 | 김지찬 | RUN=74 STL=72 | 스피드 스타 |
| 23 | 박해민 | RUN=73 STL=71 | CF 수비 및 발 |
| 51 | 김광현 | CTL=74 PCH=74 | KBO 최정상 좌완 |
| 54 | 최정 | PWR=74 | 역대급 홈런타자 |
| 71 | 류현진 | CTL=75 PCH=75 BRK=73 | 체인지업·제구 최정상 |
| 78 | 문동주 | VEL=73 P4S=73 | 강속구 유망주 |
| 83 | 양의지 | CNT=71 THR=71 | KBO 최정상 포수 |
| 91 | 안우진 | VEL=73 P4S=73 | 강속구 에이스 유망주 |

> 전체 능력치 데이터는 V9__insert_plr_ablt.sql 참조

---

## BRDCST_SPNSR — 방송국 스폰서 (V23)

금액 단위: 만원. 계약금이 높을수록 수당이 낮고, 낮을수록 수당이 높음 (평균 계약금 60억, 편차 ±10억).

| BRDCST_CD | BRDCST_NM | CNTRCT_FEE | WIN_BONUS | POST_BONUS | KS_BONUS |
|-----------|-----------|------------|-----------|------------|----------|
| SBS | SBS | 700000 | 500 | 20000 | 80000 |
| KBS | KBS | 600000 | 1500 | 50000 | 150000 |
| MBC | MBC | 500000 | 3000 | 100000 | 250000 |

- **SBS**: 계약금 70억 (안정형) — 승리 수당 500만/승, 포스트 2억, KS 8억
- **KBS**: 계약금 60억 (균형형) — 승리 수당 1500만/승, 포스트 5억, KS 15억
- **MBC**: 계약금 50억 (성과형) — 승리 수당 3000만/승, 포스트 10억, KS 25억
