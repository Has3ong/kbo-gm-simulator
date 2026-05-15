package com.kbo.gm.domain.player.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Plr {
    private Long plrId;
    private String plrNm;
    private String plrEngNm;
    private Integer plrHgt;
    private Integer plrWgt;
    private String plrBrthLoc;
    private String plrHsNm;
    private Integer plrDrftRnd;
    private Integer plrDrftNo;
    private String plrBatPtchHandCd;
    private Long plrAnslSal;
    private String plrNtnlt;
    private String plrFrgnYn;
    private String plrSttsCd;
    private Integer plrOvrlAblt;
    private Integer plrPotAblt;
    private Long tmId;
}
