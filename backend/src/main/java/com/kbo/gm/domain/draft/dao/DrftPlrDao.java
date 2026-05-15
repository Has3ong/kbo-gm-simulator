package com.kbo.gm.domain.draft.dao;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DrftPlrDao {
    private Long drftPlrId;           // 드래프트 선수 ID
    private Long drftId;              // 드래프트 ID
    private String plrNm;             // 선수명 (한글)
    private String plrEngNm;          // 선수 영문명
    private Integer plrAge;           // 나이
    private String plrOrgnCd;         // 출신코드 (HS/COL/ERLY/TRYO/IND)
    private String plrOrgnNm;         // 출신 한국어명 (CMN_CD 조인)
    private String hsNm;              // 출신 고등학교
    private String univNm;            // 출신 대학교
    private Integer plrHt;            // 신장(cm)
    private Integer plrWt;            // 체중(kg)
    private String prevRec;           // 주요 기록 (아마추어 요약)
    private String posnCd;            // 주 포지션코드
    private String posnNm;            // 주 포지션 한국어명 (CMN_CD 조인)
    private String reprPosnCd;        // 대표 포지션코드 (10=투수/20=포수/21=내야/22=외야)
    private String reprPosnNm;        // 대표 포지션 한국어명 (CMN_CD 조인)
    private String plrBatPtchHandCd;  // 투타코드
    private Integer actOvrlAblt;      // 실제 현재 능력치 (내부 전용, 응답에 노출 금지)
    private Integer actPotAblt;       // 실제 잠재 능력치 (내부 전용, 응답에 노출 금지)
    private String grwthTend;         // 성장 성향 (ERLY/LATB/NRML)
    private Integer injRsk;           // 부상 위험도 (1~20)
    private String isPickYn;          // 지명 여부 (Y/N)
    private String isExclYn;          // 지명 제외 여부 (Y/N)
    private Long plrId;               // 입단 후 생성된 선수ID (null=미서명)

    // DRFT_SCUT_RPT에서 조인 (팀별 스카우팅 리포트)
    private Integer estOvrlAblt;      // 추정 현재 능력치
    private Integer estPotAblt;       // 추정 잠재 능력치
    private Integer estRnd;           // 예상 지명 라운드
    private Integer accrcy;           // 스카우팅 정확도 (1~10)
    private String grade;             // 평가 등급 (S+/S/A+/A/B+/B/C+/C/D)
    private String cmnt;              // 스카우트 코멘트

    // DRFT_BOARD에서 조인 (유저 보드)
    private Integer prioOrd;          // 보드 우선순위
    private String doNotPick;         // 지명 제외 여부 (Y/N)
    private String memo;              // 메모
}
