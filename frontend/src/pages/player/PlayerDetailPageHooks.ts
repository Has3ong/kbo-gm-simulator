import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  usePlayer, usePlrAbilities, usePlrPositions, usePlrTraits, usePlrContract,
  usePlrContractHistory, usePlrSalaryHistory, usePlrAbilityHistory, usePlrAbilityMonthlyHistory,
  usePlrBatterSeasonStats, usePlrPitcherSeasonStats,
  usePlrBatterMonthlyStats, usePlrPitcherMonthlyStats,
  usePlrHiddenAbilities, usePlrFatgCond, usePlrInjuryHistory,
} from '../../hooks/usePlayers'
import { PLR_STTS_LABEL, BAT_PTCH_HAND_LABEL, isPitcher } from '../../types/player'
import { ABILITY_GRADE_COLOR, CURRENT_SEASON_YEAR } from '../../constants'

export type AbilityViewMode = 'yearly' | 'monthly'

export function usePlayerDetailPage() {
  const { plrId } = useParams<{ plrId: string }>()
  const plrIdNum = Number(plrId)

  const [tabIndex, setTabIndex] = useState(0)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [abilityViewMode, setAbilityViewMode] = useState<AbilityViewMode>('yearly')
  const [abilityChartYear, setAbilityChartYear] = useState<number>(new Date().getFullYear())

  const { data: player, isLoading } = usePlayer(plrIdNum)
  const { data: abilities } = usePlrAbilities(plrIdNum)
  const { data: positions } = usePlrPositions(plrIdNum)
  const { data: traits } = usePlrTraits(plrIdNum)
  const { data: contract } = usePlrContract(plrIdNum)
  const { data: contractHistory } = usePlrContractHistory(plrIdNum)
  const { data: salaryHistory } = usePlrSalaryHistory(plrIdNum)
  const { data: abilityHistory } = usePlrAbilityHistory(plrIdNum)
  const { data: abilityMonthlyHistory } = usePlrAbilityMonthlyHistory(plrIdNum, abilityChartYear)
  const { data: hiddenAbilities } = usePlrHiddenAbilities(plrIdNum)
  const { data: fatgCond } = usePlrFatgCond(plrIdNum, CURRENT_SEASON_YEAR)
  const { data: injuryHistory } = usePlrInjuryHistory(plrIdNum)

  const isPlrPitcher = isPitcher(player?.reprPosnCd ?? null)

  const { data: batterSeasonStats } = usePlrBatterSeasonStats(isPlrPitcher ? 0 : plrIdNum)
  const { data: pitcherSeasonStats } = usePlrPitcherSeasonStats(isPlrPitcher ? plrIdNum : 0)
  const { data: batterMonthlyStats } = usePlrBatterMonthlyStats(isPlrPitcher ? 0 : plrIdNum, selectedYear)
  const { data: pitcherMonthlyStats } = usePlrPitcherMonthlyStats(isPlrPitcher ? plrIdNum : 0, selectedYear)

  const pitcherAbltCodes = ['VEL', 'CTL', 'BRK', 'STM', 'P4S', 'P2S', 'PCT', 'PSN', 'PSL', 'PCB', 'PCH', 'PFK']
  const batterAbltCodes = ['CNT', 'PWR', 'RUN', 'THR', 'STL', 'STM']

  const pitcherAblts = abilities?.filter((a) => pitcherAbltCodes.includes(a.abltCd)) ?? []
  const batterAblts = abilities?.filter((a) => batterAbltCodes.includes(a.abltCd)) ?? []

  const seasonStats = isPlrPitcher ? pitcherSeasonStats : batterSeasonStats
  const monthlyStats = isPlrPitcher ? pitcherMonthlyStats : batterMonthlyStats

  const availableYears = Array.from(
    new Set((seasonStats ?? []).map((r: { ssntYr: number }) => r.ssntYr))
  ).sort((a, b) => b - a)

  const abilityYears = Array.from(
    new Set((abilityHistory ?? []).map((r) => r.ssntYr))
  ).sort((a, b) => b - a)

  return {
    player,
    abilities: isPlrPitcher ? pitcherAblts : batterAblts,
    positions,
    traits,
    hiddenAbilities,
    fatgCond,
    injuryHistory,
    contract,
    contractHistory,
    salaryHistory,
    abilityHistory,
    abilityMonthlyHistory,
    abilityViewMode,
    setAbilityViewMode,
    abilityChartYear,
    setAbilityChartYear,
    abilityYears,
    seasonStats,
    monthlyStats,
    isLoading,
    isPlrPitcher,
    tabIndex,
    setTabIndex,
    selectedYear,
    setSelectedYear,
    availableYears,
    PLR_STTS_LABEL,
    BAT_PTCH_HAND_LABEL,
    ABILITY_GRADE_COLOR,
  }
}
