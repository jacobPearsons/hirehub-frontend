export type InterviewType = 'phone' | 'video' | 'website-chat'

export interface InterviewDetails {
  interviewType: InterviewType
  interviewDate: string
  interviewTime: string
  interviewerName: string
  interviewerTitle: string
  meetingLink?: string
  notes?: string
  scheduledAt: string
  conversationId?: string
  questions?: { id: string; prompt: string }[]
}

export type EmploymentType = 'full-time' | 'part-time' | 'contract'

export interface OfferDetails {
  jobTitle: string
  employmentType: EmploymentType
  startDate: string
  hourlyRate: number
  currency: string
  schedule: string
  managerName: string
  managerTitle: string
  responsibilities: string[]
  contingencies: string[]
  expirationDate: string
  accepted?: boolean
  acceptedAt?: string
}

export type ChecklistCategory = 'Documents' | 'IT Setup' | 'Benefits' | 'Training'

export interface OnboardingChecklistItem {
  id: string
  label: string
  title?: string
  description?: string
  category?: ChecklistCategory
  completed: boolean
  completedAt?: string
}

export interface OrientationDetails {
  date: string
  time: string
  location: string
  agenda: string[]
  notes?: string
  dressCode?: string
  parkingInfo?: string
}
