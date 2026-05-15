import client from './client'

export const frgnPlrApi = {
  getCandidates: (ssntYr: number) =>
    client.get(`/frgn-plr/candidates?ssntYr=${ssntYr}`).then((r) => r.data.data),
  getSignedInfo: (ssntYr: number) =>
    client.get(`/frgn-plr/signed-info?ssntYr=${ssntYr}`).then((r) => r.data.data as { signedCnt: number; maxFrgnPlr: number }),
  makeOffer: (candId: number, ssntYr: number, offerSal: number) =>
    client
      .post(`/frgn-plr/offer?candId=${candId}&ssntYr=${ssntYr}&offerSal=${offerSal}`)
      .then((r) => r.data),
  stop: (ssntYr: number) =>
    client.post(`/frgn-plr/stop?ssntYr=${ssntYr}`).then((r) => r.data),
}
