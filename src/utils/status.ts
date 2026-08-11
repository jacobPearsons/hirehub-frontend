import type { ApplicationStatus } from '../types/application'

export const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string }> = {
  applied: { label: 'Applied', color: 'bg-ink-muted/10 text-ink-muted' },
  screening: { label: 'Screening', color: 'bg-amber-500/10 text-amber-600' },
  shortlist: { label: 'Shortlist', color: 'bg-sky-500/10 text-sky-600' },
  interviewing: { label: 'Interviewing', color: 'bg-violet-500/10 text-violet-600' },
  offer: { label: 'Offer', color: 'bg-emerald-500/10 text-emerald-600' },
  hired: { label: 'Hired', color: 'bg-green-600/10 text-green-700' },
  rejected: { label: 'Rejected', color: 'bg-error/10 text-error' },
  withdrawn: { label: 'Withdrawn', color: 'bg-ink-muted/10 text-ink-muted' },
}

export const ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  applied: ['screening', 'shortlist', 'rejected', 'withdrawn'],
  screening: ['shortlist', 'interviewing', 'rejected', 'withdrawn', 'applied'],
  shortlist: ['interviewing', 'offer', 'rejected', 'withdrawn'],
  interviewing: ['offer', 'rejected', 'withdrawn'],
  offer: ['hired', 'rejected', 'withdrawn'],
  hired: [],
  rejected: [],
  withdrawn: [],
}

export function canTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false
}
