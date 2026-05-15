package com.kbo.gm.domain.team.dao;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TmMarketDao {
    private Long tmId;            // 팀 ID
    private Integer ssntYr;       // 시즌 연도
    private Integer mktSz;         // 시장 규모 (연고지 인구·경제 기반, 20~80)
    private Integer ppltRtg;      // 팀 인기도 (20~80, 경기 결과에 따라 변동)
    private Integer fanLylty;     // 팬 충성도 (20~80, 장기적으로 완만하게 변화)
    private Integer fanExp;       // 팬 기대치 (20~80, 성적·전력에 따라 시즌 초 설정)
    private Integer regIntrst;    // 연고지 지역 관심도 (20~80)
    private Integer natnlPplt;    // 전국 인기도 (20~80)
    private Integer mrchPwr;      // 굿즈 판매력 (20~80, 인기도·팬 충성도 복합)
    private Integer avgAtndCnt;   // 홈 경기 평균 관중 수
    private Integer ssntTcktHldr; // 시즌권 보유자 수
}
