import client from './client'
import type { ApiResponse } from '../types/api'
import type {
  Team, TmFinance, TmFacility, TmFacilityUpgr, TmMarket,
  FcltyUpgrCost, Stdm, StdmExpn, StdmExpnCost,
} from '../types/team'
import type { Standing } from '../types/season'

export const teamApi = {
  getAll: () =>
    client.get<ApiResponse<Team[]>>('/teams').then((r) => r.data.data),

  getOne: (tmId: number) =>
    client.get<ApiResponse<Team>>(`/teams/${tmId}`).then((r) => r.data.data),

  getFinance: (tmId: number, ssntYr: number) =>
    client.get<ApiResponse<TmFinance>>(`/teams/${tmId}/finance/${ssntYr}`).then((r) => r.data.data),

  getFinanceHistory: (tmId: number) =>
    client.get<ApiResponse<TmFinance[]>>(`/teams/${tmId}/finance-history`).then((r) => r.data.data),

  getFacilities: (tmId: number) =>
    client.get<ApiResponse<TmFacility[]>>(`/teams/${tmId}/facility`).then((r) => r.data.data),

  getFacilityUpgrades: (tmId: number) =>
    client.get<ApiResponse<TmFacilityUpgr[]>>(`/teams/${tmId}/facility-upgrades`).then((r) => r.data.data),

  getMarket: (tmId: number, ssntYr: number) =>
    client.get<ApiResponse<TmMarket>>(`/teams/${tmId}/market/${ssntYr}`).then((r) => r.data.data),

  getStandingsHistory: (tmId: number) =>
    client.get<ApiResponse<Standing[]>>(`/teams/${tmId}/standings-history`).then((r) => r.data.data),

  getFcltyUpgrCosts: (tmId: number) =>
    client.get<ApiResponse<FcltyUpgrCost[]>>(`/teams/${tmId}/facility-upgrade-costs`).then((r) => r.data.data),

  upgradeFacility: (tmId: number, fcltyTypeCd: string) =>
    client.post<ApiResponse<void>>(`/teams/${tmId}/facility-upgrade`, { fcltyTypeCd }).then((r) => r.data),

  getStadium: (tmId: number) =>
    client.get<ApiResponse<Stdm>>(`/teams/${tmId}/stadium`).then((r) => r.data.data),

  getStdmExpnHistory: (tmId: number) =>
    client.get<ApiResponse<StdmExpn[]>>(`/teams/${tmId}/stadium-expansion-history`).then((r) => r.data.data),

  getStdmExpnCosts: () =>
    client.get<ApiResponse<StdmExpnCost[]>>('/teams/stadium-expansion-costs').then((r) => r.data.data),

  expandStadium: (tmId: number, expnStep: number) =>
    client.post<ApiResponse<void>>(`/teams/${tmId}/stadium-expansion`, { expnStep }).then((r) => r.data),
}
