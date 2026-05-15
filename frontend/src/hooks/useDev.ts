import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { devApi } from '../api/devApi'
import type { FcltyCostRow } from '../api/devApi'

export const devKeys = {
  fcltyCosts: ['dev', 'facility-costs'] as const,
}

export function useFcltyCosts() {
  return useQuery({
    queryKey: devKeys.fcltyCosts,
    queryFn: devApi.getFcltyCosts,
  })
}

export function useUpdateFcltyCosts() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (rows: FcltyCostRow[]) => devApi.updateFcltyCosts(rows),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: devKeys.fcltyCosts })
    },
  })
}
