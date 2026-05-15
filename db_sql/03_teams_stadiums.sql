-- =====================================================
-- 구장·구단·방송국 초기 데이터
-- 출처: V6, V13, V23
-- =====================================================

-- KBO 9개 구장 (STDM_ID 1~9)
INSERT INTO STDM (STDM_ID, STDM_KR_NM, STDM_ENG_NM, STDM_SHRT_KR_NM, STDM_SHRT_ENG_NM, STDM_LOC, STDM_ESTBLSH_DT, STDM_SEAT_CNT, LF_DIST, LCF_DIST, CF_DIST, RCF_DIST, RF_DIST, FENCE_HGT, TURF_TYPE_CD) VALUES
(1, '광주-기아 챔피언스 필드', 'Gwangju-KIA Champions Field', '챔피언스 필드', 'Champions Field',
    '광주광역시 북구 서림로 10',               '2014-03-01', 20000,  99, 118, 125, 118,  99, 4.6, 'NT'),
(2, '대구삼성라이온즈파크',    'Daegu Samsung Lions Park',   '라이온즈파크',  'Lions Park',
    '대구광역시 수성구 야구전설로 1',            '2016-03-01', 24000, 100, 120, 122, 120, 100, 4.2, 'NT'),
(3, '잠실야구장',              'Jamsil Baseball Stadium',    '잠실',          'Jamsil',
    '서울특별시 송파구 올림픽로 25',             '1982-07-15', 25000, 100, 115, 123, 115, 100, 4.0, 'NT'),
(4, '수원KT위즈파크',          'Suwon KT Wiz Park',          'KT위즈파크',    'KT Wiz Park',
    '경기도 수원시 장안구 경수대로 893',          '1982-04-01', 20000, 100, 119, 121, 119, 100, 4.2, 'AT'),
(5, 'SSG랜더스필드',           'SSG Landers Field',           '랜더스필드',    'Landers Field',
    '인천광역시 미추홀구 매소홀로 618',           '2002-04-06', 23000, 100, 118, 122, 118, 100, 4.2, 'AT'),
(6, '사직야구장',              'Sajik Baseball Stadium',      '사직',          'Sajik',
    '부산광역시 동래구 사직로 45',               '1985-03-01', 24000,  98, 116, 118, 116,  98, 4.5, 'NT'),
(7, '한화생명이글스파크',       'Hanwha Life Eagles Park',    '이글스파크',    'Eagles Park',
    '대전광역시 중구 대종로 373',                '1964-04-01', 13000,  95, 113, 121, 113,  95, 4.5, 'AT'),
(8, '창원NC파크',              'Changwon NC Park',            'NC파크',        'NC Park',
    '경상남도 창원시 마산회원구 삼호로 63',       '2019-04-12', 22000, 100, 120, 122, 120, 100, 4.2, 'NT'),
(9, '고척스카이돔',            'Gocheok Sky Dome',            '고척돔',        'Gocheok Dome',
    '서울특별시 구로구 경인로 430',               '2015-09-15', 17000,  99, 116, 122, 116,  99, 4.2, 'AT');

-- KBO 10개 구단 (TM_ID 1~10)
INSERT INTO TM (TM_ID, TM_KR_NM, TM_ENG_NM, TM_SHRT_KR_NM, TM_SHRT_ENG_NM, TM_ESTBLSH_DT, CITY_CD, STDM_ID) VALUES
( 1, 'KIA 타이거즈',  'KIA Tigers',     'KIA',  'KIA',  '1982-01-10', 'GJU', 1),
( 2, '삼성 라이온즈', 'Samsung Lions',  '삼성', 'SS',   '1982-01-10', 'DGU', 2),
( 3, 'LG 트윈스',    'LG Twins',       'LG',   'LG',   '1990-01-10', 'SEL', 3),
( 4, '두산 베어스',   'Doosan Bears',   '두산', 'OB',   '1982-01-10', 'SEL', 3),
( 5, 'KT 위즈',      'KT Wiz',         'KT',   'KT',   '2013-01-10', 'SWN', 4),
( 6, 'SSG 랜더스',   'SSG Landers',    'SSG',  'SSG',  '2000-01-10', 'ICN', 5),
( 7, '롯데 자이언츠', 'Lotte Giants',   '롯데', 'LT',   '1975-03-04', 'BSN', 6),
( 8, '한화 이글스',   'Hanwha Eagles',  '한화', 'HH',   '1986-01-10', 'DJN', 7),
( 9, 'NC 다이노스',   'NC Dinos',       'NC',   'NC',   '2011-09-09', 'CWN', 8),
(10, '키움 히어로즈', 'Kiwoom Heroes',  '키움', 'WO',   '2008-01-10', 'SEL', 9);

-- TM_STDM 팀-경기장 관계 (잠실: LG·두산 공동 사용)
INSERT INTO TM_STDM (TM_ID, STDM_ID, STDM_USE_DT, STDM_END_DT) VALUES
( 1, 1, '2014-03-01', NULL),
( 2, 2, '2016-03-01', NULL),
( 3, 3, '1982-07-15', NULL),
( 4, 3, '1982-07-15', NULL),
( 5, 4, '1982-04-01', NULL),
( 6, 5, '2002-04-06', NULL),
( 7, 6, '1985-03-01', NULL),
( 8, 7, '1964-04-01', NULL),
( 9, 8, '2019-04-12', NULL),
(10, 9, '2015-09-15', NULL);

-- TM_HIST 초기 이력
INSERT INTO TM_HIST (TM_ID, HIST_SEQ, HIST_DT, TM_KR_NM, TM_ENG_NM, TM_SHRT_KR_NM, TM_SHRT_ENG_NM, CITY_CD, STDM_ID) VALUES
( 1, 1, '2025-01-01', 'KIA 타이거즈',  'KIA Tigers',       'KIA',  'KIA', 'GJU', 1),
( 2, 1, '2025-01-01', '삼성 라이온즈', 'Samsung Lions',    '삼성', 'SS',  'DGU', 2),
( 3, 1, '2025-01-01', 'LG 트윈스',     'LG Twins',         'LG',   'LG',  'SEL', 3),
( 4, 1, '2025-01-01', '두산 베어스',   'Doosan Bears',     '두산', 'OB',  'SEL', 3),
( 5, 1, '2025-01-01', 'KT 위즈',       'KT Wiz',           'KT',   'KT',  'SWN', 4),
( 6, 1, '2025-01-01', 'SSG 랜더스',    'SSG Landers',      'SSG',  'SSG', 'ICN', 5),
( 7, 1, '2025-01-01', '롯데 자이언츠', 'Lotte Giants',     '롯데', 'LT',  'BSN', 6),
( 8, 1, '2025-01-01', '한화 이글스',   'Hanwha Eagles',    '한화', 'HH',  'DJN', 7),
( 9, 1, '2025-01-01', 'NC 다이노스',   'NC Dinos',         'NC',   'NC',  'CWN', 8),
(10, 1, '2025-01-01', '키움 히어로즈', 'Kiwoom Heroes',    '키움', 'WO',  'SEL', 9);

-- 방송국 스폰서 계약 옵션
-- 계약금 단위: 만원 (1000000 = 100억) / WIN_BONUS 단위: 만원/승 / POST_BONUS·KS_BONUS 단위: 만원
INSERT INTO BRDCST_SPNSR (BRDCST_CD, BRDCST_NM, CNTRCT_FEE, WIN_BONUS, POST_BONUS, KS_BONUS) VALUES
('SBS', 'SBS',  1000000,   100,  10000,  50000),  -- 안정형: 계약금 최고, 수당 최저
('KBS', 'KBS',   600000,   600,  50000, 150000),  -- 균형형
('MBC', 'MBC',   200000,  1500, 120000, 300000)   -- 도전형: 계약금 최저, 수당 최고
ON DUPLICATE KEY UPDATE
    CNTRCT_FEE = VALUES(CNTRCT_FEE),
    WIN_BONUS  = VALUES(WIN_BONUS),
    POST_BONUS = VALUES(POST_BONUS),
    KS_BONUS   = VALUES(KS_BONUS);
