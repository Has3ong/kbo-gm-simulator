import client from './client'
import type { ApiResponse } from '../types/api'
import type { SpringCampLocation } from '../types/staff'

export const springCampApi = {
  getLocations: () =>
    client.get<ApiResponse<SpringCampLocation[]>>('/spring-camp/locations').then((r) => r.data.data),

  select: (locationCode: string) =>
    client.post<ApiResponse<void>>(`/spring-camp/select?locationCode=${locationCode}`).then((r) => r.data),
}
