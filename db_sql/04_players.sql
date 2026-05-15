-- =====================================================
-- 선수 기본 데이터 및 포지션 (PLR_ID: 1~100)
-- 출처: V7, V8
-- PLR_ID 1~10  : KIA 타이거즈 (TM_ID=1)
-- PLR_ID 11~20 : 삼성 라이온즈 (TM_ID=2)
-- PLR_ID 21~30 : LG 트윈스    (TM_ID=3)
-- PLR_ID 31~40 : 두산 베어스   (TM_ID=4)
-- PLR_ID 41~50 : KT 위즈      (TM_ID=5)
-- PLR_ID 51~60 : SSG 랜더스   (TM_ID=6)
-- PLR_ID 61~70 : 롯데 자이언츠 (TM_ID=7)
-- PLR_ID 71~80 : 한화 이글스   (TM_ID=8)
-- PLR_ID 81~90 : NC 다이노스   (TM_ID=9)
-- PLR_ID 91~100: 키움 히어로즈 (TM_ID=10)
-- =====================================================

-- KIA 타이거즈
INSERT INTO PLR (PLR_ID, PLR_NM, PLR_ENG_NM, TM_ID) VALUES
( 1, '양현종',        'Yang Hyeon-jong',  1),
( 2, '김도영',        'Kim Do-young',     1),
( 3, '최형우',        'Choi Hyoung-woo',  2),  -- 2026 삼성 이적
( 4, '나성범',        'Na Sung-bum',      1),
( 5, '소크라테스 브리토', 'Socrates Brito', 1),
( 6, '이의리',        'Lee Eui-ri',       1),
( 7, '황대인',        'Hwang Dae-in',     1),
( 8, '박찬호',        'Park Chan-ho',     1),
( 9, '한준수',        'Han Jun-su',       1),
(10, '정해영',        'Jung Hae-young',   1);

-- 삼성 라이온즈
INSERT INTO PLR (PLR_ID, PLR_NM, PLR_ENG_NM, TM_ID) VALUES
(11, '원태인',  'Won Tae-in',    2),
(12, '구자욱',  'Koo Ja-wook',   2),
(13, '이재현',  'Lee Jae-hyun',  2),
(14, '강민호',  'Kang Min-ho',   2),
(15, '박병호',  'Park Byung-ho', 2),
(16, '김헌곤',  'Kim Heon-gon',  2),
(17, '오승환',  'Oh Seung-hwan', 2),
(18, '서준원',  'Seo Jun-won',   2),
(19, '류지혁',  'Ryu Ji-hyeok',  2),
(20, '김지찬',  'Kim Ji-chan',   2);

-- LG 트윈스
INSERT INTO PLR (PLR_ID, PLR_NM, PLR_ENG_NM, TM_ID) VALUES
(21, '임찬규',   'Im Chan-gyu',   3),
(22, '오지환',   'Oh Ji-hwan',    3),
(23, '박해민',   'Park Hae-min',  3),
(24, '문보경',   'Moon Bo-gyeong',3),
(25, '홍창기',   'Hong Chang-ki', 3),
(26, '오스틴 딘', 'Austin Dean',  3),
(27, '박동원',   'Park Dong-won', 3),
(28, '이정용',   'Lee Jung-yong', 3),
(29, '플럿코',   'Casey Fluttko', 3),
(30, '신민재',   'Shin Min-jae',  3);

-- 두산 베어스
INSERT INTO PLR (PLR_ID, PLR_NM, PLR_ENG_NM, TM_ID) VALUES
(31, '곽빈',          'Kwak Bin',       4),
(32, '양석환',        'Yang Seok-hwan', 4),
(33, '허경민',        'Heo Gyeong-min', 5),  -- 2026 KT 이적
(34, '강승호',        'Kang Seung-ho',  4),
(35, '정수빈',        'Jung Su-bin',    4),
(36, '박계범',        'Park Gye-beom',  2),  -- 2026 삼성 이적
(37, '김강률',        'Kim Gang-ryul',  4),
(38, '로버트 가르시아', 'Robert Garcia', 4),
(39, '전민수',        'Jeon Min-su',    4),
(40, '권희동',        'Kwon Hee-dong',  9);  -- 2026 NC 이적

-- KT 위즈
INSERT INTO PLR (PLR_ID, PLR_NM, PLR_ENG_NM, TM_ID) VALUES
(41, '고영표', 'Ko Young-pyo',   5),
(42, '강백호', 'Kang Baek-ho',   8),  -- 2026 한화 이적
(43, '황재균', 'Hwang Jae-gyun', 5),
(44, '천성호', 'Cheon Seong-ho', 3),  -- 2026 LG 이적
(45, '배정대', 'Bae Jung-dae',   5),
(46, '로하스',  'Mel Rojas Jr.', 5),
(47, '엄상백', 'Eom Sang-baek',  5),
(48, '김재윤', 'Kim Jae-yun',    2),  -- 2026 삼성 이적
(49, '박경수', 'Park Kyung-su',  5),
(50, '장성우', 'Jang Seong-woo', 5);

-- SSG 랜더스
INSERT INTO PLR (PLR_ID, PLR_NM, PLR_ENG_NM, TM_ID) VALUES
(51, '김광현',          'Kim Kwang-hyun',     6),
(52, '최지훈',          'Choi Ji-hoon',       6),
(53, '한유섬',          'Han Yu-seom',        6),
(54, '최정',            'Choi Jeong',         6),
(55, '박성한',          'Park Sung-han',      6),
(56, '오태곤',          'Oh Tae-gon',         6),
(57, '이재원',          'Lee Jae-won',        3),  -- 2026 LG 이적
(58, '문승원',          'Moon Seung-won',     6),
(59, '노경은',          'Roh Gyeong-eun',     6),
(60, '기예르모 에레디아', 'Guillermo Heredia',  6);

-- 롯데 자이언츠
INSERT INTO PLR (PLR_ID, PLR_NM, PLR_ENG_NM, TM_ID) VALUES
(61, '안치홍',       'Ahn Chi-hong',  10), -- 2026 키움 이적
(62, '전준우',       'Jeon Jun-woo',  7),
(63, '한동희',       'Han Dong-hee',  7),
(64, '나균안',       'Na Gyun-an',    7),
(65, '윤동희',       'Yoon Dong-hee', 7),
(66, '고승민',       'Ko Seung-min',  7),
(67, '유강남',       'Yu Kang-nam',   7),
(68, '김원중',       'Kim Won-joong', 7),
(69, '빅터 레이예스', 'Victor Reyes', 7),
(70, '이인복',       'Lee In-bok',    7);

-- 한화 이글스
INSERT INTO PLR (PLR_ID, PLR_NM, PLR_ENG_NM, TM_ID) VALUES
(71, '류현진',          'Ryu Hyun-jin',   8),
(72, '노시환',          'Noh Si-hwan',    8),
(73, '채은성',          'Chae Eun-sung',  8),
(74, '문현빈',          'Moon Hyun-bin',  8),
(75, '김인환',          'Kim In-hwan',    8),
(76, '최재훈',          'Choi Jae-hoon',  8),
(77, '박상원',          'Park Sang-won',  8),
(78, '문동주',          'Moon Dong-ju',   8),
(79, '브라이언 모리슨',  'Bryan Morrison', 8),
(80, '페라자',          'Jose Ferrazza',  8);

-- NC 다이노스
INSERT INTO PLR (PLR_ID, PLR_NM, PLR_ENG_NM, TM_ID) VALUES
(81, '박민우', 'Park Min-woo',  9),
(82, '손아섭', 'Son A-seop',    4),  -- 2026 두산 이적
(83, '양의지', 'Yang Eui-ji',   4),  -- 2026 두산 이적
(84, '류진욱', 'Ryu Jin-wook',  9),
(85, '박건우', 'Park Kun-woo',  9),
(86, '박성호', 'Park Sung-ho',  9),
(87, '이재학', 'Lee Jae-hak',   9),
(88, '오영수', 'Oh Young-su',   9),
(89, '나성용', 'Na Sung-yong',  9),
(90, '김형준', 'Kim Hyung-jun', 9);

-- 키움 히어로즈
INSERT INTO PLR (PLR_ID, PLR_NM, PLR_ENG_NM, TM_ID) VALUES
( 91, '안우진',  'An Woo-jin',     10),
( 92, '이주형',  'Lee Joo-hyung',  10),
( 93, '김혜성',  'Kim Hye-seong',  10),
( 94, '송성문',  'Song Sung-moon', 10),
( 95, '이원석',  'Lee Won-seok',    8),  -- 2026 한화 이적
( 96, '이지영',  'Lee Ji-young',    6),  -- 2026 SSG 이적
( 97, '헤이수스', 'Yefri Perez',   10),
( 98, '주승우',  'Joo Seung-woo',  10),
( 99, '한현희',  'Han Hyun-hee',   10),
(100, '김웅빈',  'Kim Woong-bin',  10);

-- =====================================================
-- 선수-포지션 데이터 (주 포지션만 등록)
-- POSN_CD: 10=SP 11=RP 12=CP 20=C
--          21=1B 22=2B 23=3B 24=SS
--          25=LF 26=CF 27=RF 28=DH
-- POSN_PRFC_ABLT: 포지션 수비 숙련도 (20~80)
-- =====================================================
INSERT INTO PLR_POSN (PLR_ID, POSN_CD, POSN_PRFC_ABLT) VALUES
-- KIA
( 1, '10', 55), ( 2, '24', 72), ( 3, '28', 48), ( 4, '27', 62),
( 5, '25', 60), ( 6, '10', 52), ( 7, '21', 60), ( 8, '22', 62),
( 9, '20', 65), (10, '12', 52),
-- 삼성
(11, '10', 55), (12, '27', 65), (13, '24', 60), (14, '20', 68),
(15, '21', 58), (16, '25', 58), (17, '12', 52), (18, '11', 50),
(19, '22', 60), (20, '26', 68),
-- LG
(21, '10', 52), (22, '24', 65), (23, '26', 70), (24, '23', 62),
(25, '25', 62), (26, '21', 60), (27, '20', 65), (28, '12', 52),
(29, '11', 50), (30, '22', 62),
-- 두산
(31, '10', 52), (32, '21', 60), (33, '23', 62), (34, '22', 58),
(35, '26', 68), (36, '20', 62), (37, '11', 50), (38, '10', 52),
(39, '25', 56), (40, '27', 60),
-- KT
(41, '10', 55), (42, '21', 60), (43, '23', 60), (44, '24', 58),
(45, '27', 62), (46, '26', 65), (47, '10', 52), (48, '12', 52),
(49, '22', 58), (50, '20', 65),
-- SSG
(51, '10', 55), (52, '26', 68), (53, '27', 60), (54, '23', 62),
(55, '24', 62), (56, '22', 58), (57, '20', 62), (58, '11', 50),
(59, '10', 52), (60, '25', 62),
-- 롯데
(61, '22', 65), (62, '27', 60), (63, '23', 60), (64, '10', 52),
(65, '26', 68), (66, '24', 60), (67, '20', 65), (68, '12', 52),
(69, '25', 60), (70, '10', 50),
-- 한화
(71, '10', 55), (72, '21', 58), (73, '27', 60), (74, '24', 58),
(75, '22', 56), (76, '20', 65), (77, '11', 50), (78, '10', 52),
(79, '11', 50), (80, '24', 62),
-- NC
(81, '22', 65), (82, '25', 62), (83, '20', 70), (84, '10', 52),
(85, '26', 65), (86, '27', 58), (87, '10', 52), (88, '12', 52),
(89, '21', 58), (90, '23', 58),
-- 키움
( 91, '10', 52), ( 92, '26', 68), ( 93, '22', 65), ( 94, '23', 60),
( 95, '27', 58), ( 96, '20', 62), ( 97, '21', 60), ( 98, '11', 50),
( 99, '10', 52), (100, '24', 56);
