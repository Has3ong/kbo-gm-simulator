import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFanPrpnstByTmId, getAllFanPrpnst, upsertFanPrpnst } from '../api/fanPrpnstApi'

export function useFanPrpnst(tmId: number | undefined) {
  return useQuery({
    queryKey: ['fanPrpnst', tmId],
    queryFn: () => getFanPrpnstByTmId(tmId!),
    enabled: tmId != null,
  })
}

export function useAllFanPrpnst() {
  return useQuery({
    queryKey: ['fanPrpnst', 'all'],
    queryFn: getAllFanPrpnst,
  })
}

export function useUpsertFanPrpnst() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ tmId, data }: { tmId: number; data: Partial<import('../api/fanPrpnstApi').FanPrpnst> }) =>
      upsertFanPrpnst(tmId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fanPrpnst'] })
    },
  })
}
