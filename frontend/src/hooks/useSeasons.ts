import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { seasonApi } from '../api/seasonApi'

export const seasonKeys = {
  all: ['seasons'] as const,
  one: (ssntYr: number) => ['seasons', ssntYr] as const,
  standings: (ssntYr: number) => ['seasons', ssntYr, 'standings'] as const,
  events: (ssntYr: number, params?: { tmId?: number; evntTypeCd?: string; page?: number; size?: number }) =>
    ['seasons', ssntYr, 'events', params] as const,
  advanceCheck: (ssntYr: number) => ['seasons', ssntYr, 'advance-check'] as const,
}

export function useSeasons() {
  return useQuery({
    queryKey: seasonKeys.all,
    queryFn: () => seasonApi.getAll(),
  })
}

export function useSeason(ssntYr: number) {
  return useQuery({
    queryKey: seasonKeys.one(ssntYr),
    queryFn: () => seasonApi.getOne(ssntYr),
    enabled: !!ssntYr,
  })
}

export function useStandings(ssntYr: number) {
  return useQuery({
    queryKey: seasonKeys.standings(ssntYr),
    queryFn: () => seasonApi.getStandings(ssntYr),
    enabled: !!ssntYr,
  })
}

export function useSeasonEvents(ssntYr: number, page: number, size = 20) {
  const params = { page, size }
  return useQuery({
    queryKey: seasonKeys.events(ssntYr, params),
    queryFn: () => seasonApi.getEvents(ssntYr, params),
    enabled: !!ssntYr,
    placeholderData: (prev) => prev,
  })
}

export function useMarkEventRead(ssntYr: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (evntId: number) => seasonApi.markEventRead(ssntYr, evntId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: seasonKeys.events(ssntYr) })
    },
  })
}

export function useAdvanceCheck(ssntYr: number) {
  return useQuery({
    queryKey: seasonKeys.advanceCheck(ssntYr),
    queryFn: () => seasonApi.checkAdvance(ssntYr),
    enabled: !!ssntYr,
    refetchInterval: 5000,
  })
}

export function useAdvanceSeason(ssntYr: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => seasonApi.advance(ssntYr),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: seasonKeys.one(ssntYr) })
      qc.invalidateQueries({ queryKey: seasonKeys.advanceCheck(ssntYr) })
      qc.invalidateQueries({ queryKey: seasonKeys.events(ssntYr) })
    },
  })
}

export function useAdvanceToSpring(ssntYr: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => seasonApi.advanceToSpring(ssntYr),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: seasonKeys.one(ssntYr) })
      qc.invalidateQueries({ queryKey: seasonKeys.advanceCheck(ssntYr) })
    },
  })
}
