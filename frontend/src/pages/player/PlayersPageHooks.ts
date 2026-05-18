import { useGame } from '../../contexts/GameContext'
import { usePlayers } from '../../hooks/usePlayers'
import { PLR_STTS_LABEL, REPR_POSN_LABEL } from '../../types/player'

export function usePlayersPage() {
  const { currentGame } = useGame()
  const tmId = currentGame?.userTeamId

  const { data: players, isLoading } = usePlayers({ tmId })

  return {
    players,
    isLoading,
    PLR_STTS_LABEL,
    REPR_POSN_LABEL,
  }
}
