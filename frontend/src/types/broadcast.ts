export interface BrdcstSpnsr {
  brdcstCd: string    // 방송국 코드 (SBS/KBS/MBC)
  brdcstNm: string    // 방송국명
  cntrctFee: number   // 계약금 (만원)
  winBonus: number    // 승리 수당 (만원/승)
  postBonus: number   // 포스트시즌 진출 수당 (만원)
  ksBonus: number     // 한국시리즈 우승 수당 (만원)
}
