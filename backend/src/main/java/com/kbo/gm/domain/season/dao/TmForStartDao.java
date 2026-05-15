package com.kbo.gm.domain.season.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TmForStartDao {
    private Long tmId;         // 팀 ID
    private String tmKrNm;     // 팀 한국어 이름
    private Long homeStdmId;   // 홈 구장 ID (TM_STDM에서 JOIN)
}
