import { useQuery } from '@tanstack/react-query'
import { recordApi } from '../api/recordApi'

export const recordKeys = {
  batters: (params?: { ssntYr?: number; tmId?: number }) =>
    ['records', 'batters', params] as const,
  pitchers: (params?: { ssntYr?: number; tmId?: number }) =>
    ['records', 'pitchers', params] as const,
}

export function useBatterStats(params?: { ssntYr?: number; tmId?: number }) {
  return useQuery({
    queryKey: recordKeys.batters(params),
    queryFn: () => recordApi.getBatterStats(params),
  })
}

export function usePitcherStats(params?: { ssntYr?: number; tmId?: number }) {
  return useQuery({
    queryKey: recordKeys.pitchers(params),
    queryFn: () => recordApi.getPitcherStats(params),
  })
}
