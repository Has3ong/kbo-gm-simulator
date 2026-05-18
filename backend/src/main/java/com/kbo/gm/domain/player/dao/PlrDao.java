package com.kbo.gm.domain.player.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PlrDao {
    private Long plrId;              // 선수 ID
    private String plrNm;            // 선수 한국어 이름
    private String plrEngNm;         // 선수 영어 이름
    private Integer plrHgt;          // 키 (cm)
    private Integer plrWgt;          // 몸무게 (kg)
    private Integer plrDrftRnd;      // 드래프트 라운드
    private Integer plrDrftNo;       // 드래프트 지명 순번 (전체)
    private String plrBatPtchHandCd; // 타격·투구 방향 코드 (RR: 우타우투, LL: 좌타좌투 등)
    private Long plrAnslSal;         // 연봉 (원)
    private String plrNtnlt;         // 국적
    private String plrFrgnYn;        // 외국인 선수 여부 (Y/N)
    private String plrSttsCd;        // 선수 상태 코드 (AT: 활동, INJ: 부상, RET: 은퇴, FA: FA)
    private Integer plrOvrlAblt;     // 종합 능력치 (20~80 스케일)
    private Integer plrPotAblt;      // 잠재 능력치 — 선수가 도달 가능한 최대 종합 능력치, 불변
    private Long tmId;               // 소속 팀 ID
    private String tmKrNm;           // 소속 팀 한국어 이름
    private String tmShrtKrNm;       // 소속 팀 한국어 약칭
    private String reprPosnCd;       // 대표 포지션 코드
    private String reprPosnNm;       // 대표 포지션 한국어 이름
    private Integer injElapsedDays;  // 부상 경과 일수 (PLR_STTS_CD='INJ'인 경우에만 값, 그 외 null)
    private String plrOrgnCd;        // 선수 출신 리그 코드 (PLR_ORGN 코드그룹)
}
