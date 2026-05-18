import { useRoster } from '../../hooks/useRoster'
import { useGame } from '../../contexts/GameContext'
import { CURRENT_SEASON_YEAR } from '../../constants'

export function useRosterPage() {
  const { currentGame } = useGame()
  const tmId = currentGame?.userTeamId ?? undefined

  const { data: players = [], isLoading } = useRoster(tmId, CURRENT_SEASON_YEAR)

  const firstTeamPlayers  = players.filter((p) => p.entyLvlCd === '1')
  const secondTeamPlayers = players.filter((p) => p.entyLvlCd === '2')

  const firstPitchers  = firstTeamPlayers.filter((p) => p.reprPosnCd === '10')
  const firstFielders  = firstTeamPlayers.filter((p) => p.reprPosnCd !== '10')
  const secondPitchers = secondTeamPlayers.filter((p) => p.reprPosnCd === '10')
  const secondFielders = secondTeamPlayers.filter((p) => p.reprPosnCd !== '10')

  return {
    isLoading,
    tmId,
    firstTeamPlayers, secondTeamPlayers,
    firstPitchers, firstFielders,
    secondPitchers, secondFielders,
  }
}
