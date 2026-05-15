import { useState } from 'react'
import { useTeams } from '../../hooks/useTeams'
import { useRoster } from '../../hooks/useRoster'
import { useGame } from '../../contexts/GameContext'
import { POSN_LABEL } from '../../types/player'
import { CURRENT_SEASON_YEAR } from '../../constants'

export function useRosterPage() {
  const { currentGame } = useGame()
  const defaultTmId = currentGame?.userTeamId ?? undefined
  const [selectedTmId, setSelectedTmId] = useState<number | undefined>(defaultTmId)

  const { data: teams } = useTeams()
  const { data: players = [], isLoading } = useRoster(selectedTmId, CURRENT_SEASON_YEAR)

  const handleTeamChange = (value: string) => setSelectedTmId(value ? Number(value) : undefined)

  const pitchers = players.filter((p) => p.reprPosnCd === '10')
  const catchers = players.filter((p) => p.reprPosnCd === '20')
  const infielders = players.filter((p) => p.reprPosnCd === '21')
  const outfielders = players.filter((p) => p.reprPosnCd === '22')

  return {
    teams,
    players,
    pitchers,
    catchers,
    infielders,
    outfielders,
    isLoading,
    selectedTmId,
    handleTeamChange,
    POSN_LABEL,
  }
}
