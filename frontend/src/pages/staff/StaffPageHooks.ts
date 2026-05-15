import { useState } from 'react'
import { useStaffs } from '../../hooks/useStaffs'
import { useTeams } from '../../hooks/useTeams'
import { STFF_TYPE_LABEL } from '../../types/staff'

export function useStaffPage() {
  const [selectedTmId, setSelectedTmId] = useState<number | undefined>(undefined)
  const [stffTypeCd, setStffTypeCd] = useState<string | undefined>(undefined)

  const { data: teams } = useTeams()
  const { data: staffs, isLoading } = useStaffs({ tmId: selectedTmId, stffTypeCd })

  const handleTmChange = (value: string) => setSelectedTmId(value ? Number(value) : undefined)
  const handleTypeChange = (value: string) => setStffTypeCd(value || undefined)

  return {
    teams,
    staffs,
    isLoading,
    selectedTmId,
    stffTypeCd,
    handleTmChange,
    handleTypeChange,
    STFF_TYPE_LABEL,
  }
}
