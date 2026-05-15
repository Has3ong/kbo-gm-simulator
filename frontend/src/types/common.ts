export interface CmnCd {
  cdId: string
  cdVal: string
  cdNm: string
  cdEngNm: string | null
  cdDesc: string | null
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string | null
}
