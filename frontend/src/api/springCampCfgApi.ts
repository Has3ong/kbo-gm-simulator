import client from './client'
import type { ApiResponse } from '../types/api'

export interface SpringCampCfg {
  campCd: string
  campNm: string
  cost: number
  tier: number
  growthAbltCnt: number
  maxGrowthPerAblt: number
  maxOvrlGrowth: number
}

export const springCampCfgApi = {
  getAll: () =>
    client.get<ApiResponse<SpringCampCfg[]>>('/spring-camp-cfg').then((r) => r.data.data),

  update: (campCd: string, data: SpringCampCfg) =>
    client.put<ApiResponse<null>>(`/spring-camp-cfg/${campCd}`, data).then((r) => r.data),
}
