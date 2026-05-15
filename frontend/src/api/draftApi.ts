import client from './client'
import type { DraftInfo, DraftPlayer, DraftOrder } from '../types/draft'

const wrap = <T>(res: { data: T }) => res.data

export const draftApi = {
  getByYear: (ssntYr: number, userTmId: number) =>
    client.get<{ data: DraftInfo }>(`/draft/${ssntYr}`, { params: { userTmId } }).then(r => wrap(r.data)),

  create: (ssntYr: number, userTmId: number) =>
    client.post<{ data: DraftInfo }>(`/draft`, null, { params: { ssntYr, userTmId } }).then(r => wrap(r.data)),

  generatePool: (drftId: number, userTmId: number) =>
    client.post<{ data: DraftInfo }>(`/draft/${drftId}/generate`, null, { params: { userTmId } }).then(r => wrap(r.data)),

  start: (drftId: number, userTmId: number) =>
    client.post<{ data: DraftInfo }>(`/draft/${drftId}/start`, null, { params: { userTmId } }).then(r => wrap(r.data)),

  getPlayers: (drftId: number, tmId: number) =>
    client.get<{ data: DraftPlayer[] }>(`/draft/${drftId}/players`, { params: { tmId } }).then(r => wrap(r.data)),

  getOrder: (drftId: number) =>
    client.get<{ data: DraftOrder[] }>(`/draft/${drftId}/order`).then(r => wrap(r.data)),

  pick: (drftId: number, userTmId: number, drftPlrId: number) =>
    client.post<{ data: DraftOrder }>(`/draft/${drftId}/pick`, { drftPlrId }, { params: { userTmId } }).then(r => wrap(r.data)),

  simulate: (drftId: number, userTmId: number) =>
    client.post<{ data: DraftOrder[] }>(`/draft/${drftId}/simulate`, null, { params: { userTmId } }).then(r => wrap(r.data)),

  updateBoard: (drftId: number, drftPlrId: number, tmId: number, data: { prioOrd: number; doNotPick: string; memo: string }) =>
    client.put<{ data: void }>(`/draft/${drftId}/board/${drftPlrId}`, data, { params: { tmId } }).then(() => undefined),
}
