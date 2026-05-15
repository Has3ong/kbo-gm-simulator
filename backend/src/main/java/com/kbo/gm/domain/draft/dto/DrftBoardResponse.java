package com.kbo.gm.domain.draft.dto;

import com.kbo.gm.domain.draft.dao.DrftBoardDao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DrftBoardResponse {
    private Long drftPlrId;      // 드래프트 선수 ID
    private String plrNm;        // 선수명
    private String posnCd;       // 주 포지션코드
    private String reprPosnCd;   // 대표 포지션코드
    private String isPickYn;     // 지명 여부
    private Integer prioOrd;     // 보드 우선순위
    private String doNotPick;    // 지명 제외 여부
    private String memo;         // 메모
    private Integer estOvrlAblt; // 추정 현재 능력치
    private Integer estPotAblt;  // 추정 잠재 능력치
    private String grade;        // 평가 등급

    public static DrftBoardResponse from(DrftBoardDao dao) {
        return DrftBoardResponse.builder()
                .drftPlrId(dao.getDrftPlrId())
                .plrNm(dao.getPlrNm())
                .posnCd(dao.getPosnCd())
                .reprPosnCd(dao.getReprPosnCd())
                .isPickYn(dao.getIsPickYn())
                .prioOrd(dao.getPrioOrd())
                .doNotPick(dao.getDoNotPick())
                .memo(dao.getMemo())
                .estOvrlAblt(dao.getEstOvrlAblt())
                .estPotAblt(dao.getEstPotAblt())
                .grade(dao.getGrade())
                .build();
    }
}
