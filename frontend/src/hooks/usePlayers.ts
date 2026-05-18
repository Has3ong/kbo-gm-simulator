import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { playerApi, type PlrSearchParams } from '../api/playerApi'

export const playerKeys = {
  injuryHistory: (plrId: number) => ['players', plrId, 'injury-history'] as const,
  growthLog: (plrId: number) => ['player', plrId, 'growth-log'] as const,
  all: ['players'] as const,
  filtered: (params?: { tmId?: number; plrSttsCd?: string }) => ['players', params] as const,
  one: (plrId: number) => ['players', plrId] as const,
  abilities: (plrId: number) => ['players', plrId, 'abilities'] as const,
  positions: (plrId: number) => ['players', plrId, 'positions'] as const,
  traits: (plrId: number) => ['players', plrId, 'traits'] as const,
  contract: (plrId: number) => ['players', plrId, 'contract'] as const,
  contractHistory: (plrId: number) => ['players', plrId, 'contract-history'] as const,
  salaryHistory: (plrId: number) => ['players', plrId, 'salary-history'] as const,
  abilityHistory: (plrId: number) => ['players', plrId, 'ability-history'] as const,
  abilityMonthlyHistory: (plrId: number, ssntYr: number) => ['players', plrId, 'ability-history', 'monthly', ssntYr] as const,
  batterSeasonStats: (plrId: number) => ['players', plrId, 'season-stats', 'batter'] as const,
  pitcherSeasonStats: (plrId: number) => ['players', plrId, 'season-stats', 'pitcher'] as const,
  batterMonthlyStats: (plrId: number, ssntYr: number) => ['players', plrId, 'monthly-stats', 'batter', ssntYr] as const,
  pitcherMonthlyStats: (plrId: number, ssntYr: number) => ['players', plrId, 'monthly-stats', 'pitcher', ssntYr] as const,
  hiddenAbilities: (plrId: number) => ['players', plrId, 'hidden-abilities'] as const,
  fatgCond: (plrId: number, ssntYr: number) => ['players', plrId, 'fatigue-condition', ssntYr] as const,
}

export function usePlayers(params?: { tmId?: number; plrSttsCd?: string }) {
  return useQuery({
    queryKey: playerKeys.filtered(params),
    queryFn: () => playerApi.getAll(params),
  })
}

export function usePlayer(plrId: number) {
  return useQuery({
    queryKey: playerKeys.one(plrId),
    queryFn: () => playerApi.getOne(plrId),
    enabled: !!plrId,
  })
}

export function usePlrAbilities(plrId: number) {
  return useQuery({
    queryKey: playerKeys.abilities(plrId),
    queryFn: () => playerApi.getAbilities(plrId),
    enabled: !!plrId,
  })
}

export function usePlrPositions(plrId: number) {
  return useQuery({
    queryKey: playerKeys.positions(plrId),
    queryFn: () => playerApi.getPositions(plrId),
    enabled: !!plrId,
  })
}

export function usePlrTraits(plrId: number) {
  return useQuery({
    queryKey: playerKeys.traits(plrId),
    queryFn: () => playerApi.getTraits(plrId),
    enabled: !!plrId,
  })
}

export function usePlrContract(plrId: number) {
  return useQuery({
    queryKey: playerKeys.contract(plrId),
    queryFn: () => playerApi.getContract(plrId),
    enabled: !!plrId,
  })
}

export function usePlrContractHistory(plrId: number) {
  return useQuery({
    queryKey: playerKeys.contractHistory(plrId),
    queryFn: () => playerApi.getContractHistory(plrId),
    enabled: !!plrId,
  })
}

export function usePlrSalaryHistory(plrId: number) {
  return useQuery({
    queryKey: playerKeys.salaryHistory(plrId),
    queryFn: () => playerApi.getSalaryHistory(plrId),
    enabled: !!plrId,
  })
}

export function usePlrAbilityHistory(plrId: number) {
  return useQuery({
    queryKey: playerKeys.abilityHistory(plrId),
    queryFn: () => playerApi.getAbilityHistory(plrId),
    enabled: !!plrId,
  })
}

export function usePlrBatterSeasonStats(plrId: number) {
  return useQuery({
    queryKey: playerKeys.batterSeasonStats(plrId),
    queryFn: () => playerApi.getBatterSeasonStats(plrId),
    enabled: !!plrId,
  })
}

export function usePlrPitcherSeasonStats(plrId: number) {
  return useQuery({
    queryKey: playerKeys.pitcherSeasonStats(plrId),
    queryFn: () => playerApi.getPitcherSeasonStats(plrId),
    enabled: !!plrId,
  })
}

export function usePlrBatterMonthlyStats(plrId: number, ssntYr: number) {
  return useQuery({
    queryKey: playerKeys.batterMonthlyStats(plrId, ssntYr),
    queryFn: () => playerApi.getBatterMonthlyStats(plrId, ssntYr),
    enabled: !!plrId && !!ssntYr,
  })
}

export function usePlrPitcherMonthlyStats(plrId: number, ssntYr: number) {
  return useQuery({
    queryKey: playerKeys.pitcherMonthlyStats(plrId, ssntYr),
    queryFn: () => playerApi.getPitcherMonthlyStats(plrId, ssntYr),
    enabled: !!plrId && !!ssntYr,
  })
}

export function usePlrAbilityMonthlyHistory(plrId: number, ssntYr: number) {
  return useQuery({
    queryKey: playerKeys.abilityMonthlyHistory(plrId, ssntYr),
    queryFn: () => playerApi.getAbilityMonthlyHistory(plrId, ssntYr),
    enabled: !!plrId && !!ssntYr,
  })
}

export function usePlrHiddenAbilities(plrId: number) {
  return useQuery({
    queryKey: playerKeys.hiddenAbilities(plrId),
    queryFn: () => playerApi.getHiddenAbilities(plrId),
    enabled: !!plrId,
  })
}

export function usePlrFatgCond(plrId: number, ssntYr: number) {
  return useQuery({
    queryKey: playerKeys.fatgCond(plrId, ssntYr),
    queryFn: () => playerApi.getFatgCond(plrId, ssntYr),
    enabled: !!plrId && !!ssntYr,
  })
}

export function usePlrInjuryHistory(plrId: number) {
  return useQuery({
    queryKey: playerKeys.injuryHistory(plrId),
    queryFn: () => playerApi.getInjuryHistory(plrId),
    enabled: !!plrId,
  })
}

export function useUpdateFatgCond() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ plrId, ssntYr, fatg, cond }: { plrId: number; ssntYr: number; fatg: number; cond: number }) =>
      playerApi.updateFatgCond(plrId, ssntYr, fatg, cond),
    onSuccess: (_, { plrId, ssntYr }) => {
      qc.invalidateQueries({ queryKey: playerKeys.fatgCond(plrId, ssntYr) })
    },
  })
}

export function usePlrEdit(plrId: number, onSuccess?: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof playerApi.editPlayer>[1]) =>
      playerApi.editPlayer(plrId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['players', plrId] })
      qc.invalidateQueries({ queryKey: ['players'] })
      qc.invalidateQueries({ queryKey: ['teams'] })
      onSuccess?.()
    },
  })
}

export function usePlrGrowthLog(plrId: number) {
  return useQuery({
    queryKey: playerKeys.growthLog(plrId),
    queryFn: () => playerApi.getGrowthLog(plrId),
    enabled: plrId > 0,
  })
}

export function usePlayerSearch(params: PlrSearchParams, enabled = true) {
  return useQuery({
    queryKey: ['players', 'search', params],
    queryFn: () => playerApi.search(params),
    enabled,
  })
}

export function useReleaseForeignPlayer(plrId: number, onSuccess?: (data: import('../api/playerApi').FrgnPlrReleaseResult) => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => playerApi.releaseForeign(plrId),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['players'] })
      qc.invalidateQueries({ queryKey: ['teams'] })
      qc.invalidateQueries({ queryKey: ['seasons'] })
      qc.invalidateQueries({ queryKey: ['frgnPlr'] })
      qc.invalidateQueries({ queryKey: ['rosterConfirm'] })
      onSuccess?.(data)
    },
  })
}
