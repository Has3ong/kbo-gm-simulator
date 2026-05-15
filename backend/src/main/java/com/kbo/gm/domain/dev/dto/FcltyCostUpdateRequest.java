package com.kbo.gm.domain.dev.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class FcltyCostUpdateRequest {
    private List<FcltyCostRow> rows;  // 수정할 비용 행 목록
}
