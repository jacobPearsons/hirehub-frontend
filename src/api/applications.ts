import { apiGet, apiPost, apiPatch } from './client'
import type { Application, ApplicationStatus } from '../types/application'
import type { InterviewDetails, OfferDetails, OnboardingChecklistItem, OrientationDetails } from '../types/hiring-flow'

interface BackendJobSummary {
  title: string
  company: string
  companyLogo?: string | null
}

export interface BackendApplication {
  id: string
  jobId: string
  job?: BackendJobSummary | null
  applicantName: string
  applicantEmail: string
  applicantPhone?: string | null
  coverLetter: string
  portfolioUrl?: string | null
  resumeFileName?: string | null
  status: string
  submittedAt: string
  interviewData?: unknown
  offerData?: unknown
  preboardingData?: unknown
  orientationData?: unknown
}

const STATUS_TO_UPPER: Record<ApplicationStatus, string> = {
  applied: 'APPLIED',
  reviewing: 'REVIEWING',
  interviewing: 'INTERVIEWING',
  rejected: 'REJECTED',
  offer: 'OFFER',
}

export function normalizeApplication(raw: BackendApplication): Application {
  const status = String(raw.status ?? 'APPLIED').toLowerCase() as ApplicationStatus
  return {
    id: raw.id,
    jobId: raw.jobId,
    jobTitle: raw.job?.title ?? '',
    company: raw.job?.company ?? '',
    companyLogo: raw.job?.companyLogo ?? '',
    applicantName: raw.applicantName,
    applicantEmail: raw.applicantEmail,
    applicantPhone: raw.applicantPhone ?? undefined,
    coverLetter: raw.coverLetter,
    portfolioUrl: raw.portfolioUrl ?? undefined,
    resumeFileName: raw.resumeFileName ?? undefined,
    status,
    submittedAt: raw.submittedAt,
    interviewDetails: (raw.interviewData as InterviewDetails) ?? undefined,
    offerDetails: (raw.offerData as OfferDetails) ?? undefined,
    preBoardingChecklist: (raw.preboardingData as OnboardingChecklistItem[]) ?? undefined,
    orientationDetails: (raw.orientationData as OrientationDetails) ?? undefined,
  }
}

export async function createApplication(data: {
  jobId: string
  applicantName: string
  applicantEmail: string
  applicantPhone?: string
  coverLetter: string
  portfolioUrl?: string
  resumePath?: string
  resumeFileName?: string
}) {
  const res = await apiPost<BackendApplication>('/applications', data)
  return { ...res, data: normalizeApplication(res.data) }
}

export async function listApplications() {
  const res = await apiGet<BackendApplication[]>('/applications')
  return { ...res, data: res.data.map(normalizeApplication) }
}

export async function listEmployerApplications() {
  const res = await apiGet<BackendApplication[]>('/applications/employer/me')
  return { ...res, data: res.data.map(normalizeApplication) }
}

export async function updateApplicationStatus(id: string, status: ApplicationStatus) {
  const res = await apiPatch<BackendApplication>(`/applications/${id}/status`, { status: STATUS_TO_UPPER[status] })
  return { ...res, data: normalizeApplication(res.data) }
}

export async function updateHiringData(applicationId: string, data: {
  interviewData?: unknown | null
  offerData?: unknown | null
  preboardingData?: unknown | null
  orientationData?: unknown | null
}) {
  const res = await apiPatch<BackendApplication>(`/applications/${applicationId}/hiring-data`, data)
  return { ...res, data: normalizeApplication(res.data) }
}

export interface CandidateProfile {
  id: string
  name: string
  email: string
  phone?: string | null
  avatarUrl?: string | null
  headline?: string | null
  location?: string | null
  skills?: string[]
  bio?: string | null
  resumePath?: string | null
  resumeFileName?: string | null
  salaryMin?: number | null
  salaryMax?: number | null
  currency?: string | null
  remoteOnly?: boolean | null
  employmentType?: string | null
  onboardingCompleted?: boolean
  createdAt: string
}

export interface CandidateResponse {
  application: BackendApplication
  candidate: CandidateProfile
}

export async function getCandidateProfile(applicationId: string) {
  const res = await apiGet<CandidateResponse>(`/applications/${applicationId}/candidate`)
  return {
    ...res,
    data: {
      ...res.data,
      application: normalizeApplication(res.data.application),
    },
  }
}

export function resumeFileUrl(resumePath: string) {
  const base = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:4000/api'
  const origin = base.replace(/\/+$/, '').replace(/\/api$/, '')
  return `${origin}/uploads/resumes/${encodeURIComponent(resumePath)}`
}
