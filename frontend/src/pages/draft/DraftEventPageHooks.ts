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
import { useRoster } from '../../hooks/useRoster'
import type { DraftPlayer, DraftOrder } from '../../types/draft'

const PAGE_SIZE = 20

export function useDraftEventPage() {
  const { currentGame } = useGame()
  const userTmId = currentGame?.userTeamId ?? 0
  const ssntYr = currentGame?.ssntYr ?? CURRENT_SEASON_YEAR

  const [rosterOpen, setRosterOpen] = useState(false)
  const [page, setPage] = useState(0)
  const [selectedPlayer, setSelectedPlayer] = useState<DraftPlayer | null>(null)
  const [pickConfirmOpen, setPickConfirmOpen] = useState(false)

  const { data: draft, isLoading, error } = useDraftByYear(ssntYr, userTmId)
  const { data: players } = useDraftPlayers(draft?.drftId, userTmId)
  const { data: order } = useDraftOrder(draft?.drftId)
  const { data: rosterPlayers } = useRoster(userTmId || undefined, ssntYr)

  const createDraft = useCreateDraft(ssntYr)
  const generatePool = useGeneratePool(ssntYr)
  const startDraft = useStartDraft(ssntYr)
  const pickMutation = usePick(draft?.drftId ?? 0, ssntYr)
  const simulateMutation = useSimulate(draft?.drftId ?? 0, ssntYr)

  // Build picked player → team mapping from order
  const pickedMap = new Map<number, { tmKrNm: string | null; rnd: number }>(
    (order ?? [])
      .filter(o => o.pickSttsCd === 'PICKED' && o.drftPlrId != null)
      .map(o => [o.drftPlrId!, { tmKrNm: o.tmShrtKrNm ?? o.tmKrNm, rnd: o.rnd }]),
  )

  // Sort by estPotAblt desc
  const sortedPlayers = [...(players ?? [])].sort(
    (a, b) => (b.estPotAblt ?? 0) - (a.estPotAblt ?? 0),
  )

  const totalPages = Math.ceil(sortedPlayers.length / PAGE_SIZE)
  const pagedPlayers = sortedPlayers.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  // Per-team picks: group PICKED orders by team
  const teamPicks = new Map<number, { tmId: number; tmKrNm: string; picks: DraftOrder[] }>()
  for (const o of order ?? []) {
    if (o.pickSttsCd !== 'PICKED') continue
    if (!teamPicks.has(o.tmId)) {
      teamPicks.set(o.tmId, { tmId: o.tmId, tmKrNm: o.tmShrtKrNm ?? o.tmKrNm ?? String(o.tmId), picks: [] })
    }
    teamPicks.get(o.tmId)?.picks.push(o)
  }
  const teamPickList = Array.from(teamPicks.values()).sort((a, b) => a.tmId - b.tmId)

  const isMyPick = draft && order
    ? order.find(o => o.pickNo === draft.currentPickNo)?.tmId === userTmId
    : false

  function openPickConfirm(plr: DraftPlayer) {
    setSelectedPlayer(plr)
    setPickConfirmOpen(true)
  }
  function closePickConfirm() {
    setPickConfirmOpen(false)
  }
  function confirmPick() {
    if (!selectedPlayer || !draft) return
    pickMutation.mutate({ userTmId, drftPlrId: selectedPlayer.drftPlrId }, {
      onSuccess: () => setPickConfirmOpen(false),
    })
  }

  return {
    draft, isLoading, error,
    ssntYr, userTmId,
    rosterPlayers, rosterOpen, setRosterOpen,
    page, setPage, totalPages, pagedPlayers,
    pickedMap,
    teamPickList,
    isMyPick,
    selectedPlayer, pickConfirmOpen, openPickConfirm, closePickConfirm, confirmPick,
    createDraft, generatePool, startDraft,
    pickMutation, simulateMutation,
  }
}
