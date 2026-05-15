# 표기 규칙 (Format Rules)

> 화면에 표시되는 금액·숫자의 표기 방식을 정의한다.  
> 백엔드(Java)와 프론트엔드(TypeScript) 모두 동일한 규칙을 따른다.

---

## 1. 금액 표기 (만원 단위)

### 규칙

| 조건 | 표기 형식 | 예시 |
|------|----------|------|
| 1억 미만 (`< 10,000만`) | `X,XXX만원` | `3,000만원`, `500만원` |
| 1억 이상, 1만 단위 딱 떨어짐 | `X억원` | `10억원`, `3억원` |
| 1억 이상, 나머지 있음 | `X억 X,XXX만원` | `15억 3,000만원`, `2억 500만원` |

### 승리 수당 등 단위가 붙는 경우

`X,XXX만원/승`, `X억원/승` 처럼 단위를 금액 뒤에 붙인다.

---

## 2. 구현체

### 백엔드 — `GameUtil.fmtMan(long manAmt)`

```java
// com.kbo.gm.common.util.GameUtil
public static String fmtMan(long manAmt) {
    if (manAmt >= 10000) {
        long eok = manAmt / 10000;
        long man = manAmt % 10000;
        if (man == 0) return eok + "억원";
        return String.format("%d억 %,d만원", eok, man);
    }
    return String.format("%,d만원", manAmt);
}
```

| 입력 | 출력 |
|------|------|
| `500` | `500만원` |
| `3000` | `3,000만원` |
| `10000` | `1억원` |
| `15300` | `1억 5,300만원` |
| `100000` | `10억원` |
| `153000` | `15억 3,000만원` |

### 프론트엔드 — `formatSalary(val)` (`src/utils/format.ts`)

```ts
formatSalary(val: number | null): { display: string; tooltip: string }
```

| 조건 | display | tooltip |
|------|---------|---------|
| `null` | `—` | `—` |
| `< 10,000` | `X,XXX만` | `X,XXX만` |
| `>= 10,000` | `X.X억` (반올림, 소수점 1자리) | `X억 X,XXX만` (정확한 값) |

> **display vs tooltip 차이**  
> - `display`: UI 공간이 좁은 곳(카드, 테이블 셀)에 사용. 1억 이상은 반올림한 소수점 표기.  
> - `tooltip`: 마우스 오버 시 정확한 금액을 보여주거나, 텍스트 이벤트 내용처럼 공간 제약이 없는 곳에 사용.

| 입력 | display | tooltip |
|------|---------|---------|
| `3000` | `3,000만` | `3,000만` |
| `10000` | `1.0억` | `1억` |
| `15300` | `1.5억` | `1억 5,300만` |
| `100000` | `10.0억` | `10억` |
| `153000` | `15.3억` | `15억 3,000만` |

---

## 3. 사용 위치 규칙

| 위치 | 사용 함수 | 표기 모드 |
|------|----------|-----------|
| 백엔드 이벤트 텍스트 (`EVNT_CNTS`) | `GameUtil.fmtMan()` | 정확한 값 |
| 백엔드 HTML 이벤트 테이블 | `GameUtil.fmtMan()` | 정확한 값 |
| 프론트엔드 카드 · 테이블 셀 | `formatSalary().display` | 반올림 표기 |
| 프론트엔드 툴팁 · 다이얼로그 본문 | `formatSalary().tooltip` | 정확한 값 |
| 프론트엔드 확정 다이얼로그 금액 | `formatSalary().display` | 반올림 표기 |

---

## 4. 적용된 곳

| 파일 | 내용 |
|------|------|
| `GameUtil.java` | `fmtMan()` 공통 유틸 메서드 |
| `BrdcstSpnsrService.java` | 방송국 계약 체결 이벤트 텍스트 금액 |
| `GameStartService.java` | 방송국 선택 HTML 이벤트 테이블 금액 |
| `src/utils/format.ts` | `formatSalary()` 프론트엔드 유틸 |
| `SeasonPage.tsx` | 방송국 선택 카드 금액 표시 |
| `StaffHireModal.tsx` | 감독·코치 계약금·연봉 표시 |
