import client from './client'
import type { ApiResponse } from '../types/api'
import type { CmnCd } from '../types/common'

export const cmnCdApi = {
  getAll: () =>
    client.get<ApiResponse<CmnCd[]>>('/common/codes').then((r) => r.data.data),

  getByCdId: (cdId: string) =>
    client.get<ApiResponse<CmnCd[]>>(`/common/codes/${cdId}`).then((r) => r.data.data),

  update: (cdId: string, cdVal: string, data: Partial<Pick<CmnCd, 'cdNm' | 'cdEngNm' | 'cdDesc'>>) =>
    client.put<ApiResponse<null>>(`/common/codes/${cdId}/${cdVal}`, data).then((r) => r.data),
}
