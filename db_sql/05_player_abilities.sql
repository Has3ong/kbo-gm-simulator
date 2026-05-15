-- =====================================================
-- 선수 능력치 데이터 (PLR_ABLT)
-- 20~80 스케일 | 50 = KBO 평균 수준
-- 타자: CNT(컨택) PWR(파워) RUN(주루) THR(송구) STL(도루)
-- 투수: VEL(구속) CTL(제구) BRK(변화구) + 보유 구종
-- =====================================================

-- ── KIA 타이거즈 ────────────────────────────────────
-- 1 양현종 (SP) | 좌완 에이스, 뛰어난 제구와 체인지업
INSERT INTO PLR_ABLT VALUES
( 1,'VEL',62),( 1,'CTL',73),( 1,'BRK',70),
( 1,'P4S',62),( 1,'PSL',68),( 1,'PCH',73),( 1,'PCB',60),( 1,'P2S',58);
-- 2 김도영 (SS) | 수비 명수, 빠른 발, 장타력 겸비
INSERT INTO PLR_ABLT VALUES
( 2,'CNT',70),( 2,'PWR',63),( 2,'RUN',72),( 2,'THR',67),( 2,'STL',74);
-- 3 최형우 (DH) | 뛰어난 컨택 타자, 클러치 히터
INSERT INTO PLR_ABLT VALUES
( 3,'CNT',73),( 3,'PWR',70),( 3,'RUN',30),( 3,'THR',40),( 3,'STL',22);
-- 4 나성범 (RF)
INSERT INTO PLR_ABLT VALUES
( 4,'CNT',65),( 4,'PWR',62),( 4,'RUN',60),( 4,'THR',63),( 4,'STL',58);
-- 5 소크라테스 브리토 (LF) | 외국인 타자
INSERT INTO PLR_ABLT VALUES
( 5,'CNT',63),( 5,'PWR',66),( 5,'RUN',60),( 5,'THR',56),( 5,'STL',55);
-- 6 이의리 (SP) | 좌완, 강속구
INSERT INTO PLR_ABLT VALUES
( 6,'VEL',71),( 6,'CTL',58),( 6,'BRK',62),
( 6,'P4S',71),( 6,'PSL',62),( 6,'PCB',58);
-- 7 황대인 (1B) | 파워 히터
INSERT INTO PLR_ABLT VALUES
( 7,'CNT',58),( 7,'PWR',66),( 7,'RUN',36),( 7,'THR',50),( 7,'STL',26);
-- 8 박찬호 (2B)
INSERT INTO PLR_ABLT VALUES
( 8,'CNT',61),( 8,'PWR',45),( 8,'RUN',63),( 8,'THR',61),( 8,'STL',59);
-- 9 한준수 (C)
INSERT INTO PLR_ABLT VALUES
( 9,'CNT',55),( 9,'PWR',48),( 9,'RUN',40),( 9,'THR',66),( 9,'STL',32);
-- 10 정해영 (CP) | 마무리, 슬라이더 특화
INSERT INTO PLR_ABLT VALUES
(10,'VEL',70),(10,'CTL',68),(10,'BRK',67),
(10,'P4S',70),(10,'PSL',68),(10,'PCT',60);

-- ── 삼성 라이온즈 ────────────────────────────────────
-- 11 원태인 (SP)
INSERT INTO PLR_ABLT VALUES
(11,'VEL',65),(11,'CTL',68),(11,'BRK',65),
(11,'P4S',65),(11,'PSL',63),(11,'PCH',60),(11,'P2S',58);
-- 12 구자욱 (RF) | 정교한 컨택
INSERT INTO PLR_ABLT VALUES
(12,'CNT',71),(12,'PWR',65),(12,'RUN',58),(12,'THR',60),(12,'STL',52);
-- 13 이재현 (SS)
INSERT INTO PLR_ABLT VALUES
(13,'CNT',60),(13,'PWR',47),(13,'RUN',65),(13,'THR',63),(13,'STL',63);
-- 14 강민호 (C) | 베테랑 포수, 강한 어깨
INSERT INTO PLR_ABLT VALUES
(14,'CNT',63),(14,'PWR',55),(14,'RUN',33),(14,'THR',70),(14,'STL',26);
-- 15 박병호 (1B) | 홈런 타자
INSERT INTO PLR_ABLT VALUES
(15,'CNT',55),(15,'PWR',72),(15,'RUN',30),(15,'THR',45),(15,'STL',22);
-- 16 김헌곤 (LF)
INSERT INTO PLR_ABLT VALUES
(16,'CNT',60),(16,'PWR',52),(16,'RUN',55),(16,'THR',55),(16,'STL',48);
-- 17 오승환 (CP) | 돌직구+슬라이더, 베테랑 마무리
INSERT INTO PLR_ABLT VALUES
(17,'VEL',65),(17,'CTL',72),(17,'BRK',70),
(17,'P4S',66),(17,'PSL',72),(17,'PCT',62);
-- 18 서준원 (RP) | 강속구 불펜
INSERT INTO PLR_ABLT VALUES
(18,'VEL',70),(18,'CTL',58),(18,'BRK',56),
(18,'P4S',70),(18,'PSL',57);
-- 19 류지혁 (2B)
INSERT INTO PLR_ABLT VALUES
(19,'CNT',58),(19,'PWR',44),(19,'RUN',61),(19,'THR',59),(19,'STL',56);
-- 20 김지찬 (CF) | 스피드 스타
INSERT INTO PLR_ABLT VALUES
(20,'CNT',62),(20,'PWR',39),(20,'RUN',74),(20,'THR',55),(20,'STL',72);

-- ── LG 트윈스 ────────────────────────────────────────
-- 21 임찬규 (SP)
INSERT INTO PLR_ABLT VALUES
(21,'VEL',62),(21,'CTL',65),(21,'BRK',62),
(21,'P4S',62),(21,'PSL',60),(21,'PCH',58),(21,'PCB',55);
-- 22 오지환 (SS)
INSERT INTO PLR_ABLT VALUES
(22,'CNT',63),(22,'PWR',60),(22,'RUN',60),(22,'THR',65),(22,'STL',55);
-- 23 박해민 (CF) | 스피드 스타, 수비 명수
INSERT INTO PLR_ABLT VALUES
(23,'CNT',65),(23,'PWR',41),(23,'RUN',73),(23,'THR',60),(23,'STL',71);
-- 24 문보경 (3B)
INSERT INTO PLR_ABLT VALUES
(24,'CNT',66),(24,'PWR',63),(24,'RUN',55),(24,'THR',62),(24,'STL',45);
-- 25 홍창기 (LF) | 높은 출루율
INSERT INTO PLR_ABLT VALUES
(25,'CNT',69),(25,'PWR',50),(25,'RUN',62),(25,'THR',55),(25,'STL',60);
-- 26 오스틴 딘 (1B) | 외국인 파워 타자
INSERT INTO PLR_ABLT VALUES
(26,'CNT',65),(26,'PWR',71),(26,'RUN',44),(26,'THR',55),(26,'STL',30);
-- 27 박동원 (C)
INSERT INTO PLR_ABLT VALUES
(27,'CNT',58),(27,'PWR',52),(27,'RUN',37),(27,'THR',66),(27,'STL',27);
-- 28 이정용 (CP) | 좌완 마무리
INSERT INTO PLR_ABLT VALUES
(28,'VEL',69),(28,'CTL',68),(28,'BRK',65),
(28,'P4S',66),(28,'PSL',68),(28,'PCT',60);
-- 29 플럿코 (RP) | 외국인 투수, 강속구
INSERT INTO PLR_ABLT VALUES
(29,'VEL',71),(29,'CTL',58),(29,'BRK',60),
(29,'P4S',71),(29,'PCH',62),(29,'PSL',58);
-- 30 신민재 (2B) | 스피드 테이블세터
INSERT INTO PLR_ABLT VALUES
(30,'CNT',63),(30,'PWR',39),(30,'RUN',69),(30,'THR',58),(30,'STL',67);

-- ── 두산 베어스 ────────────────────────────────────
-- 31 곽빈 (SP)
INSERT INTO PLR_ABLT VALUES
(31,'VEL',69),(31,'CTL',62),(31,'BRK',60),
(31,'P4S',69),(31,'PSL',60),(31,'PCB',58),(31,'PCH',55);
-- 32 양석환 (1B) | 장타력
INSERT INTO PLR_ABLT VALUES
(32,'CNT',62),(32,'PWR',69),(32,'RUN',39),(32,'THR',48),(32,'STL',27);
-- 33 허경민 (3B) | 안정적인 타격
INSERT INTO PLR_ABLT VALUES
(33,'CNT',65),(33,'PWR',52),(33,'RUN',58),(33,'THR',62),(33,'STL',50);
-- 34 강승호 (2B)
INSERT INTO PLR_ABLT VALUES
(34,'CNT',58),(34,'PWR',44),(34,'RUN',62),(34,'THR',58),(34,'STL',58);
-- 35 정수빈 (CF) | 주루
INSERT INTO PLR_ABLT VALUES
(35,'CNT',62),(35,'PWR',44),(35,'RUN',69),(35,'THR',58),(35,'STL',66);
-- 36 박계범 (C)
INSERT INTO PLR_ABLT VALUES
(36,'CNT',52),(36,'PWR',44),(36,'RUN',37),(36,'THR',63),(36,'STL',27);
-- 37 김강률 (RP)
INSERT INTO PLR_ABLT VALUES
(37,'VEL',65),(37,'CTL',55),(37,'BRK',55),
(37,'P4S',65),(37,'PSL',56);
-- 38 로버트 가르시아 (SP) | 외국인 강속구
INSERT INTO PLR_ABLT VALUES
(38,'VEL',71),(38,'CTL',60),(38,'BRK',62),
(38,'P4S',71),(38,'PSL',62),(38,'PCH',60);
-- 39 전민수 (LF)
INSERT INTO PLR_ABLT VALUES
(39,'CNT',55),(39,'PWR',49),(39,'RUN',58),(39,'THR',52),(39,'STL',52);
-- 40 권희동 (RF)
INSERT INTO PLR_ABLT VALUES
(40,'CNT',61),(40,'PWR',55),(40,'RUN',55),(40,'THR',58),(40,'STL',45);

-- ── KT 위즈 ──────────────────────────────────────────
-- 41 고영표 (SP) | 제구와 싱커 특화
INSERT INTO PLR_ABLT VALUES
(41,'VEL',62),(41,'CTL',71),(41,'BRK',68),
(41,'P4S',62),(41,'PSN',67),(41,'PCH',65),(41,'PCB',60);
-- 42 강백호 (1B) | 기대주 파워 타자
INSERT INTO PLR_ABLT VALUES
(42,'CNT',65),(42,'PWR',69),(42,'RUN',47),(42,'THR',50),(42,'STL',34);
-- 43 황재균 (3B) | 베테랑 내야수
INSERT INTO PLR_ABLT VALUES
(43,'CNT',62),(43,'PWR',62),(43,'RUN',51),(43,'THR',60),(43,'STL',42);
-- 44 천성호 (SS)
INSERT INTO PLR_ABLT VALUES
(44,'CNT',58),(44,'PWR',44),(44,'RUN',60),(44,'THR',63),(44,'STL',55);
-- 45 배정대 (RF)
INSERT INTO PLR_ABLT VALUES
(45,'CNT',62),(45,'PWR',52),(45,'RUN',62),(45,'THR',60),(45,'STL',58);
-- 46 로하스 (CF) | 외국인, 스위치히터 올라운더
INSERT INTO PLR_ABLT VALUES
(46,'CNT',65),(46,'PWR',69),(46,'RUN',62),(46,'THR',62),(46,'STL',58);
-- 47 엄상백 (SP)
INSERT INTO PLR_ABLT VALUES
(47,'VEL',62),(47,'CTL',60),(47,'BRK',58),
(47,'P4S',62),(47,'PSL',58),(47,'PCH',56);
-- 48 김재윤 (CP)
INSERT INTO PLR_ABLT VALUES
(48,'VEL',65),(48,'CTL',65),(48,'BRK',62),
(48,'P4S',65),(48,'PSL',63);
-- 49 박경수 (2B) | 베테랑
INSERT INTO PLR_ABLT VALUES
(49,'CNT',55),(49,'PWR',47),(49,'RUN',55),(49,'THR',58),(49,'STL',47);
-- 50 장성우 (C)
INSERT INTO PLR_ABLT VALUES
(50,'CNT',55),(50,'PWR',50),(50,'RUN',39),(50,'THR',66),(50,'STL',29);

-- ── SSG 랜더스 ────────────────────────────────────────
-- 51 김광현 (SP) | KBO 최고 좌완, 완성된 에이스
INSERT INTO PLR_ABLT VALUES
(51,'VEL',65),(51,'CTL',74),(51,'BRK',72),
(51,'P4S',65),(51,'PCH',74),(51,'PSL',68),(51,'PCT',68),(51,'PCB',62);
-- 52 최지훈 (CF) | 스피드
INSERT INTO PLR_ABLT VALUES
(52,'CNT',65),(52,'PWR',41),(52,'RUN',69),(52,'THR',55),(52,'STL',66);
-- 53 한유섬 (RF)
INSERT INTO PLR_ABLT VALUES
(53,'CNT',60),(53,'PWR',52),(53,'RUN',58),(53,'THR',58),(53,'STL',50);
-- 54 최정 (3B) | 역대급 홈런타자
INSERT INTO PLR_ABLT VALUES
(54,'CNT',65),(54,'PWR',74),(54,'RUN',44),(54,'THR',62),(54,'STL',34);
-- 55 박성한 (SS)
INSERT INTO PLR_ABLT VALUES
(55,'CNT',62),(55,'PWR',47),(55,'RUN',62),(55,'THR',65),(55,'STL',58);
-- 56 오태곤 (2B)
INSERT INTO PLR_ABLT VALUES
(56,'CNT',58),(56,'PWR',44),(56,'RUN',58),(56,'THR',58),(56,'STL',52);
-- 57 이재원 (C) | 베테랑 포수
INSERT INTO PLR_ABLT VALUES
(57,'CNT',55),(57,'PWR',47),(57,'RUN',36),(57,'THR',63),(57,'STL',27);
-- 58 문승원 (RP)
INSERT INTO PLR_ABLT VALUES
(58,'VEL',63),(58,'CTL',58),(58,'BRK',55),
(58,'P4S',63),(58,'PSL',56);
-- 59 노경은 (SP) | 싱커볼러
INSERT INTO PLR_ABLT VALUES
(59,'VEL',58),(59,'CTL',62),(59,'BRK',60),
(59,'P4S',58),(59,'PSN',62),(59,'PCH',58);
-- 60 기예르모 에레디아 (LF) | 외국인
INSERT INTO PLR_ABLT VALUES
(60,'CNT',65),(60,'PWR',60),(60,'RUN',60),(60,'THR',60),(60,'STL',55);

-- ── 롯데 자이언츠 ────────────────────────────────────
-- 61 안치홍 (2B) | 안정적인 타격
INSERT INTO PLR_ABLT VALUES
(61,'CNT',69),(61,'PWR',58),(61,'RUN',60),(61,'THR',62),(61,'STL',55);
-- 62 전준우 (RF) | 베테랑
INSERT INTO PLR_ABLT VALUES
(62,'CNT',65),(62,'PWR',58),(62,'RUN',55),(62,'THR',60),(62,'STL',47);
-- 63 한동희 (3B)
INSERT INTO PLR_ABLT VALUES
(63,'CNT',62),(63,'PWR',63),(63,'RUN',54),(63,'THR',60),(63,'STL',45);
-- 64 나균안 (SP)
INSERT INTO PLR_ABLT VALUES
(64,'VEL',62),(64,'CTL',60),(64,'BRK',58),
(64,'P4S',62),(64,'PSL',58),(64,'PCH',55);
-- 65 윤동희 (CF)
INSERT INTO PLR_ABLT VALUES
(65,'CNT',60),(65,'PWR',44),(65,'RUN',69),(65,'THR',55),(65,'STL',66);
-- 66 고승민 (SS)
INSERT INTO PLR_ABLT VALUES
(66,'CNT',58),(66,'PWR',41),(66,'RUN',62),(66,'THR',62),(66,'STL',58);
-- 67 유강남 (C)
INSERT INTO PLR_ABLT VALUES
(67,'CNT',55),(67,'PWR',52),(67,'RUN',37),(67,'THR',65),(67,'STL',27);
-- 68 김원중 (CP) | 강속구 마무리
INSERT INTO PLR_ABLT VALUES
(68,'VEL',69),(68,'CTL',62),(68,'BRK',60),
(68,'P4S',69),(68,'PSL',62);
-- 69 빅터 레이예스 (LF) | 외국인 스위치히터
INSERT INTO PLR_ABLT VALUES
(69,'CNT',65),(69,'PWR',62),(69,'RUN',62),(69,'THR',60),(69,'STL',58);
-- 70 이인복 (SP)
INSERT INTO PLR_ABLT VALUES
(70,'VEL',60),(70,'CTL',58),(70,'BRK',55),
(70,'P4S',60),(70,'PSL',56),(70,'PCH',52);

-- ── 한화 이글스 ──────────────────────────────────────
-- 71 류현진 (SP) | 체인지업·제구 장인, KBO 복귀 에이스
INSERT INTO PLR_ABLT VALUES
(71,'VEL',60),(71,'CTL',75),(71,'BRK',73),
(71,'P4S',62),(71,'PCH',75),(71,'PSL',68),(71,'PCT',68),(71,'PCB',65);
-- 72 노시환 (1B) | 거포
INSERT INTO PLR_ABLT VALUES
(72,'CNT',60),(72,'PWR',72),(72,'RUN',41),(72,'THR',48),(72,'STL',29);
-- 73 채은성 (RF)
INSERT INTO PLR_ABLT VALUES
(73,'CNT',62),(73,'PWR',58),(73,'RUN',55),(73,'THR',58),(73,'STL',45);
-- 74 문현빈 (SS)
INSERT INTO PLR_ABLT VALUES
(74,'CNT',58),(74,'PWR',41),(74,'RUN',62),(74,'THR',60),(74,'STL',58);
-- 75 김인환 (2B)
INSERT INTO PLR_ABLT VALUES
(75,'CNT',56),(75,'PWR',41),(75,'RUN',60),(75,'THR',58),(75,'STL',55);
-- 76 최재훈 (C)
INSERT INTO PLR_ABLT VALUES
(76,'CNT',58),(76,'PWR',50),(76,'RUN',37),(76,'THR',66),(76,'STL',27);
-- 77 박상원 (RP)
INSERT INTO PLR_ABLT VALUES
(77,'VEL',65),(77,'CTL',55),(77,'BRK',55),
(77,'P4S',65),(77,'PSL',56);
-- 78 문동주 (SP) | 강속구 유망주
INSERT INTO PLR_ABLT VALUES
(78,'VEL',73),(78,'CTL',55),(78,'BRK',58),
(78,'P4S',73),(78,'PSL',58),(78,'PCB',55);
-- 79 브라이언 모리슨 (RP) | 외국인 불펜
INSERT INTO PLR_ABLT VALUES
(79,'VEL',69),(79,'CTL',58),(79,'BRK',60),
(79,'P4S',69),(79,'PSL',60),(79,'PCT',55);
-- 80 페라자 (SS) | 외국인 야수
INSERT INTO PLR_ABLT VALUES
(80,'CNT',62),(80,'PWR',55),(80,'RUN',62),(80,'THR',63),(80,'STL',58);

-- ── NC 다이노스 ──────────────────────────────────────
-- 81 박민우 (2B) | 교타·도루
INSERT INTO PLR_ABLT VALUES
(81,'CNT',69),(81,'PWR',52),(81,'RUN',69),(81,'THR',62),(81,'STL',66);
-- 82 손아섭 (LF) | 베테랑 타격의 달인
INSERT INTO PLR_ABLT VALUES
(82,'CNT',69),(82,'PWR',58),(82,'RUN',55),(82,'THR',58),(82,'STL',47);
-- 83 양의지 (C) | KBO 최정상급 포수
INSERT INTO PLR_ABLT VALUES
(83,'CNT',71),(83,'PWR',63),(83,'RUN',37),(83,'THR',71),(83,'STL',27);
-- 84 류진욱 (SP)
INSERT INTO PLR_ABLT VALUES
(84,'VEL',62),(84,'CTL',58),(84,'BRK',58),
(84,'P4S',62),(84,'PSL',58),(84,'PCB',55);
-- 85 박건우 (CF)
INSERT INTO PLR_ABLT VALUES
(85,'CNT',65),(85,'PWR',55),(85,'RUN',62),(85,'THR',60),(85,'STL',55);
-- 86 박성호 (RF)
INSERT INTO PLR_ABLT VALUES
(86,'CNT',55),(86,'PWR',47),(86,'RUN',58),(86,'THR',55),(86,'STL',52);
-- 87 이재학 (SP) | 싱커볼러
INSERT INTO PLR_ABLT VALUES
(87,'VEL',58),(87,'CTL',62),(87,'BRK',60),
(87,'P4S',58),(87,'PSN',62),(87,'PCH',58);
-- 88 오영수 (CP)
INSERT INTO PLR_ABLT VALUES
(88,'VEL',65),(88,'CTL',62),(88,'BRK',60),
(88,'P4S',65),(88,'PSL',61);
-- 89 나성용 (1B) | 외국인
INSERT INTO PLR_ABLT VALUES
(89,'CNT',60),(89,'PWR',69),(89,'RUN',41),(89,'THR',48),(89,'STL',31);
-- 90 김형준 (3B)
INSERT INTO PLR_ABLT VALUES
(90,'CNT',58),(90,'PWR',52),(90,'RUN',55),(90,'THR',60),(90,'STL',45);

-- ── 키움 히어로즈 ────────────────────────────────────
-- 91 안우진 (SP) | 강속구·슬라이더 특화 에이스급 유망주
INSERT INTO PLR_ABLT VALUES
(91,'VEL',73),(91,'CTL',62),(91,'BRK',65),
(91,'P4S',73),(91,'PSL',66),(91,'PCH',62);
-- 92 이주형 (CF) | 스피드 유망주
INSERT INTO PLR_ABLT VALUES
(92,'CNT',62),(92,'PWR',47),(92,'RUN',69),(92,'THR',55),(92,'STL',69);
-- 93 김혜성 (2B) | 빠른 발 교타 타자
INSERT INTO PLR_ABLT VALUES
(93,'CNT',65),(93,'PWR',47),(93,'RUN',66),(93,'THR',60),(93,'STL',63);
-- 94 송성문 (3B)
INSERT INTO PLR_ABLT VALUES
(94,'CNT',60),(94,'PWR',58),(94,'RUN',55),(94,'THR',60),(94,'STL',47);
-- 95 이원석 (RF)
INSERT INTO PLR_ABLT VALUES
(95,'CNT',58),(95,'PWR',52),(95,'RUN',58),(95,'THR',58),(95,'STL',52);
-- 96 이지영 (C) | 베테랑 포수
INSERT INTO PLR_ABLT VALUES
(96,'CNT',55),(96,'PWR',44),(96,'RUN',37),(96,'THR',63),(96,'STL',27);
-- 97 헤이수스 (1B) | 외국인 파워 타자
INSERT INTO PLR_ABLT VALUES
(97,'CNT',62),(97,'PWR',71),(97,'RUN',41),(97,'THR',50),(97,'STL',31);
-- 98 주승우 (RP)
INSERT INTO PLR_ABLT VALUES
(98,'VEL',62),(98,'CTL',52),(98,'BRK',52),
(98,'P4S',62),(98,'PSL',51);
-- 99 한현희 (SP)
INSERT INTO PLR_ABLT VALUES
(99,'VEL',60),(99,'CTL',60),(99,'BRK',58),
(99,'P4S',60),(99,'PSL',58),(99,'PCT',55);
-- 100 김웅빈 (SS)
INSERT INTO PLR_ABLT VALUES
(100,'CNT',55),(100,'PWR',41),(100,'RUN',60),(100,'THR',58),(100,'STL',55);
