import { useQuery } from '@tanstack/react-query'
import { getCandidateProfile } from '../api/applications'

export function useCandidateProfileQuery(applicationId: string, enabled: boolean) {
  return useQuery({
    queryKey: ['candidateProfile', applicationId],
    queryFn: () => getCandidateProfile(applicationId),
    enabled,
  })
}
