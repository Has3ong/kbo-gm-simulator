export interface Staff {
  stffId: number
  stffNm: string
  stffEngNm: string | null
  stffTypeCd: string | null
  stffTypeNm: string | null
  stffNtnlt: string | null
  stffFrgnYn: string | null
  stffBrthDt: string | null
  stffExpYr: number | null
  stffAnslSal: number | null
  stffSttsCd: string | null
  tmId: number | null
  tmKrNm: string | null
}

export interface StffAblt {
  stffId: number
  stffAbltCd: string
  stffAbltNm: string | null
  stffAbltEngNm: string | null
  stffAbltVal: number
}

export interface StffCandidateAblt {
  stffAbltCd: string
  stffAbltNm: string | null
  stffAbltVal: number
}

export interface StffCandidate {
  candId: number
  stffTypeCd: string
  stffNm: string
  stffExpYr: number
  ovrlRtg: number
  signBonus: number
  anslSal: number
  abilities: StffCandidateAblt[]
}

export interface StffHireRequest {
  mgrCandId: number | null
  coachCandIds: number[]
  renewMgr: boolean
  renewCoach: boolean
}

export interface SpringCampLocation {
  code: string
  name: string
  cost: number
  tier: number
  growthAbltCount: number
  maxGrowthPerAblt: number
}

export const STFF_TYPE_LABEL: Record<string, string> = {
  MGR: '감독',
  COACH: '코치',
  SCUT: '스카우터',
  MED: '의무·트레이너',
  ANLY: '분석가',
}
