# Frontend 구조

## 기술 스택
- **React 18** + **TypeScript**
- **Vite** (번들러, 포트 5173)
- **TanStack Query v5** — 모든 서버 상태 관리
- **React Router v6** — 클라이언트 사이드 라우팅
- **Axios** — HTTP 클라이언트
- **Material UI (MUI v9)** — UI 컴포넌트 / CSS 프레임워크
- **Emotion** — MUI 스타일 엔진

## 디렉터리 구조

```
frontend/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── main.tsx              # 진입점 — QueryClient, ThemeProvider, BrowserRouter 설정
    ├── App.tsx               # 라우트 정의 + MUI AppBar 네비게이션
    │
    ├── api/                  # Axios 호출 함수 (도메인별 분리)
    │   ├── client.ts         # Axios 인스턴스 (baseURL: http://localhost:8080/api)
    │   ├── teamApi.ts
    │   ├── playerApi.ts
    │   ├── seasonApi.ts
    │   ├── staffApi.ts
    │   ├── gameApi.ts
    │   └── recordApi.ts
    │
    ├── hooks/                # TanStack Query 커스텀 훅 (도메인별 분리)
    │   ├── useTeams.ts
    │   ├── usePlayers.ts
    │   ├── useSeasons.ts     # useSeasons / useSeason / useStandings / useSeasonEvents
    │   ├── useStaffs.ts
    │   ├── useGames.ts
    │   └── useRecords.ts
    │
    ├── pages/                # 페이지 컴포넌트 (Page + Hooks 분리 패턴)
    │   ├── team/
    │   │   ├── TeamsPage.tsx
    │   │   ├── TeamsPageHooks.ts
    │   │   ├── TeamDetailPage.tsx
    │   │   └── TeamDetailPageHooks.ts
    │   ├── player/
    │   │   ├── PlayersPage.tsx
    │   │   ├── PlayersPageHooks.ts
    │   │   ├── PlayerDetailPage.tsx
    │   │   └── PlayerDetailPageHooks.ts
    │   ├── roster/
    │   │   ├── RosterPage.tsx
    │   │   └── RosterPageHooks.ts
    │   ├── standings/
    │   │   ├── StandingsPage.tsx
    │   │   └── StandingsPageHooks.ts
    │   ├── season/
    │   │   ├── SeasonPage.tsx
    │   │   └── SeasonPageHooks.ts
    │   └── staff/
    │       ├── StaffPage.tsx
    │       └── StaffPageHooks.ts
    │
    ├── types/                # TypeScript 타입 정의
    │   ├── api.ts            # ApiResponse<T> 공통 래퍼
    │   ├── team.ts
    │   ├── player.ts
    │   ├── season.ts         # Season / Standing / SeasonEvent + 라벨 상수
    │   ├── staff.ts          # Staff / StffAblt + 라벨 상수
    │   ├── game.ts
    │   ├── record.ts
    │   └── common.ts
    │
    └── constants/
        └── index.ts          # CURRENT_SEASON_YEAR, ABILITY_GRADE_COLOR, FCLTY_LVL_LABEL 등
```

## 개발 규칙

### 상태 관리
- 모든 서버 상태는 TanStack Query (`useQuery`)로 관리 — `useState` / `useEffect` 직접 fetch 금지
- 쿼리 키는 각 훅 파일에서 `xxxKeys` 객체로 정의하고 일관되게 사용

### 페이지 구조
- 각 페이지는 `XxxPage.tsx` (렌더링) + `XxxPageHooks.ts` (로직/상태) 로 분리
- `XxxPageHooks.ts`에서 데이터 패칭, 필터 상태, 포맷 함수를 모두 담당

### UI 컴포넌트
- MUI 컴포넌트 우선 사용 (`Box`, `Typography`, `Table`, `Select`, `Button` 등)
- 인라인 스타일 대신 MUI `sx` prop 사용
- 테마는 `main.tsx`의 `createTheme`에서 중앙 관리 (primary: #1a365d)

### API 연동
- `src/api/client.ts`의 Axios 인스턴스를 통해서만 호출
- API 함수는 `r.data.data`까지 추출해서 반환 (`ApiResponse<T>` 언래핑 포함)
