import { useMutation, useQuery } from '@tanstack/react-query'
import { rosterConfirmApi } from '../api/rosterApi'
import type { RosterConfirmRequest } from '../types/roster'

export function useRosterData() {
  return useQuery({
    queryKey: ['rosterConfirm', 'data'],
    queryFn: rosterConfirmApi.getRosterData,
  })
}

export function useConfirmRoster() {
  return useMutation({
    mutationFn: (req: RosterConfirmRequest) => rosterConfirmApi.confirm(req),
  })
}
