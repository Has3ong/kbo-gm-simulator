package com.kbo.gm.domain.draft.dto;

import com.kbo.gm.domain.draft.dao.DrftPlrDao;
import com.kbo.gm.util.AbilityGradeConverter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DrftPlrResponse {
    private Long drftPlrId;           // 드래프트 선수 ID
    private String plrNm;             // 선수명 (한글)
    private String plrEngNm;          // 선수 영문명
    private Integer plrAge;           // 나이
    private String plrOrgnCd;         // 출신코드
    private String plrOrgnNm;         // 출신 한국어명
    private String hsNm;              // 출신 고등학교
    private String univNm;            // 출신 대학교
    private Integer plrHt;            // 신장(cm)
    private Integer plrWt;            // 체중(kg)
    private String prevRec;           // 주요 기록
    private String posnCd;            // 주 포지션코드
    private String posnNm;            // 주 포지션명
    private String reprPosnCd;        // 대표 포지션코드
    private String reprPosnNm;        // 대표 포지션명
    private String plrBatPtchHandCd;  // 투타코드
    private String grwthTend;         // 성장 성향 (ERLY/LATB/NRML)
    private Integer injRsk;           // 부상 위험도 (1~20)
    private String isPickYn;          // 지명 여부
    private String isExclYn;          // 지명 제외 여부
    private Long plrId;               // 입단 후 선수ID

    // 스카우팅 리포트 (팀별 추정치 — 실제 능력치 비공개)
    private Integer estOvrlAblt;      // 추정 현재 능력치
    private String estOvrlGrade;      // 추정 현재 등급
    private Integer estPotAblt;       // 추정 잠재 능력치
    private String estPotGrade;       // 추정 잠재 등급
    private Integer estRnd;           // 예상 지명 라운드
    private Integer accrcy;           // 스카우팅 정확도 (1~10)
    private String grade;             // 종합 평가 등급
    private String cmnt;              // 스카우트 코멘트

    // 드래프트 보드
    private Integer prioOrd;          // 보드 우선순위
    private String doNotPick;         // 지명 제외 여부
    private String memo;              // 메모

    public static DrftPlrResponse from(DrftPlrDao dao) {
        return DrftPlrResponse.builder()
                .drftPlrId(dao.getDrftPlrId())
                .plrNm(dao.getPlrNm())
                .plrEngNm(dao.getPlrEngNm())
                .plrAge(dao.getPlrAge())
                .plrOrgnCd(dao.getPlrOrgnCd())
                .plrOrgnNm(dao.getPlrOrgnNm())
                .hsNm(dao.getHsNm())
                .univNm(dao.getUnivNm())
                .plrHt(dao.getPlrHt())
                .plrWt(dao.getPlrWt())
                .prevRec(dao.getPrevRec())
                .posnCd(dao.getPosnCd())
                .posnNm(dao.getPosnNm())
                .reprPosnCd(dao.getReprPosnCd())
                .reprPosnNm(dao.getReprPosnNm())
                .plrBatPtchHandCd(dao.getPlrBatPtchHandCd())
                .grwthTend(dao.getGrwthTend())
                .injRsk(dao.getInjRsk())
                .isPickYn(dao.getIsPickYn())
                .isExclYn(dao.getIsExclYn())
                .plrId(dao.getPlrId())
                .estOvrlAblt(dao.getEstOvrlAblt())
                .estOvrlGrade(dao.getEstOvrlAblt() != null ? AbilityGradeConverter.toGrade(dao.getEstOvrlAblt()) : null)
                .estPotAblt(dao.getEstPotAblt())
                .estPotGrade(dao.getEstPotAblt() != null ? AbilityGradeConverter.toGrade(dao.getEstPotAblt()) : null)
                .estRnd(dao.getEstRnd())
                .accrcy(dao.getAccrcy())
                .grade(dao.getGrade())
                .cmnt(dao.getCmnt())
                .prioOrd(dao.getPrioOrd())
                .doNotPick(dao.getDoNotPick())
                .memo(dao.getMemo())
                .build();
    }
}
