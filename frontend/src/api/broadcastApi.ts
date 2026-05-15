import client from './client'
import type { ApiResponse } from '../types/api'
import type { BrdcstSpnsr } from '../types/broadcast'

export const broadcastApi = {
  getAll: () =>
    client.get<ApiResponse<BrdcstSpnsr[]>>('/broadcast-sponsors').then((r) => r.data.data),

  getCurrent: () =>
    client.get<ApiResponse<BrdcstSpnsr | null>>('/broadcast-sponsors/current').then((r) => r.data.data),

  select: (brdcstCd: string) =>
    client.post<ApiResponse<null>>('/broadcast-sponsors/select', { brdcstCd }).then((r) => r.data),

  deleteCurrent: () =>
    client.delete<ApiResponse<null>>('/broadcast-sponsors/current').then((r) => r.data),
}
