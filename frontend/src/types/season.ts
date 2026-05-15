export interface Season {
  ssntYr: number
  ssntSttsCd: string | null
  ssntSttsNm: string | null
  ssntBgngDt: string | null
  regSsntBgngDt: string | null
  regSsntEndDt: string | null
  pstssntBgngDt: string | null
  pstssntEndDt: string | null
  ssntEndDt: string | null
  curDt: string | null
}

export interface Standing {
  tmId: number
  tmKrNm: string
  tmShrtKrNm: string | null
  ssntYr: number
  w: number
  l: number
  t: number
  pct: number | null
  gb: number | null
  homeW: number | null
  homeL: number | null
  awayW: number | null
  awayL: number | null
  rs: number | null
  ra: number | null
  runDiff: number | null
  strkType: string | null
  strkCnt: number | null
  l10W: number | null
  l10L: number | null
  l10T: number | null
  stndRnk: number | null
  tmMorl: number | null
  fanStsfctn: number | null
  ownStsfctn: number | null
  pstssntStts: string | null
}

export interface SeasonEvent {
  evntId: number
  ssntYr: number
  evntDt: string
  tmId: number | null
  tmKrNm: string | null
  plrId: number | null
  plrNm: string | null
  evntTypeCd: string
  evntTypeNm: string | null
  evntTtlt: string
  evntCnts: string | null
  rdYn: string
}

export interface EventPage {
  content: SeasonEvent[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface AdvanceCheck {
  canAdvance: boolean
  broadcasterSelected: boolean
  stffHired: boolean
  springCampDone: boolean
  springCampRequired: boolean
  rosterConfirmed: boolean
  incompleteGamesCount: number
  currentDate: string | null
  frgnPlrExceeded?: boolean
}

export const SSNT_STTS_LABEL: Record<string, string> = {
  PRE: '프리시즌',
  REG: '정규시즌',
  POST: '포스트시즌',
  OFF: '오프시즌',
  CMPL: '완료',
}

export const PSTSSNT_STTS_LABEL: Record<string, string> = {
  UNDC: '미결정',
  ELIM: '탈락',
  CLWC: '와일드카드 확정',
  CLPS: '포스트시즌 확정',
  CL1P: '1위 확정',
  CHMP: '우승',
}
