# Task 1: Extend Data Types

## Task Description

Extend the Application type to support the full PATHMATCH hiring pipeline (interview details, offer details, pre-boarding checklist, orientation details).

## Files to Create

### `src/types/hiring-flow.ts`

Create a new file with these types:

```typescript
export type InterviewType = 'phone' | 'video' | 'in-person'

export interface InterviewDetails {
  interviewType: InterviewType
  interviewDate: string
  interviewTime: string
  interviewerName: string
  interviewerTitle: string
  meetingLink?: string
  meetingLocation?: string
  notes?: string
  scheduledAt: string
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

export interface OnboardingChecklistItem {
  id: string
  label: string
  completed: boolean
  completedAt?: string
}

export interface OrientationDetails {
  date: string
  time: string
  location: string
  agenda: string[]
}
```

## Files to Modify

### `src/types/application.ts`

Current content:
```typescript
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
}
```

Add import for new types and add optional fields:
```typescript
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
```

## Verification

Run: `npx tsc --noEmit`
Expected: Clean compilation (pre-existing test file errors are OK)

## Context

This is the HireHub frontend project at `/home/jacobp/Desktop/Projecs/hirehub-frontend`. It uses React 19, TypeScript 6, Tailwind CSS 3, Vite 8. The project follows a feature-based component organization in `src/components/`.

## Report

Write your report to `/home/jacobp/Desktop/Projecs/hirehub-frontend/.superpowers/sdd/task-1-report.md`
