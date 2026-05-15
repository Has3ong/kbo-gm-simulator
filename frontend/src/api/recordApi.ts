import client from './client'
import type { ApiResponse } from '../types/api'
import type { BatrSsntRec, PtchSsntRec } from '../types/record'

export const recordApi = {
  getBatterStats: (params?: { ssntYr?: number; tmId?: number }) =>
    client
      .get<ApiResponse<BatrSsntRec[]>>('/records/batters', { params })
      .then((r) => r.data.data),

  getPitcherStats: (params?: { ssntYr?: number; tmId?: number }) =>
    client
      .get<ApiResponse<PtchSsntRec[]>>('/records/pitchers', { params })
      .then((r) => r.data.data),
}
