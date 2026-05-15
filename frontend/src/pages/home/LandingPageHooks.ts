import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGame, type GameSave } from '../../contexts/GameContext'

export function useLandingPage() {
  const navigate = useNavigate()
  const { savedGames, loadGame, deleteSave } = useGame()
  const [loadDialogOpen, setLoadDialogOpen] = useState(false)

  function handleNewGame() {
    navigate('/new-game')
  }

  function handleOpenLoad() {
    setLoadDialogOpen(true)
  }

  function handleLoad(save: GameSave) {
    loadGame(save)
    setLoadDialogOpen(false)
    navigate('/season')
  }

  return {
    savedGames,
    loadDialogOpen,
    setLoadDialogOpen,
    handleNewGame,
    handleOpenLoad,
    handleLoad,
    handleDelete: deleteSave,
    hasSaves: savedGames.length > 0,
  }
}
