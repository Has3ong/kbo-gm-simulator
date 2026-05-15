import { useTeams } from '../../hooks/useTeams'

export function useTeamsPage() {
  const { data: teams, isLoading, error } = useTeams()

  return { teams, isLoading, error }
}
