import { useQuery } from '@tanstack/react-query'
import { rosterStatsApi } from '../api/rosterApi'

export const rosterStatsKeys = {
  all: (tmId: number, ssntYr: number) => ['rosterStats', tmId, ssntYr] as const,
}

export function useRosterStats(tmId: number | undefined, ssntYr: number) {
  return useQuery({
    queryKey: rosterStatsKeys.all(tmId ?? 0, ssntYr),
    queryFn: () => rosterStatsApi.getSeasonStats(tmId!, ssntYr),
    enabled: !!tmId,
    staleTime: 30_000,
  })
}
