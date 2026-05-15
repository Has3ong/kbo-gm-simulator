import { useQuery } from '@tanstack/react-query'
import { rosterApi } from '../api/rosterApi'

export function useRoster(tmId: number | undefined, ssntYr: number) {
  return useQuery({
    queryKey: ['roster', tmId, ssntYr],
    queryFn: () => rosterApi.getRoster(tmId!, ssntYr),
    enabled: !!tmId && !!ssntYr,
  })
}
