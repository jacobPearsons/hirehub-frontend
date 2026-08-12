import { canTransition } from './status'
import type { Application, ApplicationStatus } from '../types/application'

export const PIPELINE_COLUMNS = [
  { key: 'applied', label: 'Applied', color: 'bg-ink-muted/10 text-ink-muted' },
  { key: 'screening', label: 'Screening', color: 'bg-amber-500/10 text-amber-600' },
  { key: 'shortlist', label: 'Shortlist', color: 'bg-sky-500/10 text-sky-600' },
  { key: 'interviewing', label: 'Interviewing', color: 'bg-violet-500/10 text-violet-600' },
  { key: 'offer', label: 'Offer', color: 'bg-emerald-500/10 text-emerald-600' },
  { key: 'hired', label: 'Hired', color: 'bg-green-600/10 text-green-700' },
] as const

export const TERMINAL_STATUSES = ['rejected', 'withdrawn'] as const

export function groupByStatus(apps: Application[]): Record<string, Application[]> {
  const grouped: Record<string, Application[]> = {}
  for (const col of PIPELINE_COLUMNS) {
    grouped[col.key] = apps.filter((a) => a.status === col.key)
  }
  return grouped
}

export function moveCard(
  columns: Record<string, Application[]>,
  fromKey: string,
  toKey: string,
  appId: string,
): { columns: Record<string, Application[]>; app: Application | null; allowed: boolean } {
  const source = columns[fromKey] ?? []
  const app = source.find((a) => a.id === appId) ?? null
  if (!app) return { columns, app: null, allowed: false }
  if (!canTransition(app.status, toKey as ApplicationStatus)) {
    return { columns, app: null, allowed: false }
  }
  const next: Record<string, Application[]> = { ...columns }
  next[fromKey] = source.filter((a) => a.id !== appId)
  next[toKey] = [app, ...(columns[toKey] ?? [])]
  return { columns: next, app, allowed: true }
}
