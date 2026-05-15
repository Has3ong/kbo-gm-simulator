import { useState } from 'react'
import { useGame } from '../../contexts/GameContext'
import { CURRENT_SEASON_YEAR } from '../../constants'
import {
  useDraftByYear,
  useDraftPlayers,
  useDraftOrder,
  useCreateDraft,
  useGeneratePool,
  useStartDraft,
  usePick,
  useSimulate,
} from '../../hooks/useDraft'
import type { DraftPlayer } from '../../types/draft'

export function useDraftPage() {
  const { currentGame } = useGame()
  const userTmId = currentGame?.userTeamId ?? 0
  const ssntYr = currentGame?.ssntYr ?? CURRENT_SEASON_YEAR

  const [tab, setTab] = useState<'players' | 'order'>('players')
  const [selectedPlayer, setSelectedPlayer] = useState<DraftPlayer | null>(null)
  const [boardMemo, setBoardMemo] = useState('')

  const { data: draft, isLoading, error } = useDraftByYear(ssntYr, userTmId)
  const { data: players } = useDraftPlayers(draft?.drftId, userTmId)
  const { data: order } = useDraftOrder(draft?.drftId)

  const createDraft = useCreateDraft(ssntYr)
  const generatePool = useGeneratePool(ssntYr)
  const startDraft = useStartDraft(ssntYr)
  const pickMutation = usePick(draft?.drftId ?? 0, ssntYr)
  const simulateMutation = useSimulate(draft?.drftId ?? 0, ssntYr)

  return {
    draft,
    players,
    order,
    isLoading,
    error,
    ssntYr,
    userTmId,
    createDraft,
    generatePool,
    startDraft,
    pickMutation,
    simulateMutation,
    tab,
    setTab,
    selectedPlayer,
    setSelectedPlayer,
    boardMemo,
    setBoardMemo,
  }
}
