package com.kbo.gm.domain.staff.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class StffAbltDao {
    private Long stffId;          // 스태프 ID
    private String stffAbltCd;    // 스태프 능력치 코드 (DISC: 기강유지, MOT: 의욕부여, JPP: 성장가능성 판단 등)
    private String stffAbltNm;    // 스태프 능력치 한국어 이름
    private String stffAbltEngNm; // 스태프 능력치 영어 이름
    private Integer stffAbltVal;  // 스태프 능력치 값 (20~80 스케일)
}
