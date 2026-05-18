import { useStaffs } from '../../hooks/useStaffs'
import { useGame } from '../../contexts/GameContext'
import { STFF_TYPE_LABEL } from '../../types/staff'

export function useStaffPage() {
  const { currentGame } = useGame()
  const tmId = currentGame?.userTeamId

  const { data: staffs, isLoading } = useStaffs({ tmId })

  return {
    staffs,
    isLoading,
    STFF_TYPE_LABEL,
  }
}
