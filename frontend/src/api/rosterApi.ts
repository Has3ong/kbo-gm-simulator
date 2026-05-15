import client from './client'
import type { ApiResponse } from '../types/api'
import type { RosterConfirmRequest } from '../types/roster'

export interface RosterPlayer {
  plrId: number
  plrNm: string
  plrFrgnYn: string | null
  plrSttsCd: string | null
  plrBatPtchHandCd: string | null
  plrOvrlAblt: number | null
  ovrlGrade: string | null
  plrAnslSal: number | null
  posnCd: string | null
  reprPosnCd: string | null
  entyLvlCd: string | null
  entyDt: string | null
  fatg: number | null
  cond: number | null
}

export const rosterApi = {
  getRoster: (tmId: number, ssntYr: number) =>
    client
      .get<ApiResponse<RosterPlayer[]>>(`/roster/${tmId}`, { params: { ssntYr } })
      .then((r) => r.data.data),
}

export const rosterConfirmApi = {
  getRosterData: () =>
    client.get('/roster-confirm/roster-data').then((r) => r.data.data),
  confirm: (req: RosterConfirmRequest) =>
    client.post('/roster-confirm/confirm', req).then((r) => r.data),
}
