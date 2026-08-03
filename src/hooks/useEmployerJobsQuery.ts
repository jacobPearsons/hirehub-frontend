import { useQuery } from '@tanstack/react-query'
import { listEmployerJobs } from '../api/jobs'

export function useEmployerJobsQuery() {
  return useQuery({
    queryKey: ['employerJobs'],
    queryFn: listEmployerJobs,
  })
}
