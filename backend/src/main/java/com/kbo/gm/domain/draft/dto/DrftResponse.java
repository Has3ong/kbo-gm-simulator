package com.kbo.gm.domain.draft.dto;

import com.kbo.gm.domain.draft.dao.DrftDao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DrftResponse {
    private Long drftId;           // 드래프트 ID
    private Integer ssntYr;        // 시즌 연도
    private LocalDate drftDt;      // 드래프트 날짜
    private String drftSttsCd;     // 드래프트 상태코드
    private Integer rndCnt;        // 라운드 수
    private Integer maxPickCnt;    // 최대 지명 수
    private Long userTmId;         // 유저 팀 ID
    private Integer totalPicked;   // 전체 지명 완료 수
    private Integer myPickCnt;     // 유저 팀 지명 수
    private Integer currentPickNo; // 현재 진행 중인 픽 번호

    public static DrftResponse from(DrftDao dao) {
        return DrftResponse.builder()
                .drftId(dao.getDrftId())
                .ssntYr(dao.getSsntYr())
                .drftDt(dao.getDrftDt())
                .drftSttsCd(dao.getDrftSttsCd())
                .rndCnt(dao.getRndCnt())
                .maxPickCnt(dao.getMaxPickCnt())
                .userTmId(dao.getUserTmId())
                .totalPicked(dao.getTotalPicked())
                .myPickCnt(dao.getMyPickCnt())
                .currentPickNo(dao.getCurrentPickNo())
                .build();
    }
}
