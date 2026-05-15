import { useState } from 'react'
import { useTeams } from '../../hooks/useTeams'
import { usePlayers } from '../../hooks/usePlayers'
import { useGame } from '../../contexts/GameContext'
import { PLR_STTS_LABEL, REPR_POSN_LABEL } from '../../types/player'

export function usePlayersPage() {
  const { currentGame } = useGame()
  const [tmId, setTmId] = useState<number | undefined>(currentGame?.userTeamId ?? undefined)
  const [plrSttsCd, setPlrSttsCd] = useState<string | undefined>(undefined)

  const { data: teams } = useTeams()
  const { data: players, isLoading } = usePlayers({ tmId, plrSttsCd })

  const handleTmChange = (value: string) => setTmId(value ? Number(value) : undefined)
  const handleSttsChange = (value: string) => setPlrSttsCd(value || undefined)

  return {
    teams,
    players,
    isLoading,
    tmId,
    plrSttsCd,
    handleTmChange,
    handleSttsChange,
    PLR_STTS_LABEL,
    REPR_POSN_LABEL,
  }
}
