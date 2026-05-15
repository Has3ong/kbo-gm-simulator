import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { deleteSaveData } from '../api/saveApi'

export interface GameSave {
  userTeamId: number
  userTeamName: string
  ssntYr: number
  savedAt: string
}

interface GameContextValue {
  currentGame: GameSave | null
  savedGames: GameSave[]
  startGame: (teamId: number, teamName: string, ssntYr: number) => void
  loadGame: (save: GameSave) => void
  clearGame: () => void
  deleteSave: (save: GameSave) => void
}

const STORAGE_KEY = 'kbo_gm_saves'
const CURRENT_KEY = 'kbo_gm_current'

function loadSaves(): GameSave[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

function persistSaves(saves: GameSave[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves))
}

function loadCurrent(): GameSave | null {
  try {
    const raw = localStorage.getItem(CURRENT_KEY)
    return raw ? (JSON.parse(raw) as GameSave) : null
  } catch {
    return null
  }
}

function persistCurrent(game: GameSave | null) {
  if (game) localStorage.setItem(CURRENT_KEY, JSON.stringify(game))
  else localStorage.removeItem(CURRENT_KEY)
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [savedGames, setSavedGames] = useState<GameSave[]>(loadSaves)
  const [currentGame, setCurrentGameState] = useState<GameSave | null>(loadCurrent)

  const setCurrentGame = useCallback((game: GameSave | null | ((cur: GameSave | null) => GameSave | null)) => {
    setCurrentGameState((cur) => {
      const next = typeof game === 'function' ? game(cur) : game
      persistCurrent(next)
      return next
    })
  }, [])

  const startGame = useCallback((teamId: number, teamName: string, ssntYr: number) => {
    const save: GameSave = {
      userTeamId: teamId,
      userTeamName: teamName,
      ssntYr,
      savedAt: new Date().toISOString(),
    }
    setSavedGames((prev) => {
      const filtered = prev.filter(
        (s) => !(s.userTeamId === teamId && s.ssntYr === ssntYr),
      )
      const next = [save, ...filtered]
      persistSaves(next)
      return next
    })
    setCurrentGame(save)
  }, [setCurrentGame])

  const loadGame = useCallback((save: GameSave) => {
    setCurrentGame(save)
  }, [setCurrentGame])

  const clearGame = useCallback(() => {
    setCurrentGame(null)
  }, [setCurrentGame])

  const deleteSave = useCallback((save: GameSave) => {
    deleteSaveData(save.ssntYr).catch(() => {})
    setSavedGames((prev) => {
      const next = prev.filter(
        (s) => !(s.userTeamId === save.userTeamId && s.ssntYr === save.ssntYr),
      )
      persistSaves(next)
      return next
    })
    setCurrentGame((cur) =>
      cur && cur.userTeamId === save.userTeamId && cur.ssntYr === save.ssntYr ? null : cur,
    )
  }, [setCurrentGame])

  return (
    <GameContext.Provider value={{ currentGame, savedGames, startGame, loadGame, clearGame, deleteSave }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
