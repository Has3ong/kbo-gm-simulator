# KBO 단장 시뮬레이터 — 주석 규칙

> **원칙**: 필드명·컬럼명은 약어와 도메인 용어가 많아 의미를 즉시 파악하기 어렵다.
> 모든 DAO·DTO·Entity의 **모든 필드**에 한국어 인라인 주석을 필수로 작성한다.
> SQL에는 테이블명과 컬럼 그룹별 한국어 주석을 작성한다.

---

## 1. Java 필드 주석 규칙

### 형식

```java
private 타입 필드명;  // 한국어 설명 (단위·범위·코드값 등 필요 시 괄호 보충)
```

### 작성 기준

| 구분 | 작성 내용 |
|------|-----------|
| ID 필드 | `// 선수 ID`, `// 팀 ID` 등 |
| 코드 필드 | `// 계약 유형 코드 (FA: FA계약, RC: 재계약, NK: 신인)` |
| 날짜 필드 | `// FA 계약 시작일`, `// 게임 내 현재 날짜` |
| 금액 필드 | `// 연봉 (만원)` — 반드시 단위 명시 |
| 수치 필드 | `// 종합 능력치 (20~80 스케일, 50이 KBO 평균)` — 범위 명시 |
| 야구 통계 | `// 타율 = H / AB (소수 3자리)`, `// 투구 아웃카운트 (이닝 × 3)` |
| Y/N 필드 | `// 외국인 선수 여부 (Y/N)` |
| JOIN 컬럼 | `// 소속 팀 한국어 이름 (TM 테이블에서 JOIN)` |

### 예시 — DAO

```java
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PlrDao {
    private Long plrId;              // 선수 ID
    private String plrNm;            // 선수 한국어 이름
    private String plrEngNm;         // 선수 영어 이름
    private Integer plrHgt;          // 키 (cm)
    private Integer plrWgt;          // 몸무게 (kg)
    private String plrBatPtchHandCd; // 투타 코드 (RR: 우투우타, LL: 좌투좌타 등)
    private Long plrAnslSal;         // 연봉 (만원)
    private String plrNtnlt;         // 국적
    private String plrFrgnYn;        // 외국인 선수 여부 (Y/N)
    private String plrSttsCd;        // 선수 상태 코드 (AT: 활동, INJ: 부상, RET: 은퇴, FA: FA)
    private Integer plrOvrlAblt;     // 종합 능력치 (20~80 스케일)
    private Integer plrPotAblt;      // 잠재 능력치 — 선수 도달 가능한 최대 능력치, 불변
}
```

### 예시 — DTO Response

```java
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlrResponse {
    private Long plrId;              // 선수 ID
    private String plrNm;            // 선수 한국어 이름
    // ... 필드마다 DAO와 동일한 주석
}
```

> **DTO 필드 주석은 DAO 필드 주석과 동일하게** 작성한다.
> DAO → DTO 변환 관계이므로 의미가 같다.

---

## 2. MyBatis XML Mapper SQL 주석 규칙

### 쿼리 블록 구분

각 `<select>` / `<insert>` / `<update>` / `<delete>` 앞에 `<!-- ===== 설명 ===== -->` 블록 주석을 붙인다.

```xml
<!-- ===== 선수 전체 조회 ===== -->
<select id="findAll" resultType="...">
```

### SELECT 절 — 테이블·컬럼 그룹 주석

SELECT 절에서 테이블이 바뀌는 경계마다 한 줄 주석으로 출처를 표시한다.

```xml
SELECT
    -- PLR: 선수 기본 정보
    P.PLR_ID, P.PLR_NM, P.PLR_ENG_NM,
    P.PLR_OVRL_ABLT, P.PLR_POT_ABLT,
    -- TM: 소속 팀 (LEFT JOIN)
    T.TM_ID, T.TM_KR_NM, T.TM_SHRT_KR_NM,
    -- PLR_TM_CNTRCT: 현재 계약 포지션 (서브쿼리 PC)
    PC.REPR_POSN_CD,
    -- CMN_CD: 포지션 한국어 이름
    RC.CD_NM AS REPR_POSN_NM
```

### WHERE 절 — 조건 설명

복잡한 조건이나 의도가 불분명한 조건에 인라인 주석을 붙인다.

```xml
WHERE C.PLR_ID = #{plrId}
  AND (C.FA_CNTRCT_END_DT >= CURDATE()  -- 현재 유효한 계약만
       OR C.FA_CNTRCT_END_DT IS NULL)   -- 종료일 없는 계약(무기한) 포함
```

### CASE WHEN — 분기 설명

```xml
CASE
    WHEN A.ABLT_VAL >= 76 THEN 'S+'  -- 최상위 등급
    WHEN A.ABLT_VAL >= 71 THEN 'S'
    ...
    ELSE 'D'                          -- 최하위 등급
END AS ABLT_GRADE
```

### INSERT / UPDATE — 배치 작업

배치 INSERT에는 반복 구조 위에 의도를 설명한다.

```xml
<!-- ===== 팀별 시즌 초기 순위 일괄 등록 ===== -->
<!-- 시즌 시작 시 10개 팀 모두 0승 0패 0.000 으로 초기화 -->
<insert id="insertStndBatch">
    INSERT INTO STND (TM_ID, SSNT_YR, W, L, T, ...)
    VALUES
    <foreach collection="list" item="s" separator=",">
        (#{s.tmId}, #{s.ssntYr}, 0, 0, 0, ...)
    </foreach>
</insert>
```

### 전체 Mapper XML 예시

```xml
<mapper namespace="com.kbo.gm.domain.player.mapper.PlrMapper">

    <!-- ===== 선수 목록 조회 (팀·상태 필터 가능) ===== -->
    <select id="findAll" resultType="com.kbo.gm.domain.player.dao.PlrDao">
        SELECT
            -- PLR: 선수 기본 정보
            P.PLR_ID, P.PLR_NM, P.PLR_ENG_NM,
            P.PLR_HGT, P.PLR_WGT, P.PLR_BAT_PTCH_HAND_CD,
            P.PLR_ANSL_SAL, P.PLR_NTNLT, P.PLR_FRGN_YN,
            P.PLR_STTS_CD, P.PLR_OVRL_ABLT, P.PLR_POT_ABLT,
            -- TM: 소속 팀 (LEFT JOIN)
            T.TM_ID, T.TM_KR_NM, T.TM_SHRT_KR_NM,
            -- PC: 현재 계약 대표 포지션 (서브쿼리)
            PC.REPR_POSN_CD,
            -- RC: 포지션 한국어 이름 (CMN_CD)
            RC.CD_NM AS REPR_POSN_NM
        FROM PLR P
            LEFT JOIN TM T ON T.TM_ID = P.TM_ID
            LEFT JOIN (
                SELECT PLR_ID, REPR_POSN_CD
                FROM PLR_TM_CNTRCT
                WHERE FA_CNTRCT_END_DT >= CURDATE()  -- 현재 유효한 계약만
                   OR FA_CNTRCT_END_DT IS NULL
                GROUP BY PLR_ID
            ) PC ON PC.PLR_ID = P.PLR_ID
            LEFT JOIN CMN_CD RC ON RC.CD_ID = 'REPR_POSN' AND RC.CD_VAL = PC.REPR_POSN_CD
        <where>
            <if test="tmId != null">AND P.TM_ID = #{tmId}</if>
            <if test="plrSttsCd != null and plrSttsCd != ''">AND P.PLR_STTS_CD = #{plrSttsCd}</if>
        </where>
        ORDER BY P.TM_ID, P.PLR_ID
    </select>

</mapper>
```

---

## 3. 적용 범위 요약

| 파일 종류 | 주석 필수 여부 | 주석 위치 |
|-----------|--------------|-----------|
| `*Dao.java` | **필수** | 모든 필드 인라인 |
| `*Response.java` (DTO) | **필수** | 모든 필드 인라인 |
| `*Request.java` (DTO) | **필수** | 모든 필드 인라인 |
| `*Entity.java` | **필수** | 모든 필드 인라인 |
| `*Mapper.xml` | **필수** | 쿼리 블록 + SELECT 테이블 경계 + 복잡한 WHERE |
| `*Service.java` | 선택 | WHY가 불분명한 로직에만 |
| `*Controller.java` | 불필요 | 엔드포인트 설명은 API.md에 |

---

## 4. 작성 금지 사항

- **WHAT을 설명하는 주석** — `// 선수 ID를 가져온다` (메서드명으로 명백)
- **현재 태스크·이슈 번호 참조** — `// 이슈 #123 수정`, `// 시즌 시작 기능을 위해 추가`
- **다중 라인 블록 주석** — 필드 주석은 한 줄 `//` 형식만 사용
- **영어 주석** — 이 프로젝트는 팀 전체가 한국어를 사용하므로 필드 설명은 한국어로 작성
