import { useQuery } from '@tanstack/react-query'
import { listJobs } from '../api/jobs'
import type { JobListParams } from '../api/types'

export function useJobs(params: JobListParams = {}) {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => listJobs(params),
  })
}
