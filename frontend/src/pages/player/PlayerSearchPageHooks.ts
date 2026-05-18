import { useState, useEffect, useRef } from 'react'
import type { PlrSearchParams } from '../../api/playerApi'
import { usePlayerSearch } from '../../hooks/usePlayers'

export function usePlayerSearchPage() {
  const [searchParams, setSearchParams] = useState<PlrSearchParams>({})
  const [debouncedParams, setDebouncedParams] = useState<PlrSearchParams>({})
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setDebouncedParams(searchParams)
    }, 300)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [searchParams])

  const hasFilter = Object.values(debouncedParams).some(
    (v) => v !== undefined && v !== '' && v !== null,
  )

  const query = usePlayerSearch(debouncedParams, hasFilter)

  function setField<K extends keyof PlrSearchParams>(key: K, value: PlrSearchParams[K]) {
    setSearchParams((prev) => ({ ...prev, [key]: value || undefined }))
  }

  function clearParams() {
    setSearchParams({})
  }

  return {
    searchParams,
    setField,
    clearParams,
    advancedOpen,
    setAdvancedOpen,
    players: query.data ?? [],
    isLoading: query.isLoading,
    hasFilter,
  }
}
