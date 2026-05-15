-- ==========================================
-- 11. 시설·경기장 증축 기능 초기 데이터
-- ==========================================

-- ===== CMN_CD: FCLTY_TYPE 코드 정의 =====
DELETE FROM CMN_CD WHERE CD_ID = 'FCLTY_TYPE';
INSERT INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('FCLTY_TYPE', 'TRNG', '훈련시설',       'Training Facility',          '1군 선수들의 능력치 상승 보정 폭 증가'),
('FCLTY_TYPE', 'YUTH', '유소년훈련시설', 'Youth Training Facility',    '2군 선수 및 22세 이하 선수의 능력치 상승 보정 폭 증가'),
('FCLTY_TYPE', 'ANLY', '데이터분석시설', 'Data Analytics Facility',    '스카우팅 정보의 정확도 보정'),
('FCLTY_TYPE', 'SCTG', '스카우터시설',   'Scouting Facility',          '스카우팅 범위 및 능력 보정'),
('FCLTY_TYPE', 'CAFE', '사내식당시설',   'Team Cafeteria',             '선수들의 컨디션 상승 보정 폭 증가');

-- ===== CMN_CD: STDM_EXPN_STTS 코드 정의 =====
DELETE FROM CMN_CD WHERE CD_ID = 'STDM_EXPN_STTS';
INSERT INTO CMN_CD (CD_ID, CD_VAL, CD_NM, CD_ENG_NM, CD_DESC) VALUES
('STDM_EXPN_STTS', 'PROG', '진행중', 'In Progress', '증축 공사 진행 중'),
('STDM_EXPN_STTS', 'CMPL', '완료',   'Completed',   '증축 완료. 좌석수 반영됨'),
('STDM_EXPN_STTS', 'CNCL', '취소',   'Cancelled',   '증축 취소');

-- ===== FCLTY_UPGR_COST_CFG 테이블 생성 =====
CREATE TABLE IF NOT EXISTS FCLTY_UPGR_COST_CFG (
    FCLTY_TYPE_CD VARCHAR(4) NOT NULL COMMENT '시설 종류코드',
    FROM_LVL      TINYINT    NOT NULL COMMENT '현재 레벨',
    TO_LVL        TINYINT    NOT NULL COMMENT '업그레이드 후 레벨 (항상 FROM_LVL+1)',
    UPGR_COST     BIGINT     NOT NULL COMMENT '업그레이드 비용 (만원)',
    UPGR_DAYS     INT        NOT NULL COMMENT '공사 기간 (일)',
    PRIMARY KEY (FCLTY_TYPE_CD, FROM_LVL)
);

-- 업그레이드 비용 데이터 (모든 시설 동일 기준)
DELETE FROM FCLTY_UPGR_COST_CFG;
INSERT INTO FCLTY_UPGR_COST_CFG (FCLTY_TYPE_CD, FROM_LVL, TO_LVL, UPGR_COST, UPGR_DAYS)
SELECT t.cd_val, lvl.from_lvl, lvl.from_lvl + 1, lvl.upgr_cost, lvl.upgr_days
FROM (SELECT CD_VAL AS cd_val FROM CMN_CD WHERE CD_ID = 'FCLTY_TYPE') t
CROSS JOIN (
    SELECT 1 AS from_lvl, 5000  AS upgr_cost, 30  AS upgr_days UNION ALL
    SELECT 2,              15000,              60               UNION ALL
    SELECT 3,              30000,              90               UNION ALL
    SELECT 4,              60000,              180
) lvl;

-- ===== STDM_EXPN 테이블 생성 =====
CREATE TABLE IF NOT EXISTS STDM_EXPN (
    EXPN_ID      BIGINT AUTO_INCREMENT NOT NULL COMMENT '증축ID',
    STDM_ID      BIGINT NOT NULL COMMENT '경기장ID',
    TM_ID        BIGINT NOT NULL COMMENT '팀ID',
    BFR_SEAT_CNT INT    NOT NULL COMMENT '증축 전 좌석수',
    AFT_SEAT_CNT INT    NOT NULL COMMENT '증축 후 좌석수',
    EXPN_COST    BIGINT NOT NULL COMMENT '증축 비용 (만원)',
    EXPN_BGNG_DT DATE   NOT NULL COMMENT '공사 시작일',
    EXPN_END_DT  DATE            COMMENT '완료 예정일',
    EXPN_STTS_CD VARCHAR(4) NOT NULL COMMENT '진행상태 (PROG/CMPL/CNCL)',
    PRIMARY KEY (EXPN_ID),
    CONSTRAINT FK_STDM_EXPN_STDM FOREIGN KEY (STDM_ID) REFERENCES STDM (STDM_ID),
    CONSTRAINT FK_STDM_EXPN_TM   FOREIGN KEY (TM_ID)   REFERENCES TM   (TM_ID)
);

-- ===== STDM_EXPN_COST_CFG 테이블 생성 =====
CREATE TABLE IF NOT EXISTS STDM_EXPN_COST_CFG (
    EXPN_STEP    TINYINT NOT NULL COMMENT '증축 단계 (반복 가능)',
    ADD_SEAT_CNT INT     NOT NULL COMMENT '증가 좌석수',
    EXPN_COST    BIGINT  NOT NULL COMMENT '증축 비용 (만원)',
    EXPN_DAYS    INT     NOT NULL COMMENT '공사 기간 (일)',
    EXPN_DESC    VARCHAR(200) COMMENT '설명',
    PRIMARY KEY (EXPN_STEP)
);

DELETE FROM STDM_EXPN_COST_CFG;
INSERT INTO STDM_EXPN_COST_CFG (EXPN_STEP, ADD_SEAT_CNT, EXPN_COST, EXPN_DAYS, EXPN_DESC) VALUES
(1, 3000,  30000,  180, '소규모 증축. 외야 좌석 추가'),
(2, 5000,  50000,  270, '중규모 증축. 내야 2층 확장'),
(3, 10000, 100000, 365, '대규모 증축. 전면 리모델링');

-- ===== TM_FCLTY 초기 데이터 (모든 팀 × 5종 시설, 레벨 1) =====
DELETE FROM TM_FCLTY;
INSERT INTO TM_FCLTY (TM_ID, FCLTY_TYPE_CD, FCLTY_LVL)
SELECT t.TM_ID, f.CD_VAL, 1
FROM TM t
CROSS JOIN CMN_CD f
WHERE f.CD_ID = 'FCLTY_TYPE';
