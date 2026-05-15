package com.kbo.gm.domain.team.dto;

import com.kbo.gm.domain.team.dao.TmDao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TmResponse {
    private Long tmId;             // 팀 ID
    private String tmKrNm;         // 팀 한국어 이름
    private String tmEngNm;        // 팀 영어 이름
    private String tmShrtKrNm;     // 팀 한국어 약칭
    private String tmShrtEngNm;    // 팀 영어 약칭
    private LocalDate tmEstblshDt; // 팀 창단일
    private String cityCd;         // 연고지 코드
    private String cityNm;         // 연고지 이름
    private Long stdmId;           // 홈 구장 ID
    private String stdmKrNm;       // 홈 구장 한국어 이름
    private String emblemCd;       // 엠블럼 파일 키
    private String ciClr;          // 팀 CI 색상 (HEX)

    public static TmResponse from(TmDao dao) {
        return TmResponse.builder()
                .tmId(dao.getTmId())
                .tmKrNm(dao.getTmKrNm())
                .tmEngNm(dao.getTmEngNm())
                .tmShrtKrNm(dao.getTmShrtKrNm())
                .tmShrtEngNm(dao.getTmShrtEngNm())
                .tmEstblshDt(dao.getTmEstblshDt())
                .cityCd(dao.getCityCd())
                .cityNm(dao.getCityNm())
                .stdmId(dao.getStdmId())
                .stdmKrNm(dao.getStdmKrNm())
                .emblemCd(dao.getEmblemCd())
                .ciClr(dao.getCiClr())
                .build();
    }
}
