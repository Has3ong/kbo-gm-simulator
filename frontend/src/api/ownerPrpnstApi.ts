import axios from 'axios'

export interface OwnerPrpnst {
  tmId: number
  patience: number
  ambition: number
  financialStrictness: number
  investmentWillingness: number
  youthPreference: number
  starPreference: number
  loyaltyToGm: number
  rebuildTolerance: number
  winNowPreference: number
  analyticsPreference: number
  scoutingPreference: number
  fanPressureSensitivity: number
  mediaSensitivity: number
  localIdentityPreference: number
  veteranPreference: number
  foreignPlayerInvestment: number
  performanceOverPopularity: number
  riskTolerance: number
  facilityPreference: number
  staffInvestmentPreference: number
  currentSatisfaction: number
  firingRisk: number
  budgetFlexibility: number
  pitcherPreference: number
  batterPreference: number
}

export async function getOwnerPrpnstByTmId(tmId: number): Promise<OwnerPrpnst | null> {
  const res = await axios.get(`/api/owner-prpnst/${tmId}`)
  return res.data.data
}

export async function getAllOwnerPrpnst(): Promise<OwnerPrpnst[]> {
  const res = await axios.get('/api/owner-prpnst')
  return res.data.data
}

export async function upsertOwnerPrpnst(tmId: number, data: Partial<OwnerPrpnst>): Promise<void> {
  await axios.put(`/api/owner-prpnst/${tmId}`, data)
}
