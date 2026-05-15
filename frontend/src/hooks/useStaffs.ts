import { useQuery } from '@tanstack/react-query'
import { staffApi } from '../api/staffApi'

export const staffKeys = {
  all: ['staffs'] as const,
  filtered: (params?: { tmId?: number; stffTypeCd?: string }) => ['staffs', params] as const,
  one: (stffId: number) => ['staffs', stffId] as const,
  abilities: (stffId: number) => ['staffs', stffId, 'abilities'] as const,
}

export function useStaffs(params?: { tmId?: number; stffTypeCd?: string }) {
  return useQuery({
    queryKey: staffKeys.filtered(params),
    queryFn: () => staffApi.getAll(params),
  })
}

export function useStaff(stffId: number) {
  return useQuery({
    queryKey: staffKeys.one(stffId),
    queryFn: () => staffApi.getOne(stffId),
    enabled: !!stffId,
  })
}

export function useStffAbilities(stffId: number) {
  return useQuery({
    queryKey: staffKeys.abilities(stffId),
    queryFn: () => staffApi.getAbilities(stffId),
    enabled: !!stffId,
  })
}
