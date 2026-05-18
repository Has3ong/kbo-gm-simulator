import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { springCampCfgApi, type SpringCampCfg } from '../api/springCampCfgApi'

const QUERY_KEY = ['spring-camp-cfg'] as const

export function useSpringCampCfg() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: springCampCfgApi.getAll,
  })
}

export function useUpdateSpringCampCfg() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ campCd, data }: { campCd: string; data: SpringCampCfg }) =>
      springCampCfgApi.update(campCd, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })
}
