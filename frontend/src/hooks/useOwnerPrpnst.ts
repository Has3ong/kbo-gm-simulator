import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOwnerPrpnstByTmId, getAllOwnerPrpnst, upsertOwnerPrpnst } from '../api/ownerPrpnstApi'

export function useOwnerPrpnst(tmId: number | undefined) {
  return useQuery({
    queryKey: ['ownerPrpnst', tmId],
    queryFn: () => getOwnerPrpnstByTmId(tmId!),
    enabled: tmId != null,
  })
}

export function useAllOwnerPrpnst() {
  return useQuery({
    queryKey: ['ownerPrpnst', 'all'],
    queryFn: getAllOwnerPrpnst,
  })
}

export function useUpsertOwnerPrpnst() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ tmId, data }: { tmId: number; data: Partial<import('../api/ownerPrpnstApi').OwnerPrpnst> }) =>
      upsertOwnerPrpnst(tmId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ownerPrpnst'] })
    },
  })
}
