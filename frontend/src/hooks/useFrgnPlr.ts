import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { frgnPlrApi } from '../api/frgnPlrApi'

export const frgnPlrKeys = {
  candidates: (ssntYr: number) => ['frgnPlr', 'candidates', ssntYr] as const,
  signedInfo: (ssntYr: number) => ['frgnPlr', 'signedInfo', ssntYr] as const,
}

export function useFrgnPlrCandidates(ssntYr: number) {
  return useQuery({
    queryKey: frgnPlrKeys.candidates(ssntYr),
    queryFn: () => frgnPlrApi.getCandidates(ssntYr),
    enabled: !!ssntYr,
  })
}

export function useFrgnSignedInfo(ssntYr: number) {
  return useQuery({
    queryKey: frgnPlrKeys.signedInfo(ssntYr),
    queryFn: () => frgnPlrApi.getSignedInfo(ssntYr),
    enabled: !!ssntYr,
  })
}

export function useMakeFrgnOffer(ssntYr: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ candId, offerSal }: { candId: number; offerSal: number }) =>
      frgnPlrApi.makeOffer(candId, ssntYr, offerSal),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: frgnPlrKeys.candidates(ssntYr) })
      qc.invalidateQueries({ queryKey: frgnPlrKeys.signedInfo(ssntYr) })
      qc.invalidateQueries({ queryKey: ['seasons'] })
      qc.invalidateQueries({ queryKey: ['teams'] })
      qc.invalidateQueries({ queryKey: ['players'] })
    },
  })
}

export function useStopFrgnPlr(ssntYr: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => frgnPlrApi.stop(ssntYr),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: frgnPlrKeys.candidates(ssntYr) })
      qc.invalidateQueries({ queryKey: frgnPlrKeys.signedInfo(ssntYr) })
      qc.invalidateQueries({ queryKey: ['seasons'] })
    },
  })
}
