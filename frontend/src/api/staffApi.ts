import client from './client'
import type { ApiResponse } from '../types/api'
import type { Staff, StffAblt, StffCandidate, StffHireRequest } from '../types/staff'

export const staffApi = {
  getAll: (params?: { tmId?: number; stffTypeCd?: string }) =>
    client.get<ApiResponse<Staff[]>>('/staffs', { params }).then((r) => r.data.data),

  getOne: (stffId: number) =>
    client.get<ApiResponse<Staff>>(`/staffs/${stffId}`).then((r) => r.data.data),

  getAbilities: (stffId: number) =>
    client.get<ApiResponse<StffAblt[]>>(`/staffs/${stffId}/abilities`).then((r) => r.data.data),

  getCurrent: () =>
    client.get<ApiResponse<Record<string, unknown[]>>>('/staffs/current').then((r) => r.data.data),

  getCandidates: () =>
    client.get<ApiResponse<Record<string, StffCandidate[]>>>('/staffs/candidates').then((r) => r.data.data),

  hire: (req: StffHireRequest) =>
    client.post<ApiResponse<void>>('/staffs/hire', req).then((r) => r.data),
}
