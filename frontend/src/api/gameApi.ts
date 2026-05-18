import client from './client'
import type { ApiResponse } from '../types/api'
import type { Game, GameRecords } from '../types/game'

export const gameApi = {
  getAll: (params?: { ssntYr?: number; mon?: number; gameDt?: string; tmId?: number }) =>
    client.get<ApiResponse<Game[]>>('/games', { params }).then((r) => r.data.data),

  getOne: (gameId: number) =>
    client.get<ApiResponse<Game>>(`/games/${gameId}`).then((r) => r.data.data),

  getRecords: (gameId: number) =>
    client.get<ApiResponse<GameRecords>>(`/games/${gameId}/records`).then((r) => r.data.data),
}
