package com.kbo.gm.domain.draft.dao;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DrftOrdDao {
    private Long drftId;        // 드래프트 ID
    private Integer pickNo;     // 전체 픽 번호
    private Integer rnd;        // 라운드 번호
    private Integer rndPickNo;  // 라운드 내 픽 순서
    private Long tmId;          // 지명 팀 ID
    private String tmKrNm;      // 팀 한국어명 (TM 조인)
    private String tmShrtKrNm;  // 팀 한국어 약칭 (TM 조인)
    private String pickSttsCd;  // 픽 상태코드 (PENDING/PICKED/SKIPPED)
    private Long drftPlrId;     // 지명된 선수 ID (null=미지명)
    private String plrNm;       // 선수명 (DRFT_PLR 조인)
    private String posnCd;      // 포지션코드 (DRFT_PLR 조인)
    private String reprPosnCd;  // 대표 포지션코드 (DRFT_PLR 조인)
    private Long plrId;         // 입단 후 선수 ID (null=미서명)
}
