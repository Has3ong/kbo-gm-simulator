package com.kbo.gm.common.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CmnCd {
    private String cdId;
    private String cdVal;
    private String cdNm;
    private String cdEngNm;
    private String cdDesc;
}
