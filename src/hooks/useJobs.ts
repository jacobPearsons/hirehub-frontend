import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { listJobs } from '../api/jobs'
import type { JobListParams } from '../api/types'

const PAGE_SIZE = 12

export function useJobs(params: JobListParams = {}) {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => listJobs(params),
    select: (data) => data.data,
  })
}

export interface InfiniteJobsParams {
  search?: string
  category?: string
  seniority?: string
  location?: string
  remote?: string
  salaryMin?: number
  salaryMax?: number
  sort?: 'relevance' | 'recent' | 'salary_high' | 'salary_low' | 'remote_first' | 'random'
}

export function useInfiniteJobs(params: InfiniteJobsParams) {
  const filters: InfiniteJobsParams = { ...params }
  return useInfiniteQuery({
    queryKey: ['jobs', 'infinite', filters],
    queryFn: ({ pageParam }) =>
      listJobs({
        ...filters,
        take: PAGE_SIZE,
        ...(pageParam ? { cursor: pageParam } : {}),
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.pagination?.cursor ?? undefined,
    select: (data) => ({
      jobs: data.pages.flatMap((page) => page.data),
      total: data.pages[data.pages.length - 1]?.pagination?.total ?? 0,
    }),
  })
}
