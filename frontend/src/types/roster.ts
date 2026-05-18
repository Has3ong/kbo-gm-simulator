export interface RosterPlayer {
  PLR_ID: number
  PLR_NM: string
  REPR_POSN_CD: string    // '10'=투수, '1'-'9'=야수 포지션
  PLR_OVRL_ABLT: number
  PLR_POT_ABLT?: number | null
  PLR_FRGN_YN?: string | null
  PLR_STTS_CD?: string | null
  CNTRCT_TYPE_CD: string  // 'FR'=외국인
  ENTY_LVL_CD: string     // '1'=1군, '2'=2군
  ABLTS?: Record<string, number>
  [key: string]: unknown
}

export interface BattingOrderItem {
  btngOrd: number
  plrId: number
  posnCd: string
}

export interface RotationItem {
  rotnOrd: number
  plrId: number
}

export interface BullpenItem {
  plrId: number
  bullRoleCd: string
}

export interface RosterConfirmRequest {
  rosterPlrIds: number[]
  battingOrder: BattingOrderItem[]
  rotation: RotationItem[]
  bullpen: BullpenItem[]
}
