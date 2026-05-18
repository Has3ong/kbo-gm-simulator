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

export const POSN_LABEL: Record<string, string> = {
  '1': '포수', '2': '1루수', '3': '2루수', '4': '3루수',
  '5': '유격수', '6': '좌익수', '7': '중견수', '8': '우익수',
  '9': '지명타자', '10': '투수',
}

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

type BattingSlot = { plrId: number; posnCd: string }

export function useRosterConfirmPage() {
  const navigate = useNavigate()
  const { data: rawData, isLoading, isError } = useRosterData()
  const confirmMutation = useConfirmRoster()

  const allPlayers: RosterPlayer[] = rawData?.players ?? []

  const [firstTeamIds, setFirstTeamIds] = useState<Set<number>>(() => new Set<number>())
  const [initialized, setInitialized] = useState(false)
  const [battingOrder, setBattingOrder] = useState<Record<number, BattingSlot>>({})
  const [rotation, setRotation] = useState<(number | null)[]>([null, null, null, null, null])
  const [bullpenRoles, setBullpenRoles] = useState<Record<number, string>>({})

  if (!initialized && allPlayers.length > 0) {
    const init = new Set<number>()
    for (const p of allPlayers) {
      if (p.ENTY_LVL_CD === '1') init.add(p.PLR_ID)
    }
    setFirstTeamIds(init)

    const currentLineup: Array<{ LINEUP_NO: number; PLR_ID: number; POSN_CD: string }> = rawData?.currentLineup ?? []
    if (currentLineup.length > 0) {
      const initBo: Record<number, BattingSlot> = {}
      for (const row of currentLineup) {
        initBo[row.LINEUP_NO] = { plrId: row.PLR_ID, posnCd: row.POSN_CD }
      }
      setBattingOrder(initBo)
    }

    const currentRotation: Array<{ ROT_ORD: number; PLR_ID: number }> = rawData?.currentRotation ?? []
    if (currentRotation.length > 0) {
      const initRot: (number | null)[] = [null, null, null, null, null]
      for (const row of currentRotation) {
        if (row.ROT_ORD >= 1 && row.ROT_ORD <= 5) initRot[row.ROT_ORD - 1] = row.PLR_ID
      }
      setRotation(initRot)
    }

    const currentBullpen: Array<{ PLR_ID: number; ROLE_CD: string }> = rawData?.currentBullpen ?? []
    if (currentBullpen.length > 0) {
      const initBr: Record<number, string> = {}
      for (const row of currentBullpen) {
        initBr[row.PLR_ID] = row.ROLE_CD
      }
      setBullpenRoles(initBr)
    }

    setInitialized(true)
  }

  const pitchers = allPlayers.filter((p) => p.REPR_POSN_CD === '10')
  const batters  = allPlayers.filter((p) => p.REPR_POSN_CD !== '10')

  const firstTeamPitchers = pitchers.filter((p) => firstTeamIds.has(p.PLR_ID))
  const firstTeamBatters  = batters.filter((p) => firstTeamIds.has(p.PLR_ID))

  // 드래그 상태
  const [dragPlrId, setDragPlrId] = useState<number | null>(null)
  const [dragRotationIdx, setDragRotationIdx] = useState<number | null>(null)

  function toggleFirstTeam(plrId: number) {
    setFirstTeamIds((prev) => {
      const next = new Set(prev)
      if (next.has(plrId)) {
        next.delete(plrId)
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
    setDragRotationIdx(null)
  }

  function handleDropIntoFirst() {
    if (dragPlrId !== null && !firstTeamIds.has(dragPlrId)) {
      toggleFirstTeam(dragPlrId)
    }
    setDragPlrId(null)
    setDragRotationIdx(null)
  }

  function handleDropIntoSecond() {
    if (dragPlrId !== null && firstTeamIds.has(dragPlrId)) {
      toggleFirstTeam(dragPlrId)
    }
    setDragPlrId(null)
    setDragRotationIdx(null)
  }

  function handleDropOnBattingSlot(slot: number) {
    if (dragPlrId === null) return
    const plr = allPlayers.find((p) => p.PLR_ID === dragPlrId)
    if (!plr || plr.REPR_POSN_CD === '10') return
    setBattingOrder((prev) => {
      const next = { ...prev }
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

  function handleRotationSlotDragStart(idx: number) {
    const plrId = rotation[idx]
    if (plrId !== null) {
      setDragPlrId(plrId)
      setDragRotationIdx(idx)
    }
  }

  function handleDropOnRotationSlot(toIdx: number) {
    if (dragRotationIdx !== null) {
      setRotation((prev) => {
        const next = [...prev]
        const tmp = next[toIdx]
        next[toIdx] = next[dragRotationIdx!]
        next[dragRotationIdx!] = tmp
        return next
      })
    } else if (dragPlrId !== null) {
      const plr = allPlayers.find((p) => p.PLR_ID === dragPlrId)
      if (plr && plr.REPR_POSN_CD === '10') {
        setRotation((prev) => {
          const next = [...prev]
          const existingIdx = next.indexOf(dragPlrId)
          if (existingIdx !== -1) next[existingIdx] = null
          next[toIdx] = dragPlrId
          return next
        })
      }
    }
    setDragPlrId(null)
    setDragRotationIdx(null)
  }

  function removeFromRotation(idx: number) {
    setRotation((prev) => {
      const next = [...prev]
      next[idx] = null
      return next
    })
  }

  // CL/SU는 각 1명만 가능 — 기존 보유자는 MR로 자동 강등
  function setBullpenRole(plrId: number, role: string) {
    setBullpenRoles((prev) => {
      const next = { ...prev }
      if (role === 'CL' || role === 'SU') {
        for (const id of Object.keys(next)) {
          if (Number(id) !== plrId && next[Number(id)] === role) {
            next[Number(id)] = 'MR'
          }
        }
      }
      next[plrId] = role
      return next
    })
  }

  // ============================================================
  // 자동 로스터 배정
  // ============================================================
  function autoAssignRoster() {
    const sortedPitchers = [...pitchers].sort((a, b) => b.PLR_OVRL_ABLT - a.PLR_OVRL_ABLT)
    const sortedBatters  = [...batters].sort((a, b) => b.PLR_OVRL_ABLT - a.PLR_OVRL_ABLT)

    const selectedPitchers: RosterPlayer[] = []
    const selectedBatters: RosterPlayer[]  = []
    let frgnUsed = 0

    for (const p of sortedPitchers) {
      if (selectedPitchers.length >= 12) break
      if (p.CNTRCT_TYPE_CD === 'FR') {
        if (frgnUsed < 3) { selectedPitchers.push(p); frgnUsed++ }
      } else {
        selectedPitchers.push(p)
      }
    }

    for (const b of sortedBatters) {
      if (selectedBatters.length >= 15) break
      if (b.CNTRCT_TYPE_CD === 'FR') {
        if (frgnUsed < 3) { selectedBatters.push(b); frgnUsed++ }
      } else {
        selectedBatters.push(b)
      }
    }

    if (selectedPitchers.length + selectedBatters.length < 20) {
      for (const p of sortedPitchers) {
        if (!selectedPitchers.find((x) => x.PLR_ID === p.PLR_ID)) {
          selectedPitchers.push(p)
          if (selectedPitchers.length + selectedBatters.length >= 20) break
        }
      }
    }

    const newFirstIds = new Set<number>([
      ...selectedPitchers.map((p) => p.PLR_ID),
      ...selectedBatters.map((p) => p.PLR_ID),
    ])
    setFirstTeamIds(newFirstIds)

    const slotPosnPref: Record<number, string[]> = {
      1: ['5', '7', '3'],
      2: ['7', '6', '8'],
      3: ['8', '6', '5'],
      4: ['2', '4'],
      5: ['4', '2'],
      6: ['6', '8'],
      7: ['3', '5'],
      8: ['1'],
      9: ['9'],
    }

    const newBattingOrder: Record<number, BattingSlot> = {}
    const usedBatterIds = new Set<number>()
    const usedPosnCds   = new Set<string>()

    for (let slot = 1; slot <= 9; slot++) {
      let assigned = false
      for (const posn of (slotPosnPref[slot] ?? [])) {
        if (usedPosnCds.has(posn)) continue
        const candidate = selectedBatters.find(
          (b) => b.REPR_POSN_CD === posn && !usedBatterIds.has(b.PLR_ID)
        )
        if (candidate) {
          newBattingOrder[slot] = { plrId: candidate.PLR_ID, posnCd: candidate.REPR_POSN_CD }
          usedBatterIds.add(candidate.PLR_ID)
          usedPosnCds.add(posn)
          assigned = true
          break
        }
      }
      if (!assigned) {
        const candidate = selectedBatters.find((b) => !usedBatterIds.has(b.PLR_ID))
        if (candidate) {
          const posn = candidate.REPR_POSN_CD ?? '9'
          newBattingOrder[slot] = { plrId: candidate.PLR_ID, posnCd: posn }
          usedBatterIds.add(candidate.PLR_ID)
          usedPosnCds.add(posn)
        }
      }
    }
    setBattingOrder(newBattingOrder)

    const newRotation: (number | null)[] = selectedPitchers.slice(0, 5).map((p) => p.PLR_ID)
    while (newRotation.length < 5) newRotation.push(null)
    setRotation(newRotation)

    const rotSet = new Set(newRotation.filter((id): id is number => id !== null))
    const bullpenList = selectedPitchers.filter((p) => !rotSet.has(p.PLR_ID))
    const newBullpenRoles: Record<number, string> = {}
    let clAssigned = false
    let suAssigned = false
    bullpenList.forEach((p) => {
      if (!clAssigned) { newBullpenRoles[p.PLR_ID] = 'CL'; clAssigned = true }
      else if (!suAssigned) { newBullpenRoles[p.PLR_ID] = 'SU'; suAssigned = true }
      else { newBullpenRoles[p.PLR_ID] = 'MR' }
    })
    setBullpenRoles(newBullpenRoles)
  }

  const rotationPlrIds = new Set(rotation.filter((id): id is number => id !== null))
  const bullpenPitchers = firstTeamPitchers.filter((p) => !rotationPlrIds.has(p.PLR_ID))
  const battingOrderPlrIds = new Set(Object.values(battingOrder).map((s) => s.plrId))
  const backupBatters = firstTeamBatters.filter((p) => !battingOrderPlrIds.has(p.PLR_ID))

  const firstTeamCount = firstTeamIds.size
  const frgnCount = allPlayers.filter(
    (p) => p.CNTRCT_TYPE_CD === 'FR' && firstTeamIds.has(p.PLR_ID)
  ).length

  // 타순 포지션 → 슬롯 맵 (중복 방지용)
  const posnToSlot: Record<string, number> = {}
  for (const [slot, entry] of Object.entries(battingOrder)) {
    posnToSlot[entry.posnCd] = Number(slot)
  }

  const validationErrors: string[] = []
  if (firstTeamCount < 20) validationErrors.push(`1군 선수가 최소 20명이어야 합니다 (현재 ${firstTeamCount}명)`)
  if (firstTeamCount > 29) validationErrors.push(`1군 선수가 최대 29명이어야 합니다 (현재 ${firstTeamCount}명)`)

  // 타자 포지션 중복 검사
  const posnCdCounts: Record<string, number> = {}
  for (const entry of Object.values(battingOrder)) {
    posnCdCounts[entry.posnCd] = (posnCdCounts[entry.posnCd] ?? 0) + 1
  }
  const dupPosns = Object.entries(posnCdCounts)
    .filter(([, cnt]) => cnt > 1)
    .map(([cd]) => POSN_LABEL[cd] ?? cd)
  if (dupPosns.length > 0) {
    validationErrors.push(`중복 포지션: ${dupPosns.join(', ')} (각 포지션은 1명만 가능)`)
  }

  // CL/SU 중복 검사 (setBullpenRole에서 자동 방지하지만 안전망)
  const clCount = Object.values(bullpenRoles).filter((r) => r === 'CL').length
  const suCount = Object.values(bullpenRoles).filter((r) => r === 'SU').length
  if (clCount > 1) validationErrors.push(`마무리(CL)는 1명만 지정 가능합니다 (현재 ${clCount}명)`)
  if (suCount > 1) validationErrors.push(`셋업(SU)은 1명만 지정 가능합니다 (현재 ${suCount}명)`)

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
    isLoading, isError,
    allPlayers, pitchers, batters,
    firstTeamIds, firstTeamPitchers, firstTeamBatters,
    toggleFirstTeam, handleDropIntoFirst, handleDropIntoSecond,
    battingOrder, handleDragStart,
    handleDropOnBattingSlot, removeFromBattingOrder, setSlotPosn,
    backupBatters, battingOrderPlrIds,
    rotation, rotationPlrIds,
    handleRotationSlotDragStart, handleDropOnRotationSlot, removeFromRotation,
    bullpenPitchers, bullpenRoles, setBullpenRole,
    dragPlrId, dragRotationIdx,
    firstTeamCount, frgnCount,
    posnToSlot,
    validationErrors, canConfirm,
    handleConfirm, confirmMutation,
    autoAssignRoster,
  }
}
