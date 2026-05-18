import axios from 'axios'

export interface FanPrpnst {
  tmId: number
  fanLoyalty: number
  fanSatisfaction: number
  expectationLevel: number
  performanceSensitivity: number
  rebuildPatience: number
  starPlayerPreference: number
  franchisePlayerAttachment: number
  prospectPreference: number
  veteranPreference: number
  foreignPlayerExpectation: number
  localIdentity: number
  traditionPreference: number
  supportIntensity: number
  rivalryIntensity: number
  attendancePower: number
  merchandiseAffinity: number
  ticketPriceSensitivity: number
  seasonTicketLoyalty: number
  awayFanPower: number
  mediaAmplification: number
  criticismTendency: number
  patience: number
  emotionalVolatility: number
  offensePreference: number
  pitchingPreference: number
  defensePreference: number
  aggressiveManagementPreference: number
  currentPopularity: number
  averageAttendance: number
  seasonTicketHolders: number
  fanDiscontent: number
  demandLevel: number
}

export async function getFanPrpnstByTmId(tmId: number): Promise<FanPrpnst | null> {
  const res = await axios.get(`/api/fan-prpnst/${tmId}`)
  return res.data.data
}

export async function getAllFanPrpnst(): Promise<FanPrpnst[]> {
  const res = await axios.get('/api/fan-prpnst')
  return res.data.data
}

export async function upsertFanPrpnst(tmId: number, data: Partial<FanPrpnst>): Promise<void> {
  await axios.put(`/api/fan-prpnst/${tmId}`, data)
}
