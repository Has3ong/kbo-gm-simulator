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

-- ─── 추가 코드 (12_missing_cmn_cd.sql 통합, INSERT IGNORE) ──────────────────

-- PLR_STTS — 선수 상태코드
INSERT IGNORE INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('PLR_STTS', 'AT',  '활동',    'Active',       '정상 활동 중. 경기 출전 가능'),
('PLR_STTS', 'INJ', '부상',    'Injured',      '부상으로 이탈. 경기 출전 불가'),
('PLR_STTS', 'RET', '은퇴',    'Retired',      '은퇴. 경기 출전 불가'),
('PLR_STTS', 'FA',  'FA',      'Free Agent',   '자유계약 상태. 소속팀 없음'),
('PLR_STTS', 'REL', '방출',    'Released',     '구단에서 방출된 상태');

-- HIDE_ABLT — 히든 능력치코드 (1~20 스케일, 게임 엔진 내부 연산 전용)
INSERT IGNORE INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('HIDE_ABLT', 'FCN', '집중력',     'Focus',           '한 경기 내에서의 일관성. 높을수록 경기 중 집중력이 지속됨'),
('HIDE_ABLT', 'DRV', '승부욕',     'Drive',           '승리에 대한 헌신도 및 경기 중 결단력'),
('HIDE_ABLT', 'LDR', '리더십',     'Leadership',      '다른 선수에게 미치는 긍정적 영향력'),
('HIDE_ABLT', 'IRK', '부상위험도', 'Injury Risk',     '부상 빈도 및 확률. 높을수록 부상에 취약(유리몸)'),
('HIDE_ABLT', 'CST', '일관성',     'Consistency',     '일정 경기 동안 얼마나 꾸준히 활약할 수 있는가'),
('HIDE_ABLT', 'DRT', '더티플레이', 'Dirty Play',      '비매너 행동 빈도. 상대를 흥분시켜 실수·카드를 유도하는 능력'),
('HIDE_ABLT', 'BGM', '중요경기',   'Big Game',        '중요경기에서 긴장하지 않는 능력'),
('HIDE_ABLT', 'AMB', '야망',       'Ambition',        '더 큰 것을 바라는 정도. 높으면 성장 빠르나 이적·연봉 요구 분쟁 가능'),
('HIDE_ABLT', 'PRF', '프로의식',   'Professionalism', '필드 안팎 프로의식. 높으면 성장 빠르고 노화 속도 둔화'),
('HIDE_ABLT', 'SPT', '스포츠맨십', 'Sportsmanship',   '필드 내 정정당당함의 수치'),
('HIDE_ABLT', 'PAT', '참을성',     'Patience',        '동료·감독·연봉 협상 상황에서의 인내심');

-- STFF_TYPE — 스태프 직종코드
INSERT IGNORE INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('STFF_TYPE', 'MGR',   '감독',         'Manager',         '팀 전략·전술·인사 총괄'),
('STFF_TYPE', 'COACH', '코치',         'Coach',           '타격·투수·주루 등 포지션별 지도'),
('STFF_TYPE', 'SCUT',  '스카우터',     'Scout',           '선수 발굴·평가·입단 협상'),
('STFF_TYPE', 'MED',   '의무트레이너', 'Medical Trainer', '부상 진단·치료·재활 관리'),
('STFF_TYPE', 'ANLY',  '분석가',       'Analyst',         '경기 데이터 분석·전략 보조');

-- CNTRCT_TYPE — 계약 종류코드
INSERT IGNORE INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('CNTRCT_TYPE', 'FA', 'FA 계약',   'Free Agent',  '자유계약선수 계약'),
('CNTRCT_TYPE', 'RC', '재계약',    'Re-Contract', '기존 팀과 연장·재계약'),
('CNTRCT_TYPE', 'NK', '신인 계약', 'New Kid',     '드래프트 신인 계약'),
('CNTRCT_TYPE', 'FR', '외국인',    'Foreign',     '외국인 선수 계약');

-- FCLTY_STTS — 시설 업그레이드 상태코드
INSERT IGNORE INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('FCLTY_STTS', 'PLAN', '계획중', 'Planned',     '업그레이드 계획 수립'),
('FCLTY_STTS', 'PROG', '진행중', 'In Progress', '업그레이드 공사 중'),
('FCLTY_STTS', 'CMPL', '완료',   'Completed',   '업그레이드 완료'),
('FCLTY_STTS', 'CNCL', '취소',   'Cancelled',   '업그레이드 취소');

-- GAME_TYPE — 경기 종류코드
INSERT IGNORE INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('GAME_TYPE', 'REG', '정규시즌',    'Regular Season', '정규시즌 경기'),
('GAME_TYPE', 'WC',  '와일드카드',  'Wild Card',      '포스트시즌 와일드카드 경기'),
('GAME_TYPE', 'SP',  '준플레이오프','Semi-Playoff',   '포스트시즌 준플레이오프'),
('GAME_TYPE', 'PO',  '플레이오프',  'Playoff',        '포스트시즌 플레이오프'),
('GAME_TYPE', 'KS',  '한국시리즈',  'Korean Series',  '한국시리즈');

-- SSNT_STTS — 시즌 상태코드
INSERT IGNORE INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('SSNT_STTS', 'PRE',  '프리시즌',  'Pre-Season',     '계약, 스프링캠프, 연습경기, 로스터 구성'),
('SSNT_STTS', 'REG',  '정규시즌',  'Regular Season', '경기 진행, 콜업·말소, 트레이드, 부상 관리'),
('SSNT_STTS', 'POST', '포스트시즌','Post-Season',    '엔트리 고정, 플레이오프 경기 진행'),
('SSNT_STTS', 'OFF',  '오프시즌',  'Off-Season',     'FA 계약, 방출, 드래프트, 연봉 협상'),
('SSNT_STTS', 'CMPL', '완료',      'Completed',      '기록 보관, 수상 확정, 다음 시즌 생성');

-- SRS_STTS — 포스트시즌 시리즈 상태코드
INSERT IGNORE INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('SRS_STTS', 'PROG', '진행중', 'In Progress', '시리즈 진행 중'),
('SRS_STTS', 'CMPL', '완료',   'Completed',   '시리즈 종료');

-- PSTSSNT_STTS — 팀 포스트시즌 진출 상태코드
INSERT IGNORE INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('PSTSSNT_STTS', 'UNDC', '미결정',        'Undecided',           '포스트시즌 진출 여부 미결정'),
('PSTSSNT_STTS', 'ELIM', '탈락',          'Eliminated',          '포스트시즌 탈락 확정'),
('PSTSSNT_STTS', 'CLWC', '와일드카드 확정','Clinched Wild Card',  '와일드카드 진출 확정'),
('PSTSSNT_STTS', 'CLPS', '포스트 확정',   'Clinched Postseason', '포스트시즌 직행 확정'),
('PSTSSNT_STTS', 'CL1P', '1위 확정',      'Clinched 1st Place',  '정규시즌 1위 확정'),
('PSTSSNT_STTS', 'CHMP', '우승',          'Champion',            '한국시리즈 우승');

-- PLR_TRT_TYPE — 선수 특성코드
INSERT IGNORE INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('PLR_TRT_TYPE', 'IRON', '금강불괴',      'Iron Body',         '부상 확률 크게 감소. IRK 히든 능력치 효과 무시'),
('PLR_TRT_TYPE', 'GLAS', '유리몸',        'Glass Body',        '부상 확률 크게 증가. 경미한 충돌에도 부상 가능'),
('PLR_TRT_TYPE', 'RCVR', '빠른 회복',     'Quick Recovery',    '부상 후 회복 기간 크게 단축'),
('PLR_TRT_TYPE', 'LONG', '장수',          'Longevity',         '노화로 인한 능력치 하락 속도 둔화'),
('PLR_TRT_TYPE', 'AGED', '노쇠화',        'Rapid Aging',       '능력치 하락 속도 빠름. 피크 이후 급격히 쇠퇴'),
('PLR_TRT_TYPE', 'ERLB', '조숙',          'Early Bloomer',     '어린 나이에 빠르게 성장. 피크 도달 시기 빠름'),
('PLR_TRT_TYPE', 'LATB', '만숙',          'Late Bloomer',      '늦게 성장. 커리어 후반까지 성장 가능'),
('PLR_TRT_TYPE', 'ACEM', '에이스 기질',   'Ace Mentality',     '중요 경기(포스트시즌, 라이벌전)에서 투구 능력 상승'),
('PLR_TRT_TYPE', 'CLSR', '마무리 기질',   'Closer Mentality',  '세이브 상황·9회에서 투구 집중력·효율 상승'),
('PLR_TRT_TYPE', 'WKHS', '내구왕',        'Workhorse',         '많은 이닝 소화해도 구위 유지. STM 소모율 감소'),
('PLR_TRT_TYPE', 'CTRL', '극도의 제구',   'Control Artist',    '볼넷 확률 크게 감소. 제구(CTL) 능력치 추가 보너스'),
('PLR_TRT_TYPE', 'STRK', '탈삼진 머신',   'Strikeout Machine', '삼진 유도 확률 상승'),
('PLR_TRT_TYPE', 'LHKL', '좌타자 킬러',   'Left-Hand Killer',  '좌타자 상대 효율 상승'),
('PLR_TRT_TYPE', 'RHKL', '우타자 킬러',   'Right-Hand Killer', '우타자 상대 효율 상승'),
('PLR_TRT_TYPE', 'CLTH', '클러치 히터',   'Clutch Hitter',     '득점권(1·2루, 만루)에서 타율·장타율 보너스'),
('PLR_TRT_TYPE', 'PWRH', '파워 히터',     'Power Hitter',      '홈런·장타 확률 추가 보너스. PWR 능력치 연산 강화'),
('PLR_TRT_TYPE', 'CTMN', '컨택 머신',     'Contact Machine',   '삼진 아웃 확률 크게 감소. 컨택(CNT) 능력치 연산 강화'),
('PLR_TRT_TYPE', 'DSPY', '선구안',        'Plate Discipline',  '볼넷 선택 능력 향상. 헛스윙 감소'),
('PLR_TRT_TYPE', 'BDBL', '배드볼 히터',   'Bad Ball Hitter',   '스트라이크존 외 공에도 강한 타격'),
('PLR_TRT_TYPE', 'SPDM', '번개발',        'Speed Demon',       '도루 성공률·주루 능력 추가 보너스. RUN·STL 연산 강화'),
('PLR_TRT_TYPE', 'COMP', '승부사',        'Competitor',        '중요 상황에서 집중력·결단력 상승. BGM 히든 능력치 효과 배가'),
('PLR_TRT_TYPE', 'MNTL', '멘탈 강자',     'Mental Giant',      '연패·역경 속에서도 능력치 유지. 압박에 강함'),
('PLR_TRT_TYPE', 'TPLR', '팀 플레이어',   'Team Player',       '팀 사기·분위기에 긍정적 영향. LDR 히든 능력치 효과 보조'),
('PLR_TRT_TYPE', 'GRND', '악바리',        'Grinder',           '체력·컨디션 낮아도 능력치 감소 폭 작음'),
('PLR_TRT_TYPE', 'DRTY', '더티 플레이어', 'Dirty Player',      '비매너 플레이 빈도 증가. DRT 히든 능력치 효과 배가'),
('PLR_TRT_TYPE', 'SPRT', '스포츠맨',      'Sportsman',         '항상 클린 플레이. 퇴장·경고 확률 0');

-- EVNT_TYPE — 나머지 이벤트 종류코드 (BRDCST 는 위에서 이미 삽입)
INSERT IGNORE INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('EVNT_TYPE', 'INJ',       '부상',         'Injury',           '선수 부상 발생'),
('EVNT_TYPE', 'RCV',       '부상 회복',    'Recovery',         '선수 부상 회복·복귀'),
('EVNT_TYPE', 'TRD',       '트레이드',     'Trade',            '트레이드 발생'),
('EVNT_TYPE', 'SIGN',      '계약',         'Sign',             '선수·스태프 계약 체결'),
('EVNT_TYPE', 'REL',       '방출',         'Release',          '선수 방출'),
('EVNT_TYPE', 'WARN',      '구단주 경고',  'Owner Warning',    '구단주로부터 경고 메시지'),
('EVNT_TYPE', 'FAN',       '팬 반응',      'Fan Reaction',     '팬 여론 변화 알림'),
('EVNT_TYPE', 'CALL',      '콜업 추천',    'Call Up',          '마이너 콜업 추천 알림'),
('EVNT_TYPE', 'MVP',       '월간 MVP',     'Monthly MVP',      '월간 MVP 발표'),
('EVNT_TYPE', 'POST',      '포스트시즌',   'Postseason',       '포스트시즌 진출 확정'),
('EVNT_TYPE', 'REC',       '기록 달성',    'Record',           '개인·팀 기록 달성'),
('EVNT_TYPE', 'NEWS',      '일반 뉴스',    'News',             '기타 일반 뉴스'),
('EVNT_TYPE', 'STFF',      '스태프 선임',  'Staff Hire',       '감독·코치 선임 안내 이벤트. HTML 콘텐츠 + 선임 버튼 포함'),
('EVNT_TYPE', 'GRWTH',     '성장',         'Growth',           '스프링캠프 후 선수 성장 결과'),
('EVNT_TYPE', 'RCNF',      '로스터 확정',  'Roster Confirm',   '로스터 확정 요청 이벤트'),
('EVNT_TYPE', 'FRGN_OVER', '외국인 초과',  'Foreign Over',     '1군 외국인 선수 3명 초과 경고'),
('EVNT_TYPE', 'FRGN',      '외국인 계약',  'Foreign Contract', '외국인 선수 계약 체결/거절 결과'),
('EVNT_TYPE', 'FRGN_OPEN', '용병계약시작', 'Foreign Open',     '외국인 선수 계약 기간 시작 안내 (2/1~2/10)'),
('EVNT_TYPE', 'SPRNG',     '스프링캠프',   'Spring Camp',      '스프링 캠프 선택 필수 이벤트 (2/15 자동 발생)'),
('EVNT_TYPE', 'STFF_AI',   '타 구단 선임', 'AI Staff Hire',    'AI 구단 감독·코치 선임 요약');

-- SPRNG_CAMP_CFG 초기 데이터
INSERT IGNORE INTO SPRNG_CAMP_CFG (CAMP_CD, CAMP_NM, COST, TIER, GROWTH_ABLT_CNT, MAX_GROWTH_PER_ABLT, MAX_OVRL_GROWTH) VALUES
('DOMESTIC', '국내',      50000,  1, 2, 1, 1),
('JEJU',     '제주',     100000,  2, 3, 1, 1),
('TAIWAN',   '대만',     150000,  3, 3, 2, 2),
('OKINAWA',  '오키나와', 200000,  4, 4, 2, 2),
('FLORIDA',  '플로리다', 250000,  5, 4, 3, 3),
('MIAMI',    '마이애미', 300000,  6, 5, 3, 3),
('ARIZONA',  '애리조나', 400000,  7, 6, 4, 4);
