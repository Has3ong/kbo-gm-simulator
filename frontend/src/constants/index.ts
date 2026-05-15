export const CURRENT_SEASON_YEAR = 2026

// TM_ID → 로고 파일명 매핑 (public/img/logo/ 기준)
export const TEAM_LOGO: Record<number, string> = {
  1:  'emblem_HT.png',  // KIA
  2:  'emblem_SS.png',  // 삼성
  3:  'emblem_LG.png',  // LG
  4:  'emblem_OB.png',  // 두산
  5:  'emblem_KT.png',  // KT
  6:  'emblem_SK.png',  // SSG
  7:  'emblem_LT.png',  // 롯데
  8:  'emblem_HH.png',  // 한화
  9:  'emblem_NC.png',  // NC
  10: 'emblem_WO.png',  // 키움
}

export function teamLogoSrc(tmId: number): string {
  const file = TEAM_LOGO[tmId]
  return file ? `/img/logo/${file}` : ''
}

export const ABILITY_GRADE_COLOR: Record<string, string> = {
  'S+': '#6B21A8',
  S: '#7C3AED',
  'S-': '#8B5CF6',
  'A+': '#1D4ED8',
  A: '#2563EB',
  'A-': '#3B82F6',
  'B+': '#047857',
  B: '#059669',
  'B-': '#10B981',
  'C+': '#B45309',
  C: '#D97706',
  'C-': '#F59E0B',
  D: '#9CA3AF',
}

export const FCLTY_LVL_LABEL: Record<number, string> = {
  1: '1단계 (최하)',
  2: '2단계',
  3: '3단계',
  4: '4단계',
  5: '5단계 (최상)',
}

export const MORL_GRADE = (val: number): string => {
  if (val >= 70) return '매우 좋음'
  if (val >= 55) return '좋음'
  if (val >= 45) return '보통'
  if (val >= 30) return '나쁨'
  return '매우 나쁨'
}
