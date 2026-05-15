import { useQuery } from '@tanstack/react-query'
import client from '../api/client'

export interface SpringCampGrowthRow {
  plrId: number
  plrNm: string
  grwthDt: string
  abltCd: string
  abltValBfr: number
  abltValAft: number
  delta: number
}

export function useSpringCampGrowth(ssntYr: number, enabled: boolean) {
  return useQuery<SpringCampGrowthRow[]>({
    queryKey: ['springCampGrowth', ssntYr],
    queryFn: () =>
      client.get(`/seasons/${ssntYr}/spring-camp-growth`).then((r) => r.data.data),
    enabled,
  })
}
