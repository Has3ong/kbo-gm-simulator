import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { staffApi } from '../api/staffApi'
import type { StffHireRequest } from '../types/staff'

export const staffHireKeys = {
  current: () => ['staffHire', 'current'] as const,
  candidates: () => ['staffHire', 'candidates'] as const,
}

export function useCurrentStaff(enabled = true) {
  return useQuery<Record<string, unknown[]>>({
    queryKey: staffHireKeys.current(),
    queryFn: staffApi.getCurrent,
    enabled,
  })
}

export function useStaffCandidates(enabled = true) {
  return useQuery({
    queryKey: staffHireKeys.candidates(),
    queryFn: staffApi.getCandidates,
    enabled,
    staleTime: 0,
  })
}

export function useHireStaff() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (req: StffHireRequest) => staffApi.hire(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['staffHire'] })
      qc.invalidateQueries({ queryKey: ['staffs'] })
      qc.invalidateQueries({ queryKey: ['seasons'] })
      qc.invalidateQueries({ queryKey: ['teams'] })
    },
  })
}
