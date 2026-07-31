import type { Job } from '../data/jobs'
import type { Application, ApplicationStatus } from '../types/application'
import type { BlogPost } from '../data/blog'
import type { PricingTier } from '../data/pricing'

export type { Job, Application, BlogPost, PricingTier }
export type { ApplicationStatus }

export interface ApiUser {
  id: string
  name: string
  email: string
  role: 'SEEKER' | 'EMPLOYER'
  companyName?: string
  phone?: string | null
  bio?: string | null
  avatarUrl?: string | null
  headline?: string | null
  location?: string | null
  skills?: string[]
  resumePath?: string | null
  resumeFileName?: string | null
  salaryMin?: number | null
  salaryMax?: number | null
  currency?: string | null
  remoteOnly?: boolean | null
  employmentType?: string | null
  onboardingCompleted?: boolean
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'seeker' | 'employer'
  companyName?: string
  phone?: string | null
  bio?: string | null
  avatarUrl?: string | null
  headline?: string | null
  location?: string | null
  skills?: string[]
  resumePath?: string | null
  resumeFileName?: string | null
  salaryMin?: number | null
  salaryMax?: number | null
  currency?: string | null
  remoteOnly?: boolean | null
  employmentType?: string | null
  onboardingCompleted?: boolean
}

export interface LoginResponse {
  user: ApiUser
  accessToken: string
}

export interface RegisterResponse {
  user: ApiUser
  accessToken: string
}

export interface RefreshResponse {
  accessToken: string
}

export interface JobListParams {
  search?: string
  category?: string
  seniority?: string
  remote?: string
  cursor?: string
  take?: number
}

export interface BlogListParams {
  cursor?: string
  take?: number
}
