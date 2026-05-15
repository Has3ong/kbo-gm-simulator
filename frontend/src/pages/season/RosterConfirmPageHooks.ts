import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRosterData, useConfirmRoster } from '../../hooks/useRosterConfirm'
import type {
  RosterPlayer, BattingOrderItem, RotationItem, BullpenItem,
} from '../../types/roster'

export const POSN_OPTIONS = [
  { code: '1', label: '포수' },
  { code: '2', label: '1루수' },
  { code: '3', label: '2루수' },
  { code: '4', label: '3루수' },
  { code: '5', label: '유격수' },
  { code: '6', label: '좌익수' },
  { code: '7', label: '중견수' },
  { code: '8', label: '우익수' },
  { code: '9', label: '지명타자' },
]

export const BULL_ROLE_OPTIONS = [
  { code: 'CL', label: '마무리' },
  { code: 'SU', label: '셋업' },
  { code: 'MR', label: '중간계투' },
]

const BULL_ROLE_LABELS: Record<string, string> = {
  CL: '마무리(CL)', SU: '셋업(SU)', MR: '중간계투(MR)',
}

export function getBullRoleLabel(code: string): string {
  return BULL_ROLE_LABELS[code] ?? code
}

export type DraftPlayerMap = Map<number, RosterPlayer>

export function useRosterConfirmPage() {
  const navigate = useNavigate()
  const { data: rawData, isLoading, isError } = useRosterData()
  const confirmMutation = useConfirmRoster()

  // raw players list from API
  const allPlayers: RosterPlayer[] = rawData?.players ?? []

  // 1군 여부 (PLR_ID → boolean)
  const [firstTeamIds, setFirstTeamIds] = useState<Set<number>>(() => {
    const init = new Set<number>()
    for (const p of allPlayers) {
      if (p.ENTY_LVL_CD === '1') init.add(p.PLR_ID)
    }
    return init
  })

  // Initialize from rawData once it loads
  const [initialized, setInitialized] = useState(false)
  if (!initialized && allPlayers.length > 0) {
    const init = new Set<number>()
    for (const p of allPlayers) {
      if (p.ENTY_LVL_CD === '1') init.add(p.PLR_ID)
    }
    setFirstTeamIds(init)
    setInitialized(true)
  }

  // 투수 / 야수 구분
  const pitchers = allPlayers.filter((p) => p.REPR_POSN_CD === '10')
  const batters = allPlayers.filter((p) => p.REPR_POSN_CD !== '10')

  const firstTeamPitchers = pitchers.filter((p) => firstTeamIds.has(p.PLR_ID))
  const firstTeamBatters = batters.filter((p) => firstTeamIds.has(p.PLR_ID))

  // 타순 (9개 슬롯)
  // battingOrder: slot(1-9) → { plrId, posnCd }
  type BattingSlot = { plrId: number; posnCd: string }
  const [battingOrder, setBattingOrder] = useState<Record<number, BattingSlot>>({})

  // 선발 로테이션 (5슬롯)
  const [rotation, setRotation] = useState<(number | null)[]>([null, null, null, null, null])

  // 불펜 role 맵 plrId → bullRoleCd
  const [bullpenRoles, setBullpenRoles] = useState<Record<number, string>>({})

  // 드래그 상태
  const [dragPlrId, setDragPlrId] = useState<number | null>(null)

  function toggleFirstTeam(plrId: number) {
    setFirstTeamIds((prev) => {
      const next = new Set(prev)
      if (next.has(plrId)) {
        next.delete(plrId)
        // remove from batting order & rotation & bullpen
        setBattingOrder((bo) => {
          const updated = { ...bo }
          for (const slot of Object.keys(updated)) {
            if (updated[Number(slot)].plrId === plrId) delete updated[Number(slot)]
          }
          return updated
        })
        setRotation((r) => r.map((id) => (id === plrId ? null : id)))
        setBullpenRoles((br) => {
          const { [plrId]: _removed, ...rest } = br
          return rest
        })
      } else {
        next.add(plrId)
      }
      return next
    })
  }

  function handleDragStart(plrId: number) {
    setDragPlrId(plrId)
  }

  function handleDropOnSlot(slot: number) {
    if (dragPlrId === null) return
    // check not a pitcher
    const plr = allPlayers.find((p) => p.PLR_ID === dragPlrId)
    if (!plr || plr.REPR_POSN_CD === '10') return
    setBattingOrder((prev) => {
      const next = { ...prev }
      // remove from any existing slot
      for (const s of Object.keys(next)) {
        if (next[Number(s)].plrId === dragPlrId) delete next[Number(s)]
      }
      next[slot] = { plrId: dragPlrId, posnCd: plr.REPR_POSN_CD ?? '9' }
      return next
    })
    setDragPlrId(null)
  }

  function removeFromBattingOrder(slot: number) {
    setBattingOrder((prev) => {
      const next = { ...prev }
      delete next[slot]
      return next
    })
  }

  function setSlotPosn(slot: number, posnCd: string) {
    setBattingOrder((prev) => {
      if (!prev[slot]) return prev
      return { ...prev, [slot]: { ...prev[slot], posnCd } }
    })
  }

  function setRotationSlot(idx: number, plrId: number | null) {
    setRotation((prev) => {
      const next = [...prev]
      next[idx] = plrId
      return next
    })
  }

  function setBullpenRole(plrId: number, role: string) {
    setBullpenRoles((prev) => ({ ...prev, [plrId]: role }))
  }

  // Pitchers in rotation (by plrId, not null)
  const rotationPlrIds = new Set(rotation.filter((id): id is number => id !== null))

  // Bullpen pitchers = 1군 투수 - 선발 로테이션
  const bullpenPitchers = firstTeamPitchers.filter((p) => !rotationPlrIds.has(p.PLR_ID))

  // Batters in batting order
  const battingOrderPlrIds = new Set(Object.values(battingOrder).map((s) => s.plrId))
  const backupBatters = firstTeamBatters.filter((p) => !battingOrderPlrIds.has(p.PLR_ID))

  // Validation
  const firstTeamCount = firstTeamIds.size
  const frgnCount = allPlayers.filter(
    (p) => p.CNTRCT_TYPE_CD === 'FR' && firstTeamIds.has(p.PLR_ID)
  ).length

  const validationErrors: string[] = []
  if (firstTeamCount < 20) validationErrors.push(`1군 선수가 최소 20명이어야 합니다 (현재 ${firstTeamCount}명)`)
  if (firstTeamCount > 29) validationErrors.push(`1군 선수가 최대 29명이어야 합니다 (현재 ${firstTeamCount}명)`)

  const canConfirm = validationErrors.length === 0 && !confirmMutation.isPending

  function buildConfirmRequest() {
    const rosterPlrIds = Array.from(firstTeamIds)

    const battingOrderArr: BattingOrderItem[] = Object.entries(battingOrder).map(
      ([slot, item]) => ({ btngOrd: Number(slot), plrId: item.plrId, posnCd: item.posnCd })
    )

    const rotationArr: RotationItem[] = rotation
      .map((plrId, idx) => ({ rotnOrd: idx + 1, plrId }))
      .filter((r): r is RotationItem => r.plrId !== null)

    const bullpenArr: BullpenItem[] = bullpenPitchers.map((p) => ({
      plrId: p.PLR_ID,
      bullRoleCd: bullpenRoles[p.PLR_ID] ?? 'MR',
    }))

    return { rosterPlrIds, battingOrder: battingOrderArr, rotation: rotationArr, bullpen: bullpenArr }
  }

  function handleConfirm() {
    if (!canConfirm) return
    confirmMutation.mutate(buildConfirmRequest(), {
      onSuccess: () => navigate('/season'),
    })
  }

  return {
    isLoading,
    isError,
    allPlayers,
    pitchers,
    batters,
    firstTeamIds,
    firstTeamPitchers,
    firstTeamBatters,
    toggleFirstTeam,
    battingOrder,
    handleDragStart,
    handleDropOnSlot,
    removeFromBattingOrder,
    setSlotPosn,
    backupBatters,
    battingOrderPlrIds,
    rotation,
    setRotationSlot,
    rotationPlrIds,
    bullpenPitchers,
    bullpenRoles,
    setBullpenRole,
    dragPlrId,
    firstTeamCount,
    frgnCount,
    validationErrors,
    canConfirm,
    handleConfirm,
    confirmMutation,
  }
}
