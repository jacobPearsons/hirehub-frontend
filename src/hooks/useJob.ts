import { useQuery } from '@tanstack/react-query'
import { getJobById } from '../api/jobs'

export function useJob(id: string) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => getJobById(id),
    select: (data) => data.data,
    enabled: !!id,
  })
}
