import type { InterviewDetails, OfferDetails, OnboardingChecklistItem, OrientationDetails } from './hiring-flow'

export type ApplicationStatus = 'applied' | 'reviewing' | 'interviewing' | 'rejected' | 'offer'

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
  interviewDetails?: InterviewDetails
  offerDetails?: OfferDetails
  onboardingChecklist?: OnboardingChecklistItem[]
  orientationDetails?: OrientationDetails
}
