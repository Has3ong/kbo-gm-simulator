package com.kbo.gm.domain.player.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PlrTrtDao {
    private Long plrId;       // 선수 ID
    private String trtCd;     // 특성 코드 (IRON: 금강불괴, GLAS: 유리몸, CLTH: 클러치 등)
    private String trtNm;     // 특성 한국어 이름
    private String trtEngNm;  // 특성 영어 이름
    private String trtDesc;   // 특성 설명 (게임 내 효과 요약)
}
