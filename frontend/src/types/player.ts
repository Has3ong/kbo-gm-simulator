export interface Player {
  plrId: number
  plrNm: string
  plrEngNm: string | null
  plrHgt: number | null
  plrWgt: number | null
  plrBatPtchHandCd: string | null
  plrAnslSal: number | null
  plrNtnlt: string | null
  plrFrgnYn: string | null
  plrSttsCd: string | null
  plrOvrlAblt: number | null
  plrPotAblt: number | null
  tmId: number | null
  tmKrNm: string | null
  tmShrtKrNm: string | null
  reprPosnCd: string | null
  reprPosnNm: string | null
}

export interface PlrAblt {
  plrId: number
  abltCd: string
  abltNm: string | null
  abltEngNm: string | null
  abltVal: number
  abltGrade: string
}

export interface PlrPosn {
  plrId: number
  posnCd: string
  posnNm: string | null
  posnPrfcAblt: number
  posnPrfcGrade: string
}

export interface PlrTrt {
  plrId: number
  trtCd: string
  trtNm: string | null
  trtEngNm: string | null
  trtDesc: string | null
}

export interface PlrCntrct {
  plrId: number
  tmId: number | null
  tmKrNm: string | null
  faCntrctBgngDt: string | null
  faCntrctEndDt: string | null
  faAmt: number | null
  reprPosnCd: string | null
  cntrctTypeCd: string | null
  cntrctTypeNm: string | null
}

export interface PlrCntrctHist {
  plrId: number
  tmId: number | null
  tmKrNm: string | null
  histSeq: number
  histDt: string | null
  faCntrctBgngDt: string | null
  faCntrctEndDt: string | null
  faAmt: number | null
  reprPosnCd: string | null
  cntrctTypeCd: string | null
  cntrctTypeNm: string | null
}

export interface PlrAnslSalHist {
  plrId: number
  ssntYr: number
  anslSal: number
}

export interface PlrAbltSsnt {
  plrId: number
  ssntYr: number
  abltCd: string
  abltNm: string | null
  abltVal: number
  abltGrade: string
}

export interface PlrBatrSsntRec {
  plrId: number
  ssntYr: number
  tmId: number | null
  tmKrNm: string | null
  tmShrtEngNm: string | null
  g: number
  pa: number
  ab: number
  h: number
  dobl: number
  trpl: number
  hr: number
  rbi: number
  r: number
  bb: number
  so: number
  sb: number
  cs: number
  hbp: number
  ba: number | null
  obp: number | null
  slg: number | null
  ops: number | null
}

export interface PlrPtchSsntRec {
  plrId: number
  ssntYr: number
  tmId: number | null
  tmKrNm: string | null
  tmShrtEngNm: string | null
  g: number
  gs: number
  ipOut: number
  h: number
  hr: number
  r: number
  er: number
  bb: number
  so: number
  w: number
  l: number
  sv: number
  hld: number
  era: number | null
  whip: number | null
}

export interface PlrBatrMonRec {
  plrId: number
  ssntYr: number
  mon: number
  tmId: number | null
  tmKrNm: string | null
  g: number
  pa: number
  ab: number
  h: number
  hr: number
  rbi: number
  bb: number
  so: number
  sb: number
  ba: number | null
  obp: number | null
  slg: number | null
  ops: number | null
}

export interface PlrPtchMonRec {
  plrId: number
  ssntYr: number
  mon: number
  tmId: number | null
  tmKrNm: string | null
  g: number
  gs: number
  ipOut: number
  h: number
  hr: number
  r: number
  er: number
  bb: number
  so: number
  w: number
  l: number
  sv: number
  hld: number
  era: number | null
  whip: number | null
}

export const PLR_STTS_LABEL: Record<string, string> = {
  AT: '활동',
  INJ: '부상',
  RET: '은퇴',
  FA: 'FA',
}

export const REPR_POSN_LABEL: Record<string, string> = {
  '10': '투수',
  '20': '포수',
  '21': '내야수',
  '22': '외야수',
}

export const POSN_LABEL: Record<string, string> = {
  '10': '선발투수',
  '11': '중간계투',
  '12': '마무리',
  '20': '포수',
  '21': '1루수',
  '22': '2루수',
  '23': '3루수',
  '24': '유격수',
  '25': '좌익수',
  '26': '중견수',
  '27': '우익수',
  '28': '지명타자',
}

export const BAT_PTCH_HAND_LABEL: Record<string, string> = {
  RR: '우투우타',
  RL: '우투좌타',
  RS: '우투양타',
  LL: '좌투좌타',
  LR: '좌투우타',
  LS: '좌투양타',
}

export function isPitcher(reprPosnCd: string | null): boolean {
  return reprPosnCd === '10'
}

export function fmtIp(ipOut: number): string {
  const innings = Math.floor(ipOut / 3)
  const frac = ipOut % 3
  return frac === 0 ? `${innings}` : `${innings}.${frac}`
}

export interface PlrAbltMon {
  plrId: number
  ssntYr: number
  mon: number
  abltCd: string
  abltNm: string | null
  abltVal: number
  abltGrade: string
}

export function fmtStat(val: number | null, digits = 3): string {
  if (val == null) return '-'
  return val.toFixed(digits)
}

export interface PlrHideAblt {
  plrId: number
  hideAbltCd: string
  hideAbltNm: string | null
  hideAbltVal: number
}

export interface PlrFatgCond {
  plrId: number
  ssntYr: number
  fatg: number
  cond: number
}

export interface PlrInjryHist {
  evntId: number
  ssntYr: number | null
  evntDt: string | null
  evntTypeCd: string | null
  evntTtlt: string | null
  evntCnts: string | null
}
