import { apiGet, apiPost, apiDelete } from './client'
import type { Job } from './types'

export async function listSavedJobs() {
  return apiGet<Job[]>('/saved-jobs')
}

export async function saveJob(jobId: string) {
  return apiPost<void>('/saved-jobs', { jobId })
}

export async function removeSavedJob(jobId: string) {
  return apiDelete(`/saved-jobs/${jobId}`)
}
