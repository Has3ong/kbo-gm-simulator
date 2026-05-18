export interface Team {
  tmId: number
  tmKrNm: string
  tmEngNm: string | null
  tmShrtKrNm: string | null
  tmShrtEngNm: string | null
  tmEstblshDt: string | null
  cityCd: string | null
  cityNm: string | null
  stdmId: number | null
  stdmKrNm: string | null
  emblemCd: string | null
  ciClr: string | null
}

export interface TmFinance {
  tmId: number
  ssntYr: number
  strCash: number | null
  curCash: number | null
  totBdgt: number | null
  plrSalBdgt: number | null
  coachBdgt: number | null
  dvlpBdgt: number | null
  mktBdgt: number | null
  fcltyBdgt: number | null
  curPlrSalCost: number | null
  tcktRev: number | null
  ssntTcktRev: number | null
  mrchRev: number | null
  spnsRev: number | null
  bcstRev: number | null
  pstssntRev: number | null
  plrSalCost: number | null
  stffCost: number | null
  oprCost: number | null
  ownSupp: number | null
  debt: number | null
  plrActualSal: number | null
  coachActualSal: number | null
  bcstBonusYtd: number | null
}

export interface TmFinLog {
  logId: number
  tmId: number
  ssntYr: number
  logDt: string
  logTypeCd: string   // INCOME / EXPENSE
  logCtgrCd: string
  amount: number
  memo: string | null
  createdAt: string | null
}

export interface TmFacility {
  tmId: number
  fcltyTypeCd: string
  fcltyTypeNm: string | null
  fcltyLvl: number
}

export interface TmFacilityUpgr {
  upgrId: number
  tmId: number
  fcltyTypeCd: string
  fcltyTypeNm: string | null
  fromLvl: number | null
  toLvl: number | null
  upgrCost: number | null
  upgrBgngDt: string | null
  upgrEndDt: string | null
  upgrSttsCd: string | null
}

export interface TmMarket {
  tmId: number
  ssntYr: number
  mktSz: number | null
  ppltRtg: number | null
  fanLylty: number | null
  fanExp: number | null
  regIntrst: number | null
  natnlPplt: number | null
  mrchPwr: number | null
  avgAtndCnt: number | null
  ssntTcktHldr: number | null
}

export interface FcltyUpgrCost {
  fcltyTypeCd: string
  fcltyTypeNm: string | null
  fcltyDesc: string | null
  fromLvl: number
  toLvl: number | null
  upgrCost: number | null
  upgrDays: number | null
  maxLevel: boolean
}

export interface Stdm {
  stdmId: number
  stdmKrNm: string
  stdmEngNm: string | null
  stdmLoc: string | null
  stdmEstblshDt: string | null
  stdmSeatCnt: number | null
  lfDist: number | null
  lcfDist: number | null
  cfDist: number | null
  rcfDist: number | null
  rfDist: number | null
  turfTypeCd: string | null
  turfTypeNm: string | null
}

export interface StdmExpn {
  expnId: number
  stdmId: number
  tmId: number
  bfrSeatCnt: number
  aftSeatCnt: number
  expnCost: number
  expnBgngDt: string | null
  expnEndDt: string | null
  expnSttsCd: string | null
  expnSttsNm: string | null
}

export interface StdmExpnCost {
  expnStep: number
  addSeatCnt: number
  expnCost: number
  expnDays: number
  expnDesc: string | null
}
