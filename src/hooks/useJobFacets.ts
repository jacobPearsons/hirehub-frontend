import { useQuery } from '@tanstack/react-query'
import { getJobFacets } from '../api/jobs'

export function useJobFacets() {
  return useQuery({
    queryKey: ['job-facets'],
    queryFn: getJobFacets,
  })
}
