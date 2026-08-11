import type { InterviewDetails, OfferDetails, OnboardingChecklistItem, OrientationDetails } from './hiring-flow'

export type ApplicationStatus =
  | 'applied' | 'screening' | 'shortlist' | 'interviewing'
  | 'offer' | 'hired' | 'rejected' | 'withdrawn'

export interface ScreeningAnswer {
  questionId: string
  answerText: string
  score?: number
  matchedKeywords?: string[]
  question?: { prompt: string; expectedKeywords: string[]; maxScore: number }
}

export interface ScreeningResult { score: number; maxPossible: number }

export interface TimelineEntry {
  id: string
  fromStatus: ApplicationStatus | null
  toStatus: ApplicationStatus
  actorRole: string
  createdAt: string
}

export interface Application {
  id: string
  jobId: string
  jobTitle: string
  company: string
  companyLogo: string
  applicantName: string
  applicantEmail: string
  applicantPhone?: string
  coverLetter: string
  portfolioUrl?: string
  resumeFileName?: string
  status: ApplicationStatus
  submittedAt: string
  screeningResult?: ScreeningResult
  screeningAnswers?: ScreeningAnswer[]
  timeline?: TimelineEntry[]
  interviewDetails?: InterviewDetails
  offerDetails?: OfferDetails
  onboardingChecklist?: OnboardingChecklistItem[]
  preBoardingChecklist?: OnboardingChecklistItem[]
  orientationDetails?: OrientationDetails
  interviewData?: Record<string, unknown> | null
  offerData?: Record<string, unknown> | null
  preboardingData?: Array<Record<string, unknown>> | null
  orientationData?: Record<string, unknown> | null
}
