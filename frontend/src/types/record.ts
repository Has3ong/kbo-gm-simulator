export interface BatrSsntRec {
  plrId: number
  plrNm: string
  tmId: number | null
  tmKrNm: string | null
  ssntYr: number
  pa: number
  ab: number
  h: number
  dobl: number
  trpl: number
  hr: number
  rbi: number
  r: number
  bb: number
  ibb: number
  so: number
  sb: number
  cs: number
  hbp: number
  sac: number
  sf: number
  gidp: number
  ba: number | null
  obp: number | null
  slg: number | null
  ops: number | null
}

export interface PtchSsntRec {
  plrId: number
  plrNm: string
  tmId: number | null
  tmKrNm: string | null
  ssntYr: number
  ipOut: number
  bf: number
  h: number
  dobl: number
  trpl: number
  hr: number
  r: number
  er: number
  bb: number
  ibb: number
  so: number
  hbp: number
  w: number
  l: number
  sv: number
  hld: number
  bsv: number
  cg: number
  sho: number
  pitches: number
  era: number | null
  whip: number | null
  kPer9: number | null
  bbPer9: number | null
}
