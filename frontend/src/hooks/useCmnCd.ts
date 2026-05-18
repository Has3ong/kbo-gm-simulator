import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cmnCdApi } from '../api/cmnCdApi'
import type { CmnCd } from '../types/common'

export const cmnCdKeys = {
  all: ['cmn-codes'] as const,
  byCdId: (cdId: string) => ['cmn-codes', cdId] as const,
}

export function useAllCmnCds() {
  return useQuery({
    queryKey: cmnCdKeys.all,
    queryFn: cmnCdApi.getAll,
  })
}

export function useCmnCdsByGroup(cdId: string) {
  return useQuery({
    queryKey: cmnCdKeys.byCdId(cdId),
    queryFn: () => cmnCdApi.getByCdId(cdId),
    enabled: cdId !== '',
  })
}

export function useUpdateCmnCd() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ cdId, cdVal, data }: {
      cdId: string
      cdVal: string
      data: Partial<Pick<CmnCd, 'cdNm' | 'cdEngNm' | 'cdDesc'>>
    }) => cmnCdApi.update(cdId, cdVal, data),
    onSuccess: (_result, { cdId }) => {
      qc.invalidateQueries({ queryKey: cmnCdKeys.byCdId(cdId) })
    },
  })
}

export function useCreateCmnCd() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CmnCd) => cmnCdApi.create(data),
    onSuccess: (_result, data) => {
      qc.invalidateQueries({ queryKey: cmnCdKeys.byCdId(data.cdId) })
      qc.invalidateQueries({ queryKey: cmnCdKeys.all })
    },
  })
}

export function useDeleteCmnCd() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ cdId, cdVal }: { cdId: string; cdVal: string }) =>
      cmnCdApi.delete(cdId, cdVal),
    onSuccess: (_result, { cdId }) => {
      qc.invalidateQueries({ queryKey: cmnCdKeys.byCdId(cdId) })
      qc.invalidateQueries({ queryKey: cmnCdKeys.all })
    },
  })
}
