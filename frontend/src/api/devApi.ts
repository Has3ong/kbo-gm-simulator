import client from './client'
import type { ApiResponse } from '../types/api'

export interface FcltyCostRow {
  fcltyTypeCd: string
  fromLvl: number
  toLvl: number
  upgrCost: number
  upgrDays: number
}

export const devApi = {
  getFcltyCosts: () =>
    client.get<ApiResponse<FcltyCostRow[]>>('/dev/facility-costs').then((r) => r.data.data),

  updateFcltyCosts: (rows: FcltyCostRow[]) =>
    client.put<ApiResponse<null>>('/dev/facility-costs', { rows }).then((r) => r.data),
}
