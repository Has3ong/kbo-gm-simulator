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
  // 능력치 (투수: vel/ctl/brk/stm, 야수: cnt/pwr/run/thr/stl)
  vel: number | null
  ctl: number | null
  brk: number | null
  stm: number | null
  cnt: number | null
  pwr: number | null
  run: number | null
  thr: number | null
  stl: number | null
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

// ============================================================
// 시즌 기록 타입
// ============================================================

export interface BatterSeasonStat {
  PLR_ID: number
  PLR_NM: string
  PLR_OVRL_ABLT: number | null
  REPR_POSN_CD: string | null
  POSN_CD: string | null
  G: number; PA: number; AB: number; H: number
  DOBL: number; TRPL: number; HR: number; RBI: number; R: number
  BB: number; SO: number; SB: number; CS: number; HBP: number
  BA: number | null; OBP: number | null; SLG: number | null; OPS: number | null
}

export interface PitcherSeasonStat {
  PLR_ID: number
  PLR_NM: string
  PLR_OVRL_ABLT: number | null
  POSN_CD: string | null
  G: number; GS: number; IP_OUT: number
  H: number; HR: number; R: number; ER: number
  BB: number; SO: number; W: number; L: number
  SV: number; HLD: number
  QS: number; CG: number; SHO: number; NH: number; PG: number
  ERA: number | null; WHIP: number | null
}

export interface RosterSeasonStats {
  batters:  BatterSeasonStat[]
  pitchers: PitcherSeasonStat[]
}

export const rosterStatsApi = {
  getSeasonStats: (tmId: number, ssntYr: number) =>
    client
      .get<ApiResponse<RosterSeasonStats>>(`/roster/${tmId}/season-stats`, { params: { ssntYr } })
      .then((r) => r.data.data),
}
