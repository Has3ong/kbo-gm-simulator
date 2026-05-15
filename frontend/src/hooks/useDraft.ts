import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { draftApi } from '../api/draftApi'

export const draftKeys = {
  byYear: (yr: number) => ['draft', yr] as const,
  players: (drftId: number, tmId: number) => ['draft', drftId, 'players', tmId] as const,
  order: (drftId: number) => ['draft', drftId, 'order'] as const,
}

export function useDraftByYear(ssntYr: number, userTmId: number) {
  return useQuery({
    queryKey: draftKeys.byYear(ssntYr),
    queryFn: () => draftApi.getByYear(ssntYr, userTmId),
    retry: false,
  })
}

export function useDraftPlayers(drftId: number | undefined, tmId: number) {
  return useQuery({
    queryKey: draftKeys.players(drftId ?? 0, tmId),
    queryFn: () => draftApi.getPlayers(drftId!, tmId),
    enabled: !!drftId,
  })
}

export function useDraftOrder(drftId: number | undefined) {
  return useQuery({
    queryKey: draftKeys.order(drftId ?? 0),
    queryFn: () => draftApi.getOrder(drftId!),
    enabled: !!drftId,
  })
}

export function useCreateDraft(ssntYr: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userTmId: number) => draftApi.create(ssntYr, userTmId),
    onSuccess: () => qc.invalidateQueries({ queryKey: draftKeys.byYear(ssntYr) }),
  })
}

export function useGeneratePool(ssntYr: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ drftId, userTmId }: { drftId: number; userTmId: number }) =>
      draftApi.generatePool(drftId, userTmId),
    onSuccess: () => qc.invalidateQueries({ queryKey: draftKeys.byYear(ssntYr) }),
  })
}

export function useStartDraft(ssntYr: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ drftId, userTmId }: { drftId: number; userTmId: number }) =>
      draftApi.start(drftId, userTmId),
    onSuccess: () => qc.invalidateQueries({ queryKey: draftKeys.byYear(ssntYr) }),
  })
}

export function usePick(drftId: number, ssntYr: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userTmId, drftPlrId }: { userTmId: number; drftPlrId: number }) =>
      draftApi.pick(drftId, userTmId, drftPlrId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: draftKeys.byYear(ssntYr) })
      qc.invalidateQueries({ queryKey: ['draft', drftId] })
    },
  })
}

export function useSimulate(drftId: number, ssntYr: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userTmId: number) => draftApi.simulate(drftId, userTmId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: draftKeys.byYear(ssntYr) })
      qc.invalidateQueries({ queryKey: ['draft', drftId] })
    },
  })
}
