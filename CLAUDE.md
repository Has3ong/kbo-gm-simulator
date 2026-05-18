# KBO 단장 시뮬레이터

## 프로젝트 개요
KBO(한국 프로 야구) 단장이 되어 팀을 운영하는 웹 기반 시뮬레이션 게임.
단일 사용자용으로 인증/인가 기능 없음.

## 기술 스택

### Backend
- **Java 17** + **Spring Boot 3.2.5**
- **MyBatis 3** (Spring Boot Starter) — SQL 매퍼
- **MariaDB** (Docker 컨테이너, 포트 3306, DB명: KBO)
- **Flyway** — DB 마이그레이션
- **Lombok** (필수 - 모든 DTO/Entity에 사용)
- 포트: **8080**

### Frontend
- **React 18** + **TypeScript**
- **Vite** (포트 5173)
- **TanStack Query v5** (필수 - 모든 API 호출에 사용)
- **Material UI (MUI v9)** — UI 컴포넌트 프레임워크
- **React Router v6**
- **Axios**

## 개발 규칙

### Backend
- 모든 DTO·Entity에 Lombok 어노테이션 필수 (`@Getter`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`)
- API 응답은 공통 `ApiResponse<T>` 래퍼 사용
- 패키지 기준: `com.kbo.gm`
- Controller → Service → Mapper (MyBatis) 단방향 의존
- DB 구조 변경 시 `Schema.md` 먼저 수정 후 Flyway SQL 추가

### Frontend
- 모든 서버 상태는 TanStack Query로 관리
- API 호출 함수는 `src/api/` 에 분리, 훅은 `src/hooks/` 에 분리
- UI 컴포넌트는 MUI 우선 사용, 인라인 스타일 대신 `sx` prop 사용
- 페이지는 `XxxPage.tsx` (렌더링) + `XxxPageHooks.ts` (로직) 로 분리

## API 기본 URL
- 개발: `http://localhost:8080/api`

---

## 문서 구조

| 파일 | 역할 |
|------|------|
| `CLAUDE.md` | 프로젝트 개요, 기술 스택, 개발 규칙, 문서 안내 (이 파일) |
| `docs/FRONTEND.md` | 프론트엔드 디렉터리 구조, 기술 스택, 개발 규칙 상세 |
| `docs/BACKEND.md` | 백엔드 디렉터리 구조, MyBatis/DB 설정, 레이어 구조 상세 |
| `docs/API.md` | 전체 API 엔드포인트 목록 및 업무 로직 설명 |
| `docs/Schema.md` | DB 스키마 전체 정의 — 테이블 목록, 컬럼 명세, 코드그룹, 참조 관계 |
| `docs/DATA.md` | 초기 투입 데이터 — 코드값, 구단/구장 기본 정보, 스탯 기준 수치 |
| `docs/FEATURE.md` | 게임 기능 — 유저가 조작·확인하는 기능 목록 (시즌 진행, 로스터, 계약, 재정 등) |
| `docs/Rule.md` | 내부 게임 규칙 — 경기 시뮬레이션 공식, 선수 성장·부상 계산, 재정·팬덤 수치 |
| `docs/SQL_STYLE.md` | SQL 작성 규칙 — MyBatis XML Mapper SQL 포맷 (SELECT/FROM/JOIN/WHERE 표기법, 주석 규칙) |
| `docs/COMMENT_STYLE.md` | 주석 규칙 — DAO·DTO·Entity 필드 인라인 주석 형식, Mapper XML 주석 위치 기준 |
| `docs/FORMAT.md` | 표기 규칙 — 금액(만원·억원) 표기 방식, 백엔드 `GameUtil.fmtMan()` / 프론트 `formatSalary()` |
| `docs/SEASON_START.md` | 시즌 시작 14단계 프로세스 — 각 단계 상세 설명, 관련 테이블, 개선 사항 |
| `docs/PRE_SEASON.md` | 프리시즌 5단계 필수 이벤트 — 방송국→감독·코치→외국인→스프링캠프→로스터 확정 흐름 |
| `docs/MONTHLY_EVENT.md` | 월간 정산 6단계 프로세스 — 트리거 조건, 집계 방식, 만족도·재정 로직 |
| `docs/WEEKLY_EVENT.md` | 주간 처리 10단계 프로세스 — 월요일 자동 실행, 피로도 회복·부상 갱신·주간 리포트 |
| `docs/GAME_RESULT.md` | 경기 결과 처리 8단계 파이프라인 — 경기 후 기록·순위·피로도·재정 반영 흐름 |
| `docs/REQUIRED_EVENT.md` | 필수 이벤트 게이트 — 날짜 진행(진행하기) 전 완료 필요 조건 목록 및 UI 동작 규칙 |
| `docs/SEASON_END.md` | 시즌 종료 처리 흐름 — 14단계 프로세스, 시설 노후화, FA 전환 등 |
| `docs/PROPENSITY.md` | 구단주/팬 성향 시스템 — 25개 구단주 성향 + 32개 팬 성향 필드 명세, API 엔드포인트 |

> **수정 원칙**
> - DB 구조 변경 → `docs/Schema.md` 먼저 수정, 이후 Flyway SQL·Java 반영
> - 유저 기능 추가/변경 → `docs/FEATURE.md` 수정
> - 내부 게임 공식·수치 변경 → `docs/Rule.md` 수정
> - 코드값·초기 데이터 추가 → `docs/DATA.md` 수정
> - API 추가/변경 → `docs/API.md` 수정
> - 프론트엔드 구조 변경 → `docs/FRONTEND.md` 수정
> - 백엔드 구조 변경 → `docs/BACKEND.md` 수정
