export interface DraftInfo {
  drftId: number
  ssntYr: number
  drftDt: string | null
  drftSttsCd: string
  rndCnt: number
  maxPickCnt: number
  userTmId: number
  totalPicked: number
  myPickCnt: number
  currentPickNo: number | null
}

export interface DraftPlayer {
  drftPlrId: number
  plrNm: string
  plrEngNm: string | null
  plrAge: number | null
  plrOrgnCd: string | null
  plrOrgnNm: string | null
  hsNm: string | null
  univNm: string | null
  plrHt: number | null
  plrWt: number | null
  prevRec: string | null
  posnCd: string
  posnNm: string | null
  reprPosnCd: string
  reprPosnNm: string | null
  plrBatPtchHandCd: string | null
  grwthTend: string | null
  injRsk: number | null
  isPickYn: string
  isExclYn: string
  plrId: number | null
  // 스카우팅 리포트
  estOvrlAblt: number | null
  estOvrlGrade: string | null
  estPotAblt: number | null
  estPotGrade: string | null
  estRnd: number | null
  accrcy: number | null
  grade: string | null
  cmnt: string | null
  // 드래프트 보드
  prioOrd: number | null
  doNotPick: string | null
  memo: string | null
}

export interface DraftOrder {
  drftId: number
  pickNo: number
  rnd: number
  rndPickNo: number
  tmId: number
  tmKrNm: string | null
  tmShrtKrNm: string | null
  pickSttsCd: string
  drftPlrId: number | null
  plrNm: string | null
  posnCd: string | null
  reprPosnCd: string | null
  plrId: number | null
}

export const DRFT_STTS_LABEL: Record<string, string> = {
  CREATED: '생성됨',
  SCOUTING: '스카우팅 중',
  READY: '준비 완료',
  IN_PROGRESS: '진행 중',
  COMPLETED: '완료',
}

export const GRWTH_TEND_LABEL: Record<string, string> = {
  ERLY: '조기 성장',
  LATB: '만개형',
  NRML: '일반',
}
