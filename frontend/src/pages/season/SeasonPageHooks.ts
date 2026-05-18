import { useState, useRef, useCallback, useEffect } from 'react'
import {
  useSeason, useSeasonEvents, useMarkEventRead,
  useAdvanceCheck, useAdvanceSeason, useAdvanceToSpring, useStandings,
} from '../../hooks/useSeasons'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { seasonApi } from '../../api/seasonApi'
import { seasonKeys } from '../../hooks/useSeasons'
import { staffHireKeys } from '../../hooks/useStaffHire'
import { useBrdcstSpnsrs, useSelectBrdcstSpnsr } from '../../hooks/useBroadcast'
import { SSNT_STTS_LABEL } from '../../types/season'
import { CURRENT_SEASON_YEAR } from '../../constants'
import type { EventProgress } from '../../components/EventProgressDialog'
import type { AdvanceWeekProgress } from '../../components/AdvanceWeekDialog'
import { useGame } from '../../contexts/GameContext'
import { useTeamMetaStore } from '../../stores/teamMetaStore'

const API_BASE = 'http://localhost:8080/api'

export function useSeasonPage() {
  const qc = useQueryClient()
  const [selectedEvntId, setSelectedEvntId] = useState<number | null>(null)

  // 경기 시뮬레이션 팝업
  const [gameSimOpen, setGameSimOpen] = useState(false)
  const [gameSimProgress, setGameSimProgress] = useState<EventProgress | null>(null)
  const gameSimEsRef = useRef<EventSource | null>(null)
  const [autoSelectGameDt, setAutoSelectGameDt] = useState<string | null>(null)

  // 월간 처리 팝업
  const [monthlyOpen, setMonthlyOpen] = useState(false)
  const [monthlyProgress, setMonthlyProgress] = useState<EventProgress | null>(null)
  const monthlyEsRef = useRef<EventSource | null>(null)

  // 주간 처리 팝업
  const [weeklyOpen, setWeeklyOpen] = useState(false)
  const [weeklyProgress, setWeeklyProgress] = useState<EventProgress | null>(null)
  const weeklyEsRef = useRef<EventSource | null>(null)

  // 시즌 종료 처리 팝업
  const [seasonEndOpen, setSeasonEndOpen] = useState(false)
  const [seasonEndProgress, setSeasonEndProgress] = useState<EventProgress | null>(null)
  const seasonEndEsRef = useRef<EventSource | null>(null)

  // 다음주까지 진행하기 팝업
  const [advanceWeekOpen, setAdvanceWeekOpen] = useState(false)
  const [advanceWeekProgress, setAdvanceWeekProgress] = useState<AdvanceWeekProgress | null>(null)
  const advanceWeekEsRef = useRef<EventSource | null>(null)
  const advanceWeekTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 감독·코치 선임 모달
  const [staffHireOpen, setStaffHireOpen] = useState(false)

  // 스프링 캠프 선택 모달
  const [springCampOpen, setSpringCampOpen] = useState(false)

  // 외국인 선수 계약 모달
  const [frgnPlrOpen, setFrgnPlrOpen] = useState(false)

  // 방송국 인라인 선택
  const { data: brdcstOptions = [] } = useBrdcstSpnsrs()
  const selectBrdcstMutation = useSelectBrdcstSpnsr(() => {
    refetchAdvanceCheck()
    qc.invalidateQueries({ queryKey: seasonKeys.events(ssntYr) })
    qc.invalidateQueries({ queryKey: staffHireKeys.candidates() })
  })

  const [eventsPage, setEventsPage] = useState(0)
  const PAGE_SIZE = 20

  const ssntYr = CURRENT_SEASON_YEAR
  const { currentGame } = useGame()
  const userTmId = currentGame?.userTeamId ?? null
  const getByTmId = useTeamMetaStore((s) => s.getByTmId)
  const userTeamMeta = getByTmId(userTmId)

  const { data: season } = useSeason(ssntYr)
  const { data: standings = [] } = useStandings(ssntYr)
  const userStanding = standings.find((s) => s.tmId === userTmId) ?? null
  const { data: eventsData, isLoading } = useSeasonEvents(ssntYr, eventsPage, PAGE_SIZE, userTmId ?? undefined)
  const events = eventsData?.content ?? []
  const eventsTotalPages = eventsData?.totalPages ?? 0
  const eventsTotalElements = eventsData?.totalElements ?? 0

  const reloadEventsMutation = useMutation({
    mutationFn: () => seasonApi.getEvents(ssntYr, { page: eventsPage, size: PAGE_SIZE, ...(userTmId ? { tmId: userTmId } : {}) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: seasonKeys.events(ssntYr) })
    },
  })
  const { data: advanceCheck, refetch: refetchAdvanceCheck } = useAdvanceCheck(ssntYr)
  const markRead = useMarkEventRead(ssntYr)
  const advanceToSpringMutation = useAdvanceToSpring(ssntYr)

  const handleSelectEvent = (evntId: number) => {
    setSelectedEvntId(evntId)
    const event = events.find((e) => e.evntId === evntId)
    if (event && event.rdYn === '0') {
      markRead.mutate(evntId)
    }
  }

  const selectedEvent = events.find((e) => e.evntId === selectedEvntId) ?? null

  // 경기 완료 후 GAME 이벤트 자동 선택
  useEffect(() => {
    if (!autoSelectGameDt || events.length === 0) return
    const gameEvent = events.find((e) => e.evntTypeCd === 'GAME' && e.evntDt === autoSelectGameDt)
    if (gameEvent) {
      setSelectedEvntId(gameEvent.evntId)
      setAutoSelectGameDt(null)
    }
  }, [events, autoSelectGameDt])

  // ----- 감독·코치 선임 -----

  function openStaffHire() {
    setStaffHireOpen(true)
  }

  function handleStaffHired() {
    qc.invalidateQueries({ queryKey: staffHireKeys.current() })
    qc.invalidateQueries({ queryKey: seasonKeys.events(ssntYr) })
    setEventsPage(0)
    refetchAdvanceCheck()
  }

  // ----- 스프링 캠프 선택 -----

  function openSpringCamp() {
    setSpringCampOpen(true)
  }

  function handleSpringCampSelected() {
    qc.invalidateQueries({ queryKey: seasonKeys.events(ssntYr) })
    setEventsPage(0)
    refetchAdvanceCheck()
  }

  // ----- 외국인 선수 계약 -----

  function openFrgnPlr() {
    setFrgnPlrOpen(true)
  }

  // 스프링 캠프 선택 후 2월 15일로 날짜 이동
  function handleAdvanceToSpring() {
    advanceToSpringMutation.mutate()
  }

  // ----- 경기 시뮬레이션 -----

  function handleSimulateGames() {
    const gameDt = advanceCheck?.currentDate
    if (!gameDt) return

    setGameSimOpen(true)
    setGameSimProgress({ step: 0, total: 8, message: '경기 시뮬레이션 준비 중...', done: false })

    const es = new EventSource(`${API_BASE}/game/simulate?ssntYr=${ssntYr}&gameDt=${gameDt}`)
    gameSimEsRef.current = es

    es.onmessage = (event) => {
      const data: EventProgress & { ssntYr?: number; gameDt?: string } = JSON.parse(event.data)
      setGameSimProgress(data)
      if (data.done) {
        es.close()
        gameSimEsRef.current = null
        setTimeout(() => {
          refetchAdvanceCheck()
          qc.invalidateQueries({ queryKey: seasonKeys.events(ssntYr) })
          setEventsPage(0)
          setAutoSelectGameDt(gameDt)
        }, 800)
      }
      if (data.error) {
        es.close()
        gameSimEsRef.current = null
      }
    }
    es.onerror = () => {
      es.close()
      gameSimEsRef.current = null
      setGameSimProgress((prev) =>
        prev ? { ...prev, error: '서버 연결이 끊어졌습니다. 다시 시도해주세요.' } : null
      )
    }
  }

  function closeGameSim() {
    gameSimEsRef.current?.close()
    gameSimEsRef.current = null
    setGameSimOpen(false)
    setGameSimProgress(null)
  }


  // ----- 날짜 진행 (월간/주간 자동 트리거) -----

  const advanceMutation = useAdvanceSeason(ssntYr)

  function handleAdvance() {
    advanceMutation.mutate(undefined, {
      onSuccess: (newSeason) => {
        setEventsPage(0)
        const newDt = newSeason?.curDt
        if (!newDt) return
        const [yr, mon, day] = newDt.split('-').map(Number)
        const dayOfWeek = new Date(yr, mon - 1, day).getDay()

        if (day === 1) {
          const prevMon = mon === 1 ? 12 : mon - 1
          triggerMonthlySettle(ssntYr, prevMon, newDt, mon === 11)
        } else if (dayOfWeek === 1) {
          triggerWeeklyProcess(ssntYr, newDt)
        }
      },
    })
  }

  function triggerMonthlySettle(yr: number, mon: number, evntDt: string, isNovember = false) {
    setMonthlyOpen(true)
    setMonthlyProgress({ step: 0, total: 6, message: '월간 정산 준비 중...', done: false })

    const es = new EventSource(
      `${API_BASE}/game/monthly-settle?ssntYr=${yr}&mon=${mon}&evntDt=${evntDt}`
    )
    monthlyEsRef.current = es

    es.onmessage = (event) => {
      const data: EventProgress = JSON.parse(event.data)
      setMonthlyProgress(data)
      if (data.done) {
        es.close()
        monthlyEsRef.current = null
        setTimeout(() => {
          qc.invalidateQueries({ queryKey: seasonKeys.events(ssntYr) })
          if (isNovember) {
            triggerSeasonEnd(yr, evntDt)
          }
        }, 800)
      }
      if (data.error) {
        es.close()
        monthlyEsRef.current = null
      }
    }
    es.onerror = () => {
      es.close()
      monthlyEsRef.current = null
      setMonthlyProgress((prev) =>
        prev ? { ...prev, error: '서버 연결이 끊어졌습니다.' } : null
      )
    }
  }

  function closeMonthly() {
    monthlyEsRef.current?.close()
    monthlyEsRef.current = null
    setMonthlyOpen(false)
    setMonthlyProgress(null)
  }

  function triggerWeeklyProcess(yr: number, weekDt: string) {
    setWeeklyOpen(true)
    setWeeklyProgress({ step: 0, total: 10, message: '주간 처리 준비 중...', done: false })

    const es = new EventSource(
      `${API_BASE}/game/weekly-process?ssntYr=${yr}&weekDt=${weekDt}`
    )
    weeklyEsRef.current = es

    es.onmessage = (event) => {
      const data: EventProgress = JSON.parse(event.data)
      setWeeklyProgress(data)
      if (data.done) {
        es.close()
        weeklyEsRef.current = null
        setTimeout(() => {
          qc.invalidateQueries({ queryKey: seasonKeys.events(ssntYr) })
        }, 500)
      }
      if (data.error) {
        es.close()
        weeklyEsRef.current = null
      }
    }
    es.onerror = () => {
      es.close()
      weeklyEsRef.current = null
      setWeeklyProgress((prev) =>
        prev ? { ...prev, error: '서버 연결이 끊어졌습니다.' } : null
      )
    }
  }

  function closeWeekly() {
    weeklyEsRef.current?.close()
    weeklyEsRef.current = null
    setWeeklyOpen(false)
    setWeeklyProgress(null)
  }

  function triggerSeasonEnd(yr: number, evntDt: string) {
    setSeasonEndOpen(true)
    setSeasonEndProgress({ step: 0, total: 14, message: '시즌 종료 처리 준비 중...', done: false })

    const es = new EventSource(
      `${API_BASE}/game/season-end?ssntYr=${yr}&evntDt=${evntDt}`
    )
    seasonEndEsRef.current = es

    es.onmessage = (event) => {
      const data: EventProgress = JSON.parse(event.data)
      setSeasonEndProgress(data)
      if (data.done) {
        es.close()
        seasonEndEsRef.current = null
        setTimeout(() => {
          qc.invalidateQueries({ queryKey: seasonKeys.events(ssntYr) })
          qc.invalidateQueries({ queryKey: seasonKeys.one(ssntYr) })
        }, 800)
      }
      if (data.error) {
        es.close()
        seasonEndEsRef.current = null
      }
    }
    es.onerror = () => {
      es.close()
      seasonEndEsRef.current = null
      setSeasonEndProgress((prev) =>
        prev ? { ...prev, error: '서버 연결이 끊어졌습니다.' } : null
      )
    }
  }

  function closeSeasonEnd() {
    seasonEndEsRef.current?.close()
    seasonEndEsRef.current = null
    setSeasonEndOpen(false)
    setSeasonEndProgress(null)
  }

  // ----- 다음주까지 진행하기 -----

  const handleAdvanceWeek = useCallback(() => {
    setAdvanceWeekOpen(true)
    setAdvanceWeekProgress({
      processedDays: 0, totalDays: 0,
      currentDate: '', dayOfWeek: '', targetDate: '',
      message: '다음주 월요일까지 진행 준비 중...', done: false, weeklyRequired: false,
    })

    const es = new EventSource(`${API_BASE}/game/advance-week?ssntYr=${ssntYr}`)
    advanceWeekEsRef.current = es

    es.onmessage = (event) => {
      const data: AdvanceWeekProgress = JSON.parse(event.data)
      setAdvanceWeekProgress(data)

      if (data.done) {
        es.close()
        advanceWeekEsRef.current = null

        // 시즌/이벤트 데이터 갱신
        qc.invalidateQueries({ queryKey: seasonKeys.one(ssntYr) })
        qc.invalidateQueries({ queryKey: seasonKeys.events(ssntYr) })
        qc.invalidateQueries({ queryKey: seasonKeys.advanceCheck(ssntYr) })

        if (data.weeklyRequired && data.targetDate) {
          // 1.2초 후 advance-week 다이얼로그 닫고 주간 처리 시작
          advanceWeekTimerRef.current = setTimeout(() => {
            advanceWeekTimerRef.current = null
            setAdvanceWeekOpen(false)
            setAdvanceWeekProgress(null)
            triggerWeeklyProcess(ssntYr, data.targetDate)
          }, 1200)
        }
      }
      if (data.error) {
        es.close()
        advanceWeekEsRef.current = null
      }
    }
    es.onerror = () => {
      es.close()
      advanceWeekEsRef.current = null
      setAdvanceWeekProgress((prev) =>
        prev ? { ...prev, error: '서버 연결이 끊어졌습니다.' } : null
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ssntYr])

  function closeAdvanceWeek() {
    if (advanceWeekTimerRef.current) {
      clearTimeout(advanceWeekTimerRef.current)
      advanceWeekTimerRef.current = null
    }
    advanceWeekEsRef.current?.close()
    advanceWeekEsRef.current = null
    setAdvanceWeekOpen(false)
    setAdvanceWeekProgress(null)
  }

  return {
    season,
    events,
    eventsPage,
    setEventsPage,
    eventsTotalPages,
    eventsTotalElements,
    PAGE_SIZE,
    isLoading,
    reloadEventsMutation,
    ssntYr,
    userTmId,
    userTeamMeta,
    userStanding,
    selectedEvntId,
    setSelectedEvntId,
    selectedEvent,
    handleSelectEvent,
    advanceCheck,
    advanceMutation,
    handleAdvance,
    SSNT_STTS_LABEL,
    // 경기 시뮬레이션
    gameSimOpen,
    gameSimProgress,
    handleSimulateGames,
    closeGameSim,
    // 월간/주간/시즌 종료
    monthlyOpen,
    monthlyProgress,
    closeMonthly,
    weeklyOpen,
    weeklyProgress,
    closeWeekly,
    seasonEndOpen,
    seasonEndProgress,
    closeSeasonEnd,
    // 다음주까지 진행하기
    advanceWeekOpen,
    advanceWeekProgress,
    handleAdvanceWeek,
    closeAdvanceWeek,
    // 감독·코치 선임
    staffHireOpen,
    openStaffHire,
    handleStaffHired,
    setStaffHireOpen,
    // 스프링 캠프
    springCampOpen,
    openSpringCamp,
    handleSpringCampSelected,
    handleAdvanceToSpring,
    setSpringCampOpen,
    advanceToSpringMutation,
    // 외국인 선수 계약
    frgnPlrOpen,
    openFrgnPlr,
    setFrgnPlrOpen,
    // 방송국 인라인 선택
    brdcstOptions,
    selectBrdcstMutation,
  }
}
