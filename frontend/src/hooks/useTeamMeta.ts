import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { teamApi } from '../api/teamApi'
import { teamKeys } from './useTeams'
import { useTeamMetaStore } from '../stores/teamMetaStore'

// 앱 시작 시 한 번만 호출. 스토어가 비어 있을 때만 API를 호출하고 채워 넣는다.
export function useInitTeamMeta() {
  const { loaded, setMetas } = useTeamMetaStore()

  const { data: teams } = useQuery({
    queryKey: teamKeys.all,
    queryFn: () => teamApi.getAll(),
    enabled: !loaded,
    staleTime: Infinity,
  })

  useEffect(() => {
    if (teams && !loaded) {
      setMetas(teams)
    }
  }, [teams, loaded, setMetas])
}

// 스토어에서 팀 메타를 읽기 위한 훅. 별도 API 호출 없음.
export function useTeamMeta() {
  return useTeamMetaStore()
}
