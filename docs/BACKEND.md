# Backend 구조

## 기술 스택
- **Java 17**
- **Spring Boot 3.2.5**
- **MyBatis 3** (Spring Boot Starter 3.0.3) — SQL 매퍼 프레임워크
- **Flyway** — DB 스키마 마이그레이션
- **MariaDB** (Docker, 포트 3306, DB명: KBO)
- **Lombok** — 보일러플레이트 제거
- 포트: **8080**

## DB 접속 정보 (application.yml)
| 항목 | 값 |
|------|-----|
| URL | `jdbc:mariadb://localhost:3306/KBO` |
| Username | `user` |
| Password | `password` |
| Driver | `org.mariadb.jdbc.Driver` |

## MyBatis 설정
| 설정 | 값 | 설명 |
|------|-----|------|
| `mapUnderscoreToCamelCase` | `true` | snake_case → camelCase 자동 변환 |
| `callSettersOnNulls` | `true` | 쿼리 결과가 null이어도 setter 호출 |
| `jdbcTypeForNull` | `NULL` | null 파라미터 전송 시 에러 방지 |

## 디렉터리 구조

```
backend/
├── pom.xml
└── src/main/
    ├── java/com/kbo/gm/
    │   ├── KboGmApplication.java
    │   │
    │   ├── config/
    │   │   ├── ApiResponse.java          # 공통 응답 래퍼 { success, data, message }
    │   │   ├── GlobalExceptionHandler.java
    │   │   └── WebConfig.java            # CORS 설정 (허용: http://localhost:5173)
    │   │
    │   ├── util/
    │   │   ├── AbilityGradeConverter.java  # 능력치 수치 → 등급 변환 (S+~D)
    │   │   └── KoreanNameGenerator.java    # 한국어 이름 랜덤 생성
    │   │
    │   ├── common/
    │   │   ├── code/                     # 코드 상수 Enum
    │   │   │   ├── CntrctTypeCd.java     # 계약 유형
    │   │   │   ├── EvntTypeCd.java       # 이벤트 유형
    │   │   │   ├── FcltyTypeCd.java      # 시설 유형
    │   │   │   ├── GameTypeCd.java       # 경기 유형
    │   │   │   ├── PlrSttsCd.java        # 선수 상태
    │   │   │   ├── PosnCd.java           # 포지션
    │   │   │   ├── SsntSttsCd.java       # 시즌 상태
    │   │   │   └── StffTypeCd.java       # 스태프 직종
    │   │   ├── entity/CmnCd.java         # 공통코드 엔티티
    │   │   ├── mapper/CmnCdMapper.java
    │   │   ├── service/CmnCdService.java
    │   │   └── controller/CmnCdController.java
    │   │
    │   └── domain/
    │       ├── team/
    │       │   ├── entity/Tm.java
    │       │   ├── mapper/TmMapper.java
    │       │   ├── service/TmService.java
    │       │   ├── controller/TmController.java
    │       │   └── dto/
    │       │       ├── TmResponse.java
    │       │       ├── TmFinanceResponse.java
    │       │       ├── TmFacilityResponse.java
    │       │       └── TmMarketResponse.java
    │       │
    │       ├── player/
    │       │   ├── entity/Plr.java
    │       │   ├── mapper/PlrMapper.java
    │       │   ├── service/PlrService.java
    │       │   ├── controller/PlrController.java
    │       │   └── dto/
    │       │       ├── PlrResponse.java
    │       │       ├── PlrAbltResponse.java   # 능력치
    │       │       ├── PlrPosnResponse.java   # 포지션
    │       │       ├── PlrTrtResponse.java    # 특성
    │       │       └── PlrCntrctResponse.java # 계약
    │       │
    │       ├── staff/
    │       │   ├── mapper/StffMapper.java
    │       │   ├── service/StffService.java
    │       │   ├── controller/StffController.java
    │       │   └── dto/
    │       │       ├── StffResponse.java
    │       │       └── StffAbltResponse.java  # 스태프 능력치
    │       │
    │       ├── season/
    │       │   ├── mapper/SsntMapper.java
    │       │   ├── service/SsntService.java
    │       │   ├── controller/SsntController.java
    │       │   └── dto/
    │       │       ├── SsntResponse.java      # 시즌 기본 정보
    │       │       ├── StndResponse.java      # 순위표
    │       │       └── SsntEvntResponse.java  # 시즌 이벤트
    │       │
    │       ├── game/
    │       │   ├── mapper/GameMapper.java
    │       │   ├── service/GameService.java
    │       │   ├── controller/GameController.java
    │       │   └── dto/GameResponse.java
    │       │
    │       ├── record/
    │       │   ├── mapper/RecordMapper.java
    │       │   ├── service/RecordService.java
    │       │   ├── controller/RecordController.java
    │       │   └── dto/
    │       │       ├── BatrSsntRecResponse.java  # 타자 시즌 기록
    │       │       └── PtchSsntRecResponse.java  # 투수 시즌 기록
    │       │
    │       ├── draft/
    │       │   ├── dao/
    │       │   │   ├── DrftDao.java          # 드래프트 마스터
    │       │   │   ├── DrftPlrDao.java       # 드래프트 후보 (스카우팅·보드 join 포함)
    │       │   │   ├── DrftScutRptDao.java   # 스카우팅 리포트 (batch insert용)
    │       │   │   ├── DrftOrdDao.java       # 지명 순서 (팀·선수 join 포함)
    │       │   │   └── DrftBoardDao.java     # 드래프트 보드
    │       │   ├── dto/
    │       │   │   ├── DrftResponse.java
    │       │   │   ├── DrftPlrResponse.java  # 실제 능력치 비공개, 추정치만 노출
    │       │   │   ├── DrftOrdResponse.java
    │       │   │   ├── DrftBoardResponse.java
    │       │   │   ├── DrftPickRequest.java
    │       │   │   └── DrftBoardUpsertRequest.java
    │       │   ├── mapper/DrftMapper.java
    │       │   ├── service/DrftService.java
    │       │   └── controller/DrftController.java
    │       │
    │       └── roster/
    │           ├── dao/PlrEntyDao.java        # 선수 엔트리 현황 (PLR join 포함)
    │           ├── dto/
    │           │   ├── RstrResponse.java
    │           │   └── RstrMoveRequest.java   # 콜업/말소 요청
    │           ├── mapper/RstrMapper.java
    │           ├── service/RstrService.java
    │           └── controller/RstrController.java
    │
    └── resources/
        ├── application.yml
        ├── mapper/                       # MyBatis XML 매퍼
        │   ├── common/CmnCdMapper.xml
        │   ├── team/TmMapper.xml
        │   ├── player/PlrMapper.xml
        │   ├── staff/StffMapper.xml
        │   ├── season/SsntMapper.xml
        │   ├── game/GameMapper.xml
        │   ├── record/RecordMapper.xml
        │   ├── draft/DrftMapper.xml
        │   └── roster/RstrMapper.xml
        └── db/migration/                 # Flyway SQL (V1~V16)
            ├── V1__create_cmn_cd.sql
            ├── V2__create_tm_plr.sql
            ├── V3__create_plr_relations.sql
            ├── V4__create_view.sql
            ├── V5__insert_cmn_cd.sql
            ├── V6__insert_tm.sql
            ├── V7__insert_plr.sql
            ├── V8__insert_plr_tm_posn.sql
            ├── V9__insert_plr_ablt.sql
            ├── V10__create_stdm_alter_tm.sql
            ├── V11__create_plr_tm.sql
            ├── V12__create_game_rec.sql
            ├── V13__insert_stdm_update_tm.sql
            ├── V14__insert_plr_tm.sql
            ├── V15__alter_plr_stdm.sql
            ├── V16__create_draft.sql
            ├── V17__create_roster.sql
            └── V18__insert_plr_2025.sql
```

## 개발 규칙

### 레이어 구조
- **Controller** → **Service** → **Mapper(MyBatis)** 단방향 의존
- Repository 레이어 없음 — MyBatis Mapper 인터페이스가 직접 SQL 담당

### DTO / Entity
- 모든 DTO·Entity에 Lombok 필수: `@Getter`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`
- Entity는 DB 매핑용, Response DTO는 API 응답 전용으로 분리

### API 응답
- 모든 API는 `ApiResponse<T>` 래퍼로 응답 (`{ success: boolean, data: T, message: string }`)
- 예외는 `GlobalExceptionHandler`에서 통일 처리

### Flyway 마이그레이션
- 새 테이블/컬럼 추가 시 반드시 새 버전 SQL 파일 추가 (기존 파일 수정 금지)
- DB 구조 변경 전 `Schema.md` 먼저 수정
