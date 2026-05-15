import { useState } from 'react'
import { useStandings } from '../../hooks/useSeasons'
import { PSTSSNT_STTS_LABEL } from '../../types/season'
import { CURRENT_SEASON_YEAR } from '../../constants'

export function useStandingsPage() {
  const [ssntYr, setSsntYr] = useState(CURRENT_SEASON_YEAR)
  const { data: standings, isLoading } = useStandings(ssntYr)

  const formatPct = (val: number | null) => (val != null ? val.toFixed(3) : '-')
  const formatGb = (val: number | null) => (val === 0 ? '-' : val?.toFixed(1) ?? '-')
  const formatStrk = (type: string | null, cnt: number | null) => {
    if (!type || type === 'N') return '-'
    const label = type === 'W' ? '연승' : type === 'L' ? '연패' : '연무'
    return `${cnt}${label}`
  }

  const formatPythag = (rs: number | null, ra: number | null) => {
    if (!rs || !ra || ra === 0) return '-'
    const p = (rs * rs) / (rs * rs + ra * ra)
    return p.toFixed(3)
  }

  return {
    standings,
    isLoading,
    ssntYr,
    setSsntYr,
    formatPct,
    formatGb,
    formatStrk,
    formatPythag,
    PSTSSNT_STTS_LABEL,
  }
}
