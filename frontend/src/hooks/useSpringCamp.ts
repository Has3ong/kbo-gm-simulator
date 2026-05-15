import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { springCampApi } from '../api/springCampApi'

export const springCampKeys = {
  locations: () => ['springCamp', 'locations'] as const,
}

export function useSpringCampLocations() {
  return useQuery({
    queryKey: springCampKeys.locations(),
    queryFn: springCampApi.getLocations,
  })
}

export function useSelectSpringCamp() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (locationCode: string) => springCampApi.select(locationCode),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['springCamp'] })
      qc.invalidateQueries({ queryKey: ['seasons'] })
      qc.invalidateQueries({ queryKey: ['teams'] })
    },
  })
}
