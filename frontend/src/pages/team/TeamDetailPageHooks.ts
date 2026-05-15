import { useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  useTeam, useTeamFacilities, useTeamFacilityUpgrades, useTeamFinance,
  useTeamFinanceHistory, useTeamMarket, useTeamStandingsHistory,
  useFcltyUpgrCosts, useTeamStadium, useStdmExpnHistory, useStdmExpnCosts,
} from '../../hooks/useTeams'
import { useCurrentBrdcstSpnsr } from '../../hooks/useBroadcast'
import { useGame } from '../../contexts/GameContext'
import { CURRENT_SEASON_YEAR, FCLTY_LVL_LABEL } from '../../constants'
import type { FcltyUpgrCost } from '../../types/team'

export type FinanceViewMode = 'table' | 'chart'

export function useTeamDetailPage() {
  const { tmId } = useParams<{ tmId: string }>()
  const tmIdNum = Number(tmId)
  const ssntYr = CURRENT_SEASON_YEAR
  const [tabIndex, setTabIndex] = useState(0)
  const [financeSubTab, setFinanceSubTab] = useState(0)
  const [financeViewMode, setFinanceViewMode] = useState<FinanceViewMode>('table')

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
  }
}
