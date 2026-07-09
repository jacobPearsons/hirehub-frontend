import { apiGet, apiPost, apiPatch } from './client'
import type { Application, ApplicationStatus } from './types'

export async function createApplication(data: {
  jobId: string
  applicantName: string
  applicantEmail: string
  applicantPhone?: string
  coverLetter: string
  portfolioUrl?: string
}) {
  return apiPost<Application>('/applications', data)
}

export async function listApplications() {
  return apiGet<Application[]>('/applications')
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  return apiPatch<Application>(`/applications/${id}/status`, { status })
}
