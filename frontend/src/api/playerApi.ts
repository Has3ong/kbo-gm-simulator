import client from './client'
import type { ApiResponse } from '../types/api'
import type {
  Player, PlrAblt, PlrPosn, PlrTrt, PlrCntrct,
  PlrCntrctHist, PlrAnslSalHist, PlrAbltSsnt, PlrAbltMon,
  PlrBatrSsntRec, PlrPtchSsntRec, PlrBatrMonRec, PlrPtchMonRec,
  PlrHideAblt, PlrFatgCond, PlrInjryHist,
} from '../types/player'

export interface PlrSearchParams {
  plrNm?: string
  reprPosnCd?: string
  plrOrgnCd?: string
  plrFrgnYn?: string
  minOvrl?: number
  maxOvrl?: number
  plrSttsCd?: string
}

export interface FrgnPlrReleaseResult {
  plrNm: string
  plrAnslSal: number
  releaseDt: string
  remainingFrgnSlots: number
}

export interface PlrGrwthLogItem {
  plrId: number
  ssntYr: number
  grwthDt: string
  grwthType: string
  abltCd: string
  abltNm: string | null
  abltValBfr: number
  abltValAft: number
  abltDiff: number
}

export const playerApi = {
  getAll: (params?: { tmId?: number; plrSttsCd?: string }) =>
    client.get<ApiResponse<Player[]>>('/players', { params }).then((r) => r.data.data),

  getOne: (plrId: number) =>
    client.get<ApiResponse<Player>>(`/players/${plrId}`).then((r) => r.data.data),

  getAbilities: (plrId: number) =>
    client.get<ApiResponse<PlrAblt[]>>(`/players/${plrId}/abilities`).then((r) => r.data.data),

  getPositions: (plrId: number) =>
    client.get<ApiResponse<PlrPosn[]>>(`/players/${plrId}/positions`).then((r) => r.data.data),

  getTraits: (plrId: number) =>
    client.get<ApiResponse<PlrTrt[]>>(`/players/${plrId}/traits`).then((r) => r.data.data),

  getContract: (plrId: number) =>
    client.get<ApiResponse<PlrCntrct>>(`/players/${plrId}/contract`).then((r) => r.data.data),

  getContractHistory: (plrId: number) =>
    client.get<ApiResponse<PlrCntrctHist[]>>(`/players/${plrId}/contract-history`).then((r) => r.data.data),

  getSalaryHistory: (plrId: number) =>
    client.get<ApiResponse<PlrAnslSalHist[]>>(`/players/${plrId}/salary-history`).then((r) => r.data.data),

  getAbilityHistory: (plrId: number) =>
    client.get<ApiResponse<PlrAbltSsnt[]>>(`/players/${plrId}/ability-history`).then((r) => r.data.data),

  getBatterSeasonStats: (plrId: number) =>
    client.get<ApiResponse<PlrBatrSsntRec[]>>(`/players/${plrId}/season-stats/batter`).then((r) => r.data.data),

  getPitcherSeasonStats: (plrId: number) =>
    client.get<ApiResponse<PlrPtchSsntRec[]>>(`/players/${plrId}/season-stats/pitcher`).then((r) => r.data.data),

  getBatterMonthlyStats: (plrId: number, ssntYr: number) =>
    client.get<ApiResponse<PlrBatrMonRec[]>>(`/players/${plrId}/monthly-stats/batter`, { params: { ssntYr } }).then((r) => r.data.data),

  getPitcherMonthlyStats: (plrId: number, ssntYr: number) =>
    client.get<ApiResponse<PlrPtchMonRec[]>>(`/players/${plrId}/monthly-stats/pitcher`, { params: { ssntYr } }).then((r) => r.data.data),

  getAbilityMonthlyHistory: (plrId: number, ssntYr: number) =>
    client.get<ApiResponse<PlrAbltMon[]>>(`/players/${plrId}/ability-history/monthly`, { params: { ssntYr } }).then((r) => r.data.data),

  getHiddenAbilities: (plrId: number) =>
    client.get<ApiResponse<PlrHideAblt[]>>(`/players/${plrId}/hidden-abilities`).then((r) => r.data.data),

  getFatgCond: (plrId: number, ssntYr: number) =>
    client.get<ApiResponse<PlrFatgCond | null>>(`/players/${plrId}/fatigue-condition`, { params: { ssntYr } }).then((r) => r.data.data),

  updateFatgCond: (plrId: number, ssntYr: number, fatg: number, cond: number) =>
    client.put<ApiResponse<void>>(`/players/${plrId}/fatigue-condition`, null, { params: { ssntYr, fatg, cond } }).then((r) => r.data),

  getInjuryHistory: (plrId: number) =>
    client.get<ApiResponse<PlrInjryHist[]>>(`/players/${plrId}/injury-history`).then((r) => r.data.data),

  editPlayer: (plrId: number, data: {
    ssntYr?: number
    fatg?: number
    cond?: number
    potAblt?: number
    abilities?: Record<string, number>
    positions?: Record<string, number>
  }) =>
    client.put<ApiResponse<void>>(`/players/${plrId}/player-edit`, data).then((r) => r.data),

  releaseForeign: (plrId: number) =>
    client.delete<ApiResponse<FrgnPlrReleaseResult>>(`/players/${plrId}/release-foreign`).then((r) => r.data.data),

  getGrowthLog: (plrId: number) =>
    client.get<ApiResponse<PlrGrwthLogItem[]>>(`/players/${plrId}/growth-log`)
      .then((r) => r.data.data),

  search: (params: PlrSearchParams) =>
    client.get<ApiResponse<Player[]>>('/players/search', { params }).then((r) => r.data.data),
}
