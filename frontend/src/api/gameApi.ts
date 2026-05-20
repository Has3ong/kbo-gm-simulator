import client from './client'
import type { ApiResponse } from '../types/api'
import type { Game, GameRecords } from '../types/game'

export interface RotationPitcher {
  rotOrd: number
  plrId: number
  plrNm: string
  plrOvrlAblt: number
  vel: number
  ctl: number
  stm: number
}

export const gameApi = {
  getAll: (params?: { ssntYr?: number; mon?: number; gameDt?: string; tmId?: number }) =>
    client.get<ApiResponse<Game[]>>('/games', { params }).then((r) => r.data.data),

  getOne: (gameId: number) =>
    client.get<ApiResponse<Game>>(`/games/${gameId}`).then((r) => r.data.data),

  getRecords: (gameId: number) =>
    client.get<ApiResponse<GameRecords>>(`/games/${gameId}/records`).then((r) => r.data.data),

  getRotation: (tmId: number, ssntYr: number) =>
    client.get<ApiResponse<RotationPitcher[]>>('/games/rotation', { params: { tmId, ssntYr } })
      .then((r) => r.data.data),
}
