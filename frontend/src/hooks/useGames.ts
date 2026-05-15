import { useQuery } from '@tanstack/react-query'
import { gameApi } from '../api/gameApi'

export const gameKeys = {
  all: ['games'] as const,
  filtered: (params?: { ssntYr?: number; mon?: number; gameDt?: string; tmId?: number }) =>
    ['games', params] as const,
  one: (gameId: number) => ['games', gameId] as const,
}

export function useGames(params?: { ssntYr?: number; mon?: number; gameDt?: string; tmId?: number }) {
  return useQuery({
    queryKey: gameKeys.filtered(params),
    queryFn: () => gameApi.getAll(params),
    enabled: !!(params?.ssntYr || params?.gameDt),
  })
}

export function useGame(gameId: number) {
  return useQuery({
    queryKey: gameKeys.one(gameId),
    queryFn: () => gameApi.getOne(gameId),
    enabled: !!gameId,
  })
}
