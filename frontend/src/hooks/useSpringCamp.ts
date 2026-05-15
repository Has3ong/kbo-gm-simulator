import { useQuery, useMutation } from '@tanstack/react-query'
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
  return useMutation({
    mutationFn: (locationCode: string) => springCampApi.select(locationCode),
  })
}
