import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { teamApi } from '../../api/teamApi'
import { playerApi } from '../../api/playerApi'
import { useGame } from '../../contexts/GameContext'

export interface StartProgress {
  step: number
  total: number
  message: string
  done: boolean
  error?: string
}

export function useNewGamePage() {
  const navigate = useNavigate()
  const { startGame } = useGame()
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null)
  const [starting, setStarting] = useState(false)
  const [progress, setProgress] = useState<StartProgress | null>(null)
  const esRef = useRef<EventSource | null>(null)

  const seasonYear = new Date().getFullYear()

  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: teamApi.getAll,
  })

  const { data: roster = [], isLoading: rosterLoading } = useQuery({
    queryKey: ['players', { tmId: selectedTeamId }],
    queryFn: () => playerApi.getAll({ tmId: selectedTeamId! }),
    enabled: selectedTeamId !== null,
  })

  const selectedTeam = teams.find((t) => t.tmId === selectedTeamId) ?? null

  function handleConfirm() {
    if (!selectedTeamId || !selectedTeam) return
    setStarting(true)
    setProgress({ step: 0, total: 14, message: '시즌 시작 준비 중...', done: false })

    const es = new EventSource(
      `http://localhost:8080/api/game/start?tmId=${selectedTeamId}&ssntYr=${seasonYear}`
    )
    esRef.current = es

    es.onmessage = (event) => {
      const data: StartProgress = JSON.parse(event.data)
      setProgress(data)

      if (data.done) {
        es.close()
        esRef.current = null
        // 컨텍스트에 게임 상태 저장 후 메인 화면으로 이동
        startGame(selectedTeamId, selectedTeam.tmKrNm, seasonYear)
        setTimeout(() => navigate('/season'), 800)
      }
      if (data.error) {
        es.close()
        esRef.current = null
        setStarting(false)
      }
    }

    es.onerror = () => {
      es.close()
      esRef.current = null
      setProgress((prev) => prev
        ? { ...prev, error: '서버 연결이 끊어졌습니다. 다시 시도해주세요.' }
        : null
      )
      setStarting(false)
    }
  }

  return {
    teams,
    teamsLoading,
    selectedTeamId,
    setSelectedTeamId,
    selectedTeam,
    seasonYear,
    roster,
    rosterLoading,
    handleConfirm,
    canConfirm: selectedTeamId !== null,
    starting,
    progress,
  }
}
