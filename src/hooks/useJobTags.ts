import { useQuery } from '@tanstack/react-query'
import { searchJobTags } from '../api/jobs'

export function useJobTags(q: string) {
  return useQuery({
    queryKey: ['job-tags', q],
    queryFn: () => searchJobTags(q),
    enabled: q.trim().length > 0,
    staleTime: 60_000,
  })
}
