-- =====================================================
-- 2026 시즌 초기화
-- PLR_ID 1-100: 기존 KBO 선수 상태·엔트리·컨디션 초기화
-- 팀 이동 선수 반영 (이전 소속 종료: 2025-11-30 / 새 소속: 2026-01-15)
-- =====================================================

-- ─── PLR_ID 1-100: PLR_STTS_CD 초기화 ───────────────────────────────────────
-- 초기 데이터(04_players.sql)에는 PLR_STTS_CD 없이 삽입됐으므로 여기서 세팅
UPDATE PLR
   SET PLR_STTS_CD = 'AT'
 WHERE PLR_ID BETWEEN 1 AND 100
   AND PLR_STTS_CD IS NULL;

-- ─── PLR_ID 1-100: 피로도·컨디션 초기화 ─────────────────────────────────────
INSERT IGNORE INTO PLR_FATG_COND (PLR_ID, SSNT_YR, FATG, COND)
SELECT PLR_ID, 2026, 30, 70
  FROM PLR
 WHERE PLR_ID BETWEEN 1 AND 100;

-- ─── PLR_ID 1-100: 2026 시즌 엔트리 초기화 (2군) ────────────────────────────
INSERT IGNORE INTO PLR_ENTY (PLR_ID, SSNT_YR, TM_ID, ENTY_LVL_CD, ENTY_DT)
SELECT p.PLR_ID, 2026, p.TM_ID, '2', '2026-01-15'
  FROM PLR p
 WHERE p.PLR_ID BETWEEN 1 AND 100
   AND p.TM_ID IS NOT NULL;

-- ─── PLR.TM_ID 현재팀 업데이트 ───────────────────────────────────────────────
UPDATE PLR SET TM_ID = 2 WHERE PLR_ID = 3;   -- 최형우: KIA → 삼성
UPDATE PLR SET TM_ID = 5 WHERE PLR_ID = 33;  -- 허경민: 두산 → KT
UPDATE PLR SET TM_ID = 2 WHERE PLR_ID = 36;  -- 박계범: 두산 → 삼성
UPDATE PLR SET TM_ID = 9 WHERE PLR_ID = 40;  -- 권희동: 두산 → NC
UPDATE PLR SET TM_ID = 8 WHERE PLR_ID = 42;  -- 강백호: KT → 한화
UPDATE PLR SET TM_ID = 3 WHERE PLR_ID = 44;  -- 천성호: KT → LG
UPDATE PLR SET TM_ID = 2 WHERE PLR_ID = 48;  -- 김재윤: KT → 삼성
UPDATE PLR SET TM_ID = 3 WHERE PLR_ID = 57;  -- 이재원: SSG → LG
UPDATE PLR SET TM_ID = 10 WHERE PLR_ID = 61; -- 안치홍: 롯데 → 키움
UPDATE PLR SET TM_ID = 4 WHERE PLR_ID = 82;  -- 손아섭: NC → 두산
UPDATE PLR SET TM_ID = 4 WHERE PLR_ID = 83;  -- 양의지: NC → 두산
UPDATE PLR SET TM_ID = 8 WHERE PLR_ID = 95;  -- 이원석: 키움 → 한화
UPDATE PLR SET TM_ID = 6 WHERE PLR_ID = 96;  -- 이지영: 키움 → SSG
UPDATE PLR SET TM_ID = 6 WHERE PLR_ID = 172; -- 김재환: 두산 → SSG
UPDATE PLR SET TM_ID = 5 WHERE PLR_ID = 282; -- 한승혁: 한화 → KT
UPDATE PLR SET TM_ID = 5 WHERE PLR_ID = 290; -- 최원준: NC → KT

-- ─── PLR_TM 이전 소속 종료 ───────────────────────────────────────────────────
UPDATE PLR_TM SET TM_END_DT = '2025-11-30'
WHERE (PLR_ID, TM_ID) IN (
    ( 3,   1),  -- 최형우 KIA
    (33,   4),  -- 허경민 두산
    (36,   4),  -- 박계범 두산
    (40,   4),  -- 권희동 두산
    (42,   5),  -- 강백호 KT
    (44,   5),  -- 천성호 KT
    (48,   5),  -- 김재윤 KT
    (57,   6),  -- 이재원 SSG
    (61,   7),  -- 안치홍 롯데
    (82,   9),  -- 손아섭 NC
    (83,   9),  -- 양의지 NC
    (95,  10),  -- 이원석 키움
    (96,  10),  -- 이지영 키움
    (172,  4),  -- 김재환 두산
    (282,  8),  -- 한승혁 한화
    (290,  9)   -- 최원준 NC
)
AND TM_END_DT IS NULL;

-- ─── PLR_TM 새 소속 추가 ─────────────────────────────────────────────────────
INSERT INTO PLR_TM (PLR_ID, TM_ID, TM_BGNG_DT, TM_END_DT) VALUES
( 3,   2, '2026-01-15', NULL),  -- 최형우 → 삼성
(33,   5, '2026-01-15', NULL),  -- 허경민 → KT
(36,   2, '2026-01-15', NULL),  -- 박계범 → 삼성
(40,   9, '2026-01-15', NULL),  -- 권희동 → NC
(42,   8, '2026-01-15', NULL),  -- 강백호 → 한화
(44,   3, '2026-01-15', NULL),  -- 천성호 → LG
(48,   2, '2026-01-15', NULL),  -- 김재윤 → 삼성
(57,   3, '2026-01-15', NULL),  -- 이재원 → LG
(61,  10, '2026-01-15', NULL),  -- 안치홍 → 키움
(82,   4, '2026-01-15', NULL),  -- 손아섭 → 두산
(83,   4, '2026-01-15', NULL),  -- 양의지 → 두산
(95,   8, '2026-01-15', NULL),  -- 이원석 → 한화
(96,   6, '2026-01-15', NULL),  -- 이지영 → SSG
(172,  6, '2026-01-15', NULL),  -- 김재환 → SSG
(282,  5, '2026-01-15', NULL),  -- 한승혁 → KT
(290,  5, '2026-01-15', NULL);  -- 최원준 → KT
