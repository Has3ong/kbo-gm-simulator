-- ============================================================
-- V32: 선수 능력치 20-80 스케일 재조정
-- 문제: PLR_OVRL_ABLT > PLR_POT_ABLT 역전 현상 (~130명)
--       개인 능력치 고정값 오류 (예: CNT=80 일괄)
--       전체 분포가 지나치게 좁고 균일함
-- 목표: 20-80 스카우팅 스케일 기반 정규분포 재조정
-- ============================================================


-- ============================================================
-- Step 1: PLR_OVRL_ABLT > PLR_POT_ABLT 역전 사전 보정
-- OVRL 은 절대 POT 를 초과할 수 없음
-- ============================================================

UPDATE PLR
SET PLR_POT_ABLT = PLR_OVRL_ABLT + FLOOR(RAND() * 8 + 2)
WHERE PLR_OVRL_ABLT > PLR_POT_ABLT
  AND PLR_STTS_CD = 'AT';


-- ============================================================
-- Step 2: 활성 선수 PLR_OVRL_ABLT 를 백분위 기반 재분배
-- 현재 OVRL 순위를 이용해 20-80 스케일 정규분포로 매핑
-- ============================================================

DROP TEMPORARY TABLE IF EXISTS PLR_NEW_OVRL;

CREATE TEMPORARY TABLE PLR_NEW_OVRL AS
SELECT
    PLR_ID,
    PLR_OVRL_ABLT AS OLD_OVRL,
    CASE
        WHEN PERCENT_RANK() OVER (ORDER BY PLR_OVRL_ABLT) >= 0.990 THEN 76 + FLOOR(RAND() * 5)
        WHEN PERCENT_RANK() OVER (ORDER BY PLR_OVRL_ABLT) >= 0.975 THEN 72 + FLOOR(RAND() * 4)
        WHEN PERCENT_RANK() OVER (ORDER BY PLR_OVRL_ABLT) >= 0.935 THEN 68 + FLOOR(RAND() * 4)
        WHEN PERCENT_RANK() OVER (ORDER BY PLR_OVRL_ABLT) >= 0.870 THEN 64 + FLOOR(RAND() * 4)
        WHEN PERCENT_RANK() OVER (ORDER BY PLR_OVRL_ABLT) >= 0.775 THEN 60 + FLOOR(RAND() * 4)
        WHEN PERCENT_RANK() OVER (ORDER BY PLR_OVRL_ABLT) >= 0.630 THEN 56 + FLOOR(RAND() * 4)
        WHEN PERCENT_RANK() OVER (ORDER BY PLR_OVRL_ABLT) >= 0.475 THEN 52 + FLOOR(RAND() * 4)
        WHEN PERCENT_RANK() OVER (ORDER BY PLR_OVRL_ABLT) >= 0.320 THEN 48 + FLOOR(RAND() * 4)
        WHEN PERCENT_RANK() OVER (ORDER BY PLR_OVRL_ABLT) >= 0.195 THEN 44 + FLOOR(RAND() * 4)
        WHEN PERCENT_RANK() OVER (ORDER BY PLR_OVRL_ABLT) >= 0.100 THEN 38 + FLOOR(RAND() * 6)
        ELSE                                                              20 + FLOOR(RAND() * 8)
    END AS NEW_OVRL
FROM PLR
WHERE PLR_STTS_CD = 'AT';

-- OVRL 갱신
UPDATE PLR P
JOIN PLR_NEW_OVRL T ON P.PLR_ID = T.PLR_ID
SET P.PLR_OVRL_ABLT = T.NEW_OVRL;


-- ============================================================
-- Step 3: 개인 능력치(PLR_ABLT) 비례 재조정
-- 구 OVRL → 신 OVRL 비율로 각 항목 스케일 조정
-- ============================================================

-- OLD_OVRL > 20 인 선수: 비례 변환
UPDATE PLR_ABLT A
JOIN PLR_NEW_OVRL T ON A.PLR_ID = T.PLR_ID
SET A.ABLT_VAL = GREATEST(20, LEAST(80,
    ROUND(20 + (A.ABLT_VAL - 20) * (T.NEW_OVRL - 20.0) / GREATEST(1, T.OLD_OVRL - 20.0))
))
WHERE T.OLD_OVRL > 20;

-- 투수 구속(VEL) 상한 캡: 현실적 구속 범위 반영 (최대 77)
UPDATE PLR_ABLT
SET ABLT_VAL = LEAST(77, ABLT_VAL)
WHERE ABLT_CD = 'VEL';


-- ============================================================
-- Step 4: PLR_POT_ABLT 재보정 (신 OVRL 기준)
-- POT 는 반드시 OVRL 이상, 최대 80
-- ============================================================

-- POT < OVRL 인 경우 재조정
UPDATE PLR
SET PLR_POT_ABLT = PLR_OVRL_ABLT + FLOOR(RAND() * 15 + 3)
WHERE PLR_POT_ABLT < PLR_OVRL_ABLT
  AND PLR_STTS_CD = 'AT';

-- POT 상한 캡 80
UPDATE PLR
SET PLR_POT_ABLT = LEAST(80, PLR_POT_ABLT)
WHERE PLR_STTS_CD = 'AT';

-- 최정상 선수(OVRL >= 72): 성장 여지 확보를 위해 POT 재설정
UPDATE PLR
SET PLR_POT_ABLT = LEAST(80, PLR_OVRL_ABLT + FLOOR(RAND() * 8 + 2))
WHERE PLR_OVRL_ABLT >= 72
  AND PLR_STTS_CD = 'AT';


-- ============================================================
-- Step 5: PLR_ABLT_SSNT 시즌 스냅샷 동기화
-- 현재 시즌의 스냅샷을 갱신된 PLR_ABLT 값으로 동기화
-- ============================================================

UPDATE PLR_ABLT_SSNT S
JOIN PLR_ABLT A ON A.PLR_ID = S.PLR_ID AND A.ABLT_CD = S.ABLT_CD
SET S.ABLT_VAL = A.ABLT_VAL
WHERE S.SSNT_YR = (SELECT MAX(SSNT_YR) FROM SSNT);


-- ============================================================
-- Step 6: 임시 테이블 정리
-- ============================================================

DROP TEMPORARY TABLE IF EXISTS PLR_NEW_OVRL;
