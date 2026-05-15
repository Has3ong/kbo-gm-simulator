# SQL 작성 규칙

MyBatis XML Mapper 파일에 작성되는 SQL의 표기 규칙을 정의한다.

---

## 1. SELECT 절

### 1.1 컬럼 나열

첫 번째 컬럼은 `SELECT` 키워드와 같은 줄에 작성한다.
두 번째 컬럼부터는 **쉼표를 앞**에 붙여 새 줄에 작성한다 (comma-first).
블록 주석 `/* */` 으로 전체 컬럼 목록과 FROM·JOIN 구조를 감싸고,
각 컬럼과 테이블 옆에 한국어 설명을 작성한다.

```sql
SELECT T.COL1 /* 컬럼1 설명
     , T.COL2    컬럼2 설명
     , T.COL3    컬럼3 설명
  FROM TABLE_NAME T  테이블 한국어명
*/
```

### 1.2 CASE WHEN

각 절(WHEN/ELSE/END)을 줄 바꿈하여 작성한다.
`THEN`과 `ELSE` 뒤의 값은 같은 줄에 위치시키고,
`END AS 별칭`도 별도 줄에 작성한다.

```sql
     , CASE WHEN 조건 THEN 결과값
             ELSE 기본값
             END AS 컬럼별칭    컬럼 설명
```

---

## 2. FROM / JOIN 절

### 2.1 FROM

`FROM` 키워드와 테이블명은 같은 줄에 작성하며,
테이블 별칭(alias) 옆에 테이블 한국어명을 주석으로 표시한다.

```sql
  FROM 테이블명 별칭  테이블 한국어명
```

### 2.2 JOIN / LEFT JOIN

`JOIN`과 테이블명은 같은 줄에 작성하고,
`ON` 조건은 다음 줄에 3칸 들여쓰기하여 작성한다.

```sql
  JOIN 테이블명 별칭  테이블 한국어명
    ON 별칭.KEY = 기준테이블.KEY
  LEFT JOIN 테이블명 별칭  테이블 한국어명
    ON 별칭.KEY = 기준테이블.KEY
```

### 2.3 서브쿼리

서브쿼리는 괄호 안에 같은 SELECT 포맷 규칙으로 작성하고,
컬럼은 들여쓰기로 정렬한다.
닫는 괄호 바로 뒤에 별칭과 `ON` 조건을 작성한다.

```sql
  LEFT JOIN ( SELECT COL1
                   , COL2
                FROM 테이블명
               GROUP BY COL1
            ) 별칭 ON 별칭.COL1 = T.COL1
```

---

## 3. WHERE 절 (MyBatis 동적 SQL)

`<where>` 태그를 사용하고, 각 조건은 `AND`를 앞에 붙인다.
선택적 조건은 `<if test="...">` 태그로 감싼다.

```xml
<where>
    <if test="param != null">AND COLUMN = #{param}</if>
    <if test="param2 != null">AND COLUMN2 = #{param2}</if>
</where>
```

---

## 4. ORDER BY

`ORDER BY`는 블록 주석 밖, `<where>` 이후에 작성한다.

```sql
ORDER BY 컬럼 ASC, 컬럼2 DESC
```

---

## 5. 전체 예시

```sql
SELECT R.PLR_ID /* 선수 ID
     , P.PLR_NM             선수 이름
     , R.SSNT_YR            시즌 연도
     , T.TM_ID              팀 ID
     , T.TM_KR_NM           팀 한국어 이름
     , R.IP_OUT             투구 아웃카운트 (3 = 1이닝)
     , R.BF                 상대 타자 수
     , R.H                  피안타
     , R.DOBL               피2루타
     , R.TRPL               피3루타
     , R.HR                 피홈런
     , R.R                  실점
     , R.ER                 자책점
     , R.BB                 볼넷
     , R.IBB                고의사구
     , R.SO                 탈삼진
     , R.HBP                사구
     , R.W                  승
     , R.L                  패
     , R.SV                 세이브
     , R.HLD                홀드
     , R.BSV                블론세이브
     , R.CG                 완투
     , R.SHO                완봉
     , R.PITCHES            총 투구수
     , CASE WHEN R.IP_OUT > 0 THEN ROUND(R.ER * 27.0 / R.IP_OUT, 2)
             ELSE 0
             END AS ERA     평균자책점
     , CASE WHEN R.IP_OUT > 0 THEN ROUND((R.BB + R.H) * 3.0 / R.IP_OUT, 2)
             ELSE 0
             END AS WHIP    이닝당 출루허용
     , CASE WHEN R.IP_OUT > 0 THEN ROUND(R.SO * 27.0 / R.IP_OUT, 2)
             ELSE 0
             END AS K_PER9  9이닝당 탈삼진
     , CASE WHEN R.IP_OUT > 0 THEN ROUND(R.BB * 27.0 / R.IP_OUT, 2)
             ELSE 0
             END AS BB_PER9 9이닝당 볼넷
  FROM PLR_PTCH_SSNT_REC R  선수 투수 시즌 기록
  JOIN PLR P                선수 기본정보
    ON P.PLR_ID = R.PLR_ID
  LEFT JOIN ( SELECT PLR_ID
                   , MIN(TM_ID) AS TM_ID
                FROM PLR_PTCH_TM_SSNT_REC
               GROUP BY PLR_ID
            ) PT ON PT.PLR_ID = R.PLR_ID
  LEFT JOIN TM T            팀 기본정보
    ON T.TM_ID = PT.TM_ID
*/
<where>
    <if test="ssntYr != null">AND R.SSNT_YR = #{ssntYr}</if>
    <if test="tmId != null">AND PT.TM_ID = #{tmId}</if>
</where>
ORDER BY ERA ASC, R.W DESC
```

---

## 6. 요약 체크리스트

| 항목 | 규칙 |
|------|------|
| SELECT 첫 컬럼 | `SELECT` 키워드와 같은 줄 |
| 나머지 컬럼 | 블록 주석 `/* */` 안에 `, 컬럼` (쉼표-앞) |
| 컬럼 설명 | 컬럼 옆 빈칸 후 한국어 설명 |
| CASE WHEN | WHEN/ELSE/END 각 줄 분리 |
| FROM | `FROM 테이블 별칭  한국어명` |
| JOIN ON | JOIN 다음 줄에 `   ON 조건` (3칸 들여쓰기) |
| 서브쿼리 | 괄호 안 동일 포맷, 들여쓰기로 정렬 |
| WHERE | `<where>` + `<if>` 태그, `AND` 앞 배치 |
| ORDER BY | 블록 주석 밖, WHERE 이후 |
