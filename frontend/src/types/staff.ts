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
  MGR:   '감독',
  HCCH:  '수석코치',
  COACH: '코치',
  SCUT:  '스카우터',
  MED:   '팀닥터',
  SCI:   '스포츠과학자',
  YUTH:  '유소년코치',
  ANLY:  '데이터분석가',
}
