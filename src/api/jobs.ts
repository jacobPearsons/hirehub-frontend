import { apiGet } from './client'
import type { Job, JobListParams } from './types'

export async function listJobs(params?: JobListParams) {
  const searchParams = new URLSearchParams()
  if (params?.search) searchParams.set('search', params.search)
  if (params?.category) searchParams.set('category', params.category)
  if (params?.seniority) searchParams.set('seniority', params.seniority)
  if (params?.remote) searchParams.set('remote', params.remote)
  if (params?.cursor) searchParams.set('cursor', params.cursor)
  if (params?.take) searchParams.set('take', String(params.take))

  const qs = searchParams.toString()
  return apiGet<Job[]>(`/jobs${qs ? `?${qs}` : ''}`)
}

export async function getJobById(id: string) {
  return apiGet<Job>(`/jobs/${id}`)
}
