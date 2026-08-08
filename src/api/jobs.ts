import { apiGet, apiPost, apiPatch, apiDelete } from './client'
import type { Job, JobListParams, TagFacet, JobFacets } from './types'

export interface CreateJobParams {
  title: string
  company: string
  location: string
  remote: boolean
  salaryMin?: number
  salaryMax?: number
  currency: string
  category: string
  seniority: string
  tags: string[]
  description: string
  requirements: string[]
  responsibilities: string[]
  applicationUrl?: string
}

export async function createJob(data: CreateJobParams) {
  return apiPost<Job>('/jobs', data)
}

export async function listJobs(params?: JobListParams) {
  const searchParams = new URLSearchParams()
  if (params?.search) searchParams.set('search', params.search)
  if (params?.category) searchParams.set('category', params.category)
  if (params?.seniority) searchParams.set('seniority', params.seniority)
  if (params?.location) searchParams.set('location', params.location)
  if (params?.remote) searchParams.set('remote', params.remote)
  if (params?.salaryMin !== undefined) searchParams.set('salaryMin', String(params.salaryMin))
  if (params?.salaryMax !== undefined) searchParams.set('salaryMax', String(params.salaryMax))
  if (params?.featured) searchParams.set('featured', params.featured)
  if (params?.sort) searchParams.set('sort', params.sort)
  if (params?.cursor) searchParams.set('cursor', params.cursor)
  if (params?.take) searchParams.set('take', String(params.take))

  const qs = searchParams.toString()
  return apiGet<Job[]>(`/jobs${qs ? `?${qs}` : ''}`)
}

export async function searchJobTags(q: string): Promise<TagFacet[]> {
  const res = await apiGet<TagFacet[]>(`/jobs/tags/search?q=${encodeURIComponent(q)}`)
  return res.data ?? res
}

export async function getJobFacets(): Promise<JobFacets> {
  const res = await apiGet<JobFacets>(`/jobs/facets`)
  return res.data ?? res
}

export async function getJobById(id: string) {
  return apiGet<Job>(`/jobs/${id}`)
}

export async function updateJob(id: string, data: Partial<CreateJobParams>) {
  return apiPatch<Job>(`/jobs/${id}`, data)
}

export async function deleteJob(id: string) {
  return apiDelete(`/jobs/${id}`)
}

export async function listEmployerJobs() {
  return apiGet<Job[]>('/jobs/employer/me')
}
