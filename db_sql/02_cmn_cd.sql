-- =====================================================
-- 공통코드 초기 데이터 (전체)
-- 출처: V5, V15, V16, V24, V26, V30, V31
-- =====================================================

-- 포지션코드 (CD_ID = 'POSN')
INSERT INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('POSN', '10', '선발투수', 'Starting Pitcher',   '경기 시작부터 선발 등판하여 다수 이닝을 소화하는 투수'),
('POSN', '11', '중간계투', 'Relief Pitcher',     '선발투수 이후 등판하는 불펜 투수'),
('POSN', '12', '마무리',   'Closer',             '경기 마지막 이닝(주로 9회)을 담당하는 마무리 투수'),
('POSN', '20', '포수',     'Catcher',            '홈플레이트 뒤에서 투수 배터리를 이루는 포지션'),
('POSN', '21', '1루수',    'First Baseman',      '1루 베이스를 담당하는 내야수'),
('POSN', '22', '2루수',    'Second Baseman',     '2루 베이스를 담당하는 내야수'),
('POSN', '23', '3루수',    'Third Baseman',      '3루 베이스를 담당하는 내야수'),
('POSN', '24', '유격수',   'Shortstop',          '2루와 3루 사이를 수비하는 내야수'),
('POSN', '25', '좌익수',   'Left Fielder',       '좌측 외야를 담당하는 외야수'),
('POSN', '26', '중견수',   'Center Fielder',     '중앙 외야를 담당하는 외야수, 외야 리더'),
('POSN', '27', '우익수',   'Right Fielder',      '우측 외야를 담당하는 외야수'),
('POSN', '28', '지명타자', 'Designated Hitter',  '수비 없이 타격만 전담하는 포지션');

-- 대표포지션코드 (CD_ID = 'REPR_POSN')
INSERT INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('REPR_POSN', '10', '투수',   'Pitcher',    '선발·중간계투·마무리를 포함하는 투수 그룹'),
('REPR_POSN', '20', '포수',   'Catcher',    '포수 포지션'),
('REPR_POSN', '21', '내야수', 'Infielder',  '1루수·2루수·3루수·유격수를 포함하는 내야수 그룹'),
('REPR_POSN', '22', '외야수', 'Outfielder', '좌익수·중견수·우익수·지명타자를 포함하는 외야/타격 그룹');

-- 능력치코드 — 타자 (CD_ID = 'ABLT')
INSERT INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('ABLT', 'CNT', '컨택',   'Contact',        '[타자] 공을 정확하게 맞추는 능력. 타율과 직결'),
('ABLT', 'PWR', '파워',   'Power',          '[타자] 타구에 힘을 실어 장타를 만드는 능력. 홈런·장타율과 직결'),
('ABLT', 'RUN', '주루',   'Base Running',   '[타자] 베이스 주루 속도 및 상황 판단 능력'),
('ABLT', 'THR', '송구',   'Throwing',       '[타자] 정확하고 강하게 공을 송구하는 수비 능력'),
('ABLT', 'STL', '도루',   'Stealing',       '[타자] 도루 성공 능력 (출발 타이밍 + 스피드)');

-- 능력치코드 — 투수 기본 (CD_ID = 'ABLT')
INSERT INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('ABLT', 'VEL', '구속',    'Velocity',        '[투수] 투구 볼의 최고 속도 능력'),
('ABLT', 'CTL', '제구',    'Control',         '[투수] 원하는 코스에 정확히 던지는 능력. 볼넷 방지와 직결'),
('ABLT', 'BRK', '변화구',  'Breaking Ball',   '[투수] 보유 변화구의 전반적인 날카로움과 완성도');

-- 능력치코드 — 투수 구종 (CD_ID = 'ABLT')
INSERT INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('ABLT', 'P4S', '포심',    '4-Seam Fastball', '[투수] 회전수가 높고 직선적인 기본 패스트볼'),
('ABLT', 'P2S', '투심',    '2-Seam Fastball', '[투수] 좌우 무브먼트가 있는 패스트볼'),
('ABLT', 'PCT', '커터',    'Cutter',          '[투수] 타자 손잡이 방향으로 날카롭게 꺾이는 패스트볼계열'),
('ABLT', 'PSN', '싱커',    'Sinker',          '[투수] 아래 방향으로 가라앉는 그라운드볼 유도 구종'),
('ABLT', 'PSL', '슬라이더','Slider',          '[투수] 가로 방향으로 꺾이는 대표적인 변화구'),
('ABLT', 'PCB', '커브',    'Curveball',       '[투수] 큰 궤도로 아래로 휘는 변화구'),
('ABLT', 'PCH', '체인지업','Changeup',        '[투수] 패스트볼과 유사한 폼이나 느린 속도로 타자를 교란하는 구종'),
('ABLT', 'PFK', '포크',    'Forkball',        '[투수] 낙차가 큰 낙구계열 변화구 (스플리터 포함)');

-- 능력치코드 — 공통 체력 (CD_ID = 'ABLT')
INSERT INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('ABLT', 'STM', '체력', 'Stamina',
 '[공통] 선수 체력·내구성. 높을수록 피로 누적이 느리고 부상 위험이 낮음');

-- 연고도시코드 (CD_ID = 'CITY')
INSERT INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('CITY', 'GJU', '광주', 'Gwangju', '광역시. 연고 구단: KIA 타이거즈'),
('CITY', 'DGU', '대구', 'Daegu',   '광역시. 연고 구단: 삼성 라이온즈'),
('CITY', 'SEL', '서울', 'Seoul',   '특별시. 연고 구단: LG 트윈스·두산 베어스·키움 히어로즈'),
('CITY', 'SWN', '수원', 'Suwon',   '경기도. 연고 구단: KT 위즈'),
('CITY', 'ICN', '인천', 'Incheon', '광역시. 연고 구단: SSG 랜더스'),
('CITY', 'BSN', '부산', 'Busan',   '광역시. 연고 구단: 롯데 자이언츠'),
('CITY', 'DJN', '대전', 'Daejeon', '광역시. 연고 구단: 한화 이글스'),
('CITY', 'CWN', '창원', 'Changwon','경남. 연고 구단: NC 다이노스');

-- 경기상태코드 (CD_ID = 'GAME_STTS')
INSERT INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('GAME_STTS', '01', '예정',     'Scheduled',    '경기 예정 상태 (아직 시작 전)'),
('GAME_STTS', '02', '진행중',   'In Progress',  '경기 진행 중인 상태'),
('GAME_STTS', '03', '완료',     'Completed',    '경기가 정상적으로 종료된 상태'),
('GAME_STTS', '04', '우천중단', 'Rain Delay',   '우천으로 경기가 중단된 상태'),
('GAME_STTS', '05', '취소',     'Cancelled',    '경기가 취소된 상태'),
('GAME_STTS', '06', '무효',     'No Game',      '선언된 무효 경기 (재경기 필요)');

-- 투타코드 (CD_ID = 'BAT_PTCH_HAND')
INSERT INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('BAT_PTCH_HAND', 'RR', '우투우타', 'Right/Right',  '우완 투수 또는 우타자'),
('BAT_PTCH_HAND', 'RL', '우투좌타', 'Right/Left',   '우완 투수·좌타자'),
('BAT_PTCH_HAND', 'RS', '우투양타', 'Right/Switch', '우완 투수·스위치 타자'),
('BAT_PTCH_HAND', 'LL', '좌투좌타', 'Left/Left',    '좌완 투수 또는 좌타자'),
('BAT_PTCH_HAND', 'LR', '좌투우타', 'Left/Right',   '좌완 투수·우타자'),
('BAT_PTCH_HAND', 'LS', '좌투양타', 'Left/Switch',  '좌완 투수·스위치 타자');

-- 잔디종류코드 (CD_ID = 'TURF_TYPE')
INSERT INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('TURF_TYPE', 'NT', '천연잔디',    'Natural Turf',    '천연 잔디 구장'),
('TURF_TYPE', 'AT', '인조잔디',    'Artificial Turf', '인조 잔디 구장'),
('TURF_TYPE', 'HB', '하이브리드',  'Hybrid Turf',     '천연+인조 혼합 하이브리드 잔디');

-- 드래프트 상태코드 (CD_ID = 'DRFT_STTS')
INSERT INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('DRFT_STTS', 'CREATED',     '생성됨',    'Created',     '드래프트 이벤트만 생성된 상태'),
('DRFT_STTS', 'SCOUTING',    '스카우팅',  'Scouting',    '스카우팅 가능 기간'),
('DRFT_STTS', 'READY',       '준비완료',  'Ready',       '지명 순서와 대상자 확정 상태'),
('DRFT_STTS', 'IN_PROGRESS', '진행중',    'In Progress', '실제 지명 진행 중'),
('DRFT_STTS', 'COMPLETED',   '완료',      'Completed',   '모든 라운드 종료'),
('DRFT_STTS', 'CANCELLED',   '취소',      'Cancelled',   '드래프트 취소');

-- 선수 출신코드 (CD_ID = 'PLR_ORGN')
INSERT INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('PLR_ORGN', 'HS',    '고졸',       'High School',   '고등학교 졸업'),
('PLR_ORGN', 'COL',   '대졸',       'College',       '대학교 졸업'),
('PLR_ORGN', 'ERLY',  '얼리',       'Early Draft',   '대학 재학 중 드래프트 신청'),
('PLR_ORGN', 'TRYO',  '트라이아웃', 'Tryout',        '트라이아웃 참가자 (낙마 후 재도전)'),
('PLR_ORGN', 'OVRSS', '해외출신',   'Overseas',      '해외 아마추어/프로 출신'),
('PLR_ORGN', 'IND',   '독립리그',   'Independent',   '독립리그 출신');

-- 픽 상태코드 (CD_ID = 'PICK_STTS')
INSERT INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('PICK_STTS', 'PENDING', '대기중', 'Pending', '지명 대기 중'),
('PICK_STTS', 'PICKED',  '지명됨', 'Picked',  '선수 지명 완료'),
('PICK_STTS', 'SKIPPED', '패스',   'Skipped', '픽 건너뜀');

-- 팀 엠블럼 코드 (CD_ID = 'TM_EMBLEM')
-- CD_VAL = TM_SHRT_ENG_NM, CD_DESC = 로고 파일명 (public/img/logo/ 하위)
INSERT INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('TM_EMBLEM', 'KIA', 'KIA 타이거즈',  'KIA Tigers',    'emblem_HT.png'),
('TM_EMBLEM', 'SS',  '삼성 라이온즈', 'Samsung Lions', 'emblem_SS.png'),
('TM_EMBLEM', 'LG',  'LG 트윈스',     'LG Twins',      'emblem_LG.png'),
('TM_EMBLEM', 'OB',  '두산 베어스',   'Doosan Bears',  'emblem_OB.png'),
('TM_EMBLEM', 'KT',  'KT 위즈',       'KT Wiz',        'emblem_KT.png'),
('TM_EMBLEM', 'SSG', 'SSG 랜더스',    'SSG Landers',   'emblem_SK.png'),
('TM_EMBLEM', 'LT',  '롯데 자이언츠', 'Lotte Giants',  'emblem_LT.png'),
('TM_EMBLEM', 'HH',  '한화 이글스',   'Hanwha Eagles', 'emblem_HH.png'),
('TM_EMBLEM', 'NC',  'NC 다이노스',   'NC Dinos',      'emblem_NC.png'),
('TM_EMBLEM', 'WO',  '키움 히어로즈', 'Kiwoom Heroes', 'emblem_WO.png');

-- 팀 CI 색상 코드 (CD_ID = 'TM_CI_CLR') — V30 기준 확정 색상
-- CD_VAL = TM_SHRT_ENG_NM, CD_DESC = HEX 색상코드
INSERT INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('TM_CI_CLR', 'KIA', 'KIA 타이거즈',  'KIA Tigers',    '#EA0029'),
('TM_CI_CLR', 'SS',  '삼성 라이온즈', 'Samsung Lions', '#074CA1'),
('TM_CI_CLR', 'LG',  'LG 트윈스',     'LG Twins',      '#C8102E'),
('TM_CI_CLR', 'OB',  '두산 베어스',   'Doosan Bears',  '#183765'),
('TM_CI_CLR', 'KT',  'KT 위즈',       'KT Wiz',        '#000000'),
('TM_CI_CLR', 'SSG', 'SSG 랜더스',    'SSG Landers',   '#CE0E2D'),
('TM_CI_CLR', 'LT',  '롯데 자이언츠', 'Lotte Giants',  '#00295B'),
('TM_CI_CLR', 'HH',  '한화 이글스',   'Hanwha Eagles', '#FF6600'),
('TM_CI_CLR', 'NC',  'NC 다이노스',   'NC Dinos',      '#00275A'),
('TM_CI_CLR', 'WO',  '키움 히어로즈', 'Kiwoom Heroes', '#850237');

-- 이벤트 타입 코드 (CD_ID = 'EVNT_TYPE')
INSERT INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('EVNT_TYPE', 'BRDCST', '방송국계약', 'Broadcast Contract', '방송국 스폰서 계약 선택 이벤트');

-- 스태프 능력치 코드 (CD_ID = 'STFF_ABLT')
INSERT INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
-- 감독 능력치
('STFF_ABLT', 'TAC',  '전술',     'Tactics',        '경기 전술 구성 능력'),
('STFF_ABLT', 'MOT',  '동기부여', 'Motivation',     '선수 동기 부여 능력'),
('STFF_ABLT', 'MAN',  '관리력',   'Management',     '팀 전체 관리 능력'),
('STFF_ABLT', 'DISC', '훈련',     'Discipline',     '훈련 지도 및 규율 능력'),
('STFF_ABLT', 'DET',  '결단력',   'Determination',  '위기 상황 판단 및 결단 능력'),
('STFF_ABLT', 'ADP',  '적응력',   'Adaptability',   '상황 변화에 대한 적응 능력'),
-- 코치 능력치
('STFF_ABLT', 'TCNT', '타격지도', 'Hitting Coach',  '타격 기술 지도 능력'),
('STFF_ABLT', 'TTCH', '투구지도', 'Pitching Coach', '투구 기술 지도 능력'),
('STFF_ABLT', 'TPWR', '파워지도', 'Power Coach',    '장타력 향상 지도 능력'),
('STFF_ABLT', 'TCTL', '컨트롤',   'Control Coach',  '제구력 향상 지도 능력'),
('STFF_ABLT', 'TSTM', '스태미나', 'Stamina Coach',  '체력·지구력 지도 능력'),
('STFF_ABLT', 'TVEL', '구속지도', 'Velocity Coach', '구속 향상 지도 능력'),
('STFF_ABLT', 'TBRK', '변화구',   'Breaking Coach', '변화구 지도 능력'),
('STFF_ABLT', 'TRUN', '주루지도', 'Baserunning',    '주루 전략 지도 능력'),
('STFF_ABLT', 'TSTL', '도루지도', 'Steal Coach',    '도루 기술 지도 능력');
