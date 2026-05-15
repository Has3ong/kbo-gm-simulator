import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { rosterConfirmApi } from '../api/rosterApi'
import type { RosterConfirmRequest } from '../types/roster'

export function useRosterData() {
  return useQuery({
    queryKey: ['rosterConfirm', 'data'],
    queryFn: rosterConfirmApi.getRosterData,
  })
}

export function useConfirmRoster() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: RosterConfirmRequest) => rosterConfirmApi.confirm(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rosterConfirm'] })
      qc.invalidateQueries({ queryKey: ['roster'] })
      qc.invalidateQueries({ queryKey: ['seasons'] })
      qc.invalidateQueries({ queryKey: ['players'] })
      qc.invalidateQueries({ queryKey: ['teams'] })
    },
  })
}
