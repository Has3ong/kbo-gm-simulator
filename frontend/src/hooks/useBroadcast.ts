import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { broadcastApi } from '../api/broadcastApi'

export const broadcastKeys = {
  all: ['broadcast-sponsors'] as const,
  current: ['broadcast-sponsors', 'current'] as const,
}

export function useBrdcstSpnsrs() {
  return useQuery({
    queryKey: broadcastKeys.all,
    queryFn: broadcastApi.getAll,
  })
}

export function useCurrentBrdcstSpnsr() {
  return useQuery({
    queryKey: broadcastKeys.current,
    queryFn: broadcastApi.getCurrent,
  })
}

export function useSelectBrdcstSpnsr(onSuccess?: () => void) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (brdcstCd: string) => broadcastApi.select(brdcstCd),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: broadcastKeys.current })
      onSuccess?.()
    },
  })
}
