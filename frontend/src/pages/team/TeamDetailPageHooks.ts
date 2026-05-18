import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  useTeam, useTeamFacilities, useTeamFacilityUpgrades, useTeamFinance,
  useTeamFinanceHistory, useTeamFinanceLog, useTeamMarket, useTeamStandingsHistory,
  useFcltyUpgrCosts, useTeamStadium, useStdmExpnHistory, useStdmExpnCosts,
} from '../../hooks/useTeams'
import { useCurrentBrdcstSpnsr } from '../../hooks/useBroadcast'
import { useGame } from '../../contexts/GameContext'
import { CURRENT_SEASON_YEAR, FCLTY_LVL_LABEL } from '../../constants'
import type { FcltyUpgrCost } from '../../types/team'
import { usePlayers } from '../../hooks/usePlayers'
import { useStaffs } from '../../hooks/useStaffs'

export type FinanceViewMode = 'table' | 'chart'
export type FinanceChartMode = 'income' | 'expense' | 'stacked' | 'sankey'

export function useTeamDetailPage() {
  const { tmId } = useParams<{ tmId: string }>()
  const tmIdNum = Number(tmId)
  const ssntYr = CURRENT_SEASON_YEAR
  const [tabIndex, setTabIndex] = useState(0)
  const [financeSubTab, setFinanceSubTab] = useState(0)
  const [financeViewMode, setFinanceViewMode] = useState<FinanceViewMode>('chart')

  // 업그레이드 다이얼로그
  const [upgrTarget, setUpgrTarget] = useState<FcltyUpgrCost | null>(null)
  // 경기장 증축 다이얼로그
  const [expnOpen, setExpnOpen] = useState(false)

  const { currentGame } = useGame()
  const isUserTeam = currentGame?.userTeamId === tmIdNum

  const { data: team, isLoading } = useTeam(tmIdNum)
  const { data: finance } = useTeamFinance(tmIdNum, ssntYr)
  const { data: financeHistory } = useTeamFinanceHistory(tmIdNum)
  const { data: facilities } = useTeamFacilities(tmIdNum)
  const { data: facilityUpgrades } = useTeamFacilityUpgrades(tmIdNum)
  const { data: fcltyUpgrCosts } = useFcltyUpgrCosts(tmIdNum)
  const { data: market } = useTeamMarket(tmIdNum, ssntYr)
  const { data: broadcaster } = useCurrentBrdcstSpnsr()
  const { data: standingsHistory } = useTeamStandingsHistory(tmIdNum)
  const { data: stadium } = useTeamStadium(tmIdNum)
  const { data: stdmExpnHistory } = useStdmExpnHistory(tmIdNum)
  const { data: stdmExpnCosts } = useStdmExpnCosts()
  const { data: financeLog } = useTeamFinanceLog(tmIdNum)

  // 선수·스태프 탭 데이터
  const { data: teamPlayers } = usePlayers({ tmId: tmIdNum })
  const { data: teamStaffs } = useStaffs({ tmId: tmIdNum })

  const formatMoney = (val: number | null | undefined) =>
    val != null ? `${val.toLocaleString()}만원` : '-'

  return {
    team,
    finance,
    financeHistory: financeHistory ?? [],
    facilities: facilities ?? [],
    facilityUpgrades: facilityUpgrades ?? [],
    fcltyUpgrCosts: fcltyUpgrCosts ?? [],
    market,
    standingsHistory: standingsHistory ?? [],
    stadium: stadium ?? null,
    stdmExpnHistory: stdmExpnHistory ?? [],
    stdmExpnCosts: stdmExpnCosts ?? [],
    financeLog: financeLog ?? [],
    broadcaster: isUserTeam ? broadcaster : null,
    isLoading,
    ssntYr,
    formatMoney,
    FCLTY_LVL_LABEL,
    isUserTeam,
    tabIndex,
    setTabIndex,
    financeSubTab,
    setFinanceSubTab,
    financeViewMode,
    setFinanceViewMode,
    upgrTarget,
    setUpgrTarget,
    expnOpen,
    setExpnOpen,
    tmIdNum,
    teamPlayers: teamPlayers ?? [],
    teamStaffs: teamStaffs ?? [],
  }
}
