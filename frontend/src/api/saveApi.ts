import client from './client'

export function deleteSaveData(ssntYr: number) {
  return client.delete(`/saves/${ssntYr}`)
}
