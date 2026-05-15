package com.kbo.gm.domain.season.dto;

import com.kbo.gm.domain.season.dao.SsntDao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SsntResponse {
    private Integer ssntYr;          // 시즌 연도
    private String ssntSttsCd;       // 시즌 상태 코드 (PRE: 프리시즌, REG: 정규시즌, POST: 포스트시즌, CMPL: 완료, OFF: 오프시즌)
    private String ssntSttsNm;       // 시즌 상태 한국어 이름
    private LocalDate ssntBgngDt;    // 시즌 전체 시작일 (프리시즌 포함)
    private LocalDate regSsntBgngDt; // 정규시즌 시작일
    private LocalDate regSsntEndDt;  // 정규시즌 종료일
    private LocalDate pstssntBgngDt; // 포스트시즌 시작일
    private LocalDate pstssntEndDt;  // 포스트시즌 종료일
    private LocalDate ssntEndDt;     // 시즌 전체 종료일
    private LocalDate curDt;         // 현재 게임 내 날짜 (하루 루프 진행 시 갱신)

    public static SsntResponse from(SsntDao dao) {
        return SsntResponse.builder()
                .ssntYr(dao.getSsntYr())
                .ssntSttsCd(dao.getSsntSttsCd())
                .ssntSttsNm(dao.getSsntSttsNm())
                .ssntBgngDt(dao.getSsntBgngDt())
                .regSsntBgngDt(dao.getRegSsntBgngDt())
                .regSsntEndDt(dao.getRegSsntEndDt())
                .pstssntBgngDt(dao.getPstssntBgngDt())
                .pstssntEndDt(dao.getPstssntEndDt())
                .ssntEndDt(dao.getSsntEndDt())
                .curDt(dao.getCurDt())
                .build();
    }
}
