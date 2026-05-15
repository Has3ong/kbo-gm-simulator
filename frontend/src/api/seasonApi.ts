import client from './client'
import type { ApiResponse } from '../types/api'
import type { Season, Standing, AdvanceCheck, EventPage } from '../types/season'

export const seasonApi = {
  getAll: () =>
    client.get<ApiResponse<Season[]>>('/seasons').then((r) => r.data.data),

  getOne: (ssntYr: number) =>
    client.get<ApiResponse<Season>>(`/seasons/${ssntYr}`).then((r) => r.data.data),

  getStandings: (ssntYr: number) =>
    client.get<ApiResponse<Standing[]>>(`/seasons/${ssntYr}/standings`).then((r) => r.data.data),

  getEvents: (ssntYr: number, params?: { tmId?: number; evntTypeCd?: string; page?: number; size?: number }) =>
    client
      .get<ApiResponse<EventPage>>(`/seasons/${ssntYr}/season-reload`, { params })
      .then((r) => r.data.data),

  markEventRead: (ssntYr: number, evntId: number) =>
    client.put<ApiResponse<void>>(`/seasons/${ssntYr}/events/${evntId}/read`).then((r) => r.data),

  checkAdvance: (ssntYr: number) =>
    client.get<ApiResponse<AdvanceCheck>>(`/seasons/${ssntYr}/advance-check`).then((r) => r.data.data),

  advance: (ssntYr: number) =>
    client.post<ApiResponse<Season>>(`/seasons/${ssntYr}/advance`).then((r) => r.data.data),

  advanceToSpring: (ssntYr: number) =>
    client.post<ApiResponse<Season>>(`/seasons/${ssntYr}/advance-to-spring`).then((r) => r.data.data),

}
