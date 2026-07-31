import { apiGet, apiPost, apiDelete } from './client'
import type { Job } from './types'

interface SavedJobRecord {
  id: string
  userId: string
  jobId: string
  job: Job
}

export async function listSavedJobs() {
  const res = await apiGet<SavedJobRecord[]>('/saved-jobs')
  return { ...res, data: res.data.map((record) => record.job) }
}

export async function saveJob(jobId: string) {
  return apiPost<void>('/saved-jobs', { jobId })
}

export async function removeSavedJob(jobId: string) {
  return apiDelete(`/saved-jobs/${jobId}`)
}
