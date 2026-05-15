import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { teamApi } from '../api/teamApi'

export const teamKeys = {
  all: ['teams'] as const,
  one: (tmId: number) => ['teams', tmId] as const,
  finance: (tmId: number, ssntYr: number) => ['teams', tmId, 'finance', ssntYr] as const,
  financeHistory: (tmId: number) => ['teams', tmId, 'finance-history'] as const,
  facilities: (tmId: number) => ['teams', tmId, 'facility'] as const,
  facilityUpgrades: (tmId: number) => ['teams', tmId, 'facility-upgrades'] as const,
  fcltyUpgrCosts: (tmId: number) => ['teams', tmId, 'facility-upgrade-costs'] as const,
  market: (tmId: number, ssntYr: number) => ['teams', tmId, 'market', ssntYr] as const,
  standingsHistory: (tmId: number) => ['teams', tmId, 'standings-history'] as const,
  stadium: (tmId: number) => ['teams', tmId, 'stadium'] as const,
  stdmExpnHistory: (tmId: number) => ['teams', tmId, 'stadium-expansion-history'] as const,
  stdmExpnCosts: ['teams', 'stadium-expansion-costs'] as const,
}

export function useTeams() {
  return useQuery({
    queryKey: teamKeys.all,
    queryFn: () => teamApi.getAll(),
  })
}

export function useTeam(tmId: number) {
  return useQuery({
    queryKey: teamKeys.one(tmId),
    queryFn: () => teamApi.getOne(tmId),
    enabled: !!tmId,
  })
}

export function useTeamFinance(tmId: number, ssntYr: number) {
  return useQuery({
    queryKey: teamKeys.finance(tmId, ssntYr),
    queryFn: () => teamApi.getFinance(tmId, ssntYr),
    enabled: !!tmId && !!ssntYr,
  })
}

export function useTeamFinanceHistory(tmId: number) {
  return useQuery({
    queryKey: teamKeys.financeHistory(tmId),
    queryFn: () => teamApi.getFinanceHistory(tmId),
    enabled: !!tmId,
  })
}

export function useTeamFacilities(tmId: number) {
  return useQuery({
    queryKey: teamKeys.facilities(tmId),
    queryFn: () => teamApi.getFacilities(tmId),
    enabled: !!tmId,
  })
}

export function useTeamFacilityUpgrades(tmId: number) {
  return useQuery({
    queryKey: teamKeys.facilityUpgrades(tmId),
    queryFn: () => teamApi.getFacilityUpgrades(tmId),
    enabled: !!tmId,
  })
}

export function useFcltyUpgrCosts(tmId: number) {
  return useQuery({
    queryKey: teamKeys.fcltyUpgrCosts(tmId),
    queryFn: () => teamApi.getFcltyUpgrCosts(tmId),
    enabled: !!tmId,
  })
}

export function useUpgradeFacility(tmId: number, onSuccess?: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (fcltyTypeCd: string) => teamApi.upgradeFacility(tmId, fcltyTypeCd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams', tmId] })
      qc.invalidateQueries({ queryKey: ['seasons'] })
      onSuccess?.()
    },
  })
}

export function useTeamMarket(tmId: number, ssntYr: number) {
  return useQuery({
    queryKey: teamKeys.market(tmId, ssntYr),
    queryFn: () => teamApi.getMarket(tmId, ssntYr),
    enabled: !!tmId && !!ssntYr,
  })
}

export function useTeamStandingsHistory(tmId: number) {
  return useQuery({
    queryKey: teamKeys.standingsHistory(tmId),
    queryFn: () => teamApi.getStandingsHistory(tmId),
    enabled: !!tmId,
  })
}

export function useTeamStadium(tmId: number) {
  return useQuery({
    queryKey: teamKeys.stadium(tmId),
    queryFn: () => teamApi.getStadium(tmId),
    enabled: !!tmId,
  })
}

export function useStdmExpnHistory(tmId: number) {
  return useQuery({
    queryKey: teamKeys.stdmExpnHistory(tmId),
    queryFn: () => teamApi.getStdmExpnHistory(tmId),
    enabled: !!tmId,
  })
}

export function useStdmExpnCosts() {
  return useQuery({
    queryKey: teamKeys.stdmExpnCosts,
    queryFn: () => teamApi.getStdmExpnCosts(),
  })
}

export function useExpandStadium(tmId: number, onSuccess?: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (expnStep: number) => teamApi.expandStadium(tmId, expnStep),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teams', tmId] })
      qc.invalidateQueries({ queryKey: ['seasons'] })
      onSuccess?.()
    },
  })
}
