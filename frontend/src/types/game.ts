export interface Game {
  gameId: number
  ssntYr: number
  gameDt: string
  homeTmId: number
  homeTmKrNm: string
  awayTmId: number
  awayTmKrNm: string
  stdmId: number | null
  stdmKrNm: string | null
  homeScore: number | null
  awayScore: number | null
  gameSttsCd: string
  gameSttsNm: string | null
  gameTypeCd: string
  gameTypeNm: string | null
}

export const GAME_STTS_LABEL: Record<string, string> = {
  '01': '예정',
  '02': '진행중',
  '03': '완료',
  '04': '우천중단',
  '05': '취소',
  '06': '무효',
}

export const GAME_TYPE_LABEL: Record<string, string> = {
  REG: '정규시즌',
  WC: '와일드카드',
  SP: '준플레이오프',
  PO: '플레이오프',
  KS: '한국시리즈',
}
