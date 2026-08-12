import { describe, expect, it } from 'vitest'
import { PIPELINE_COLUMNS, TERMINAL_STATUSES, groupByStatus, moveCard } from '../kanban'
import type { Application } from '../../types/application'

const baseApp = (overrides: Partial<Application>): Application => ({
  id: 'a1',
  jobId: 'j1',
  jobTitle: 'Engineer',
  company: 'Acme',
  companyLogo: '',
  applicantName: 'Jane Doe',
  applicantEmail: 'jane@example.com',
  coverLetter: 'Hi there',
  status: 'applied',
  submittedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
})

describe('PIPELINE_COLUMNS', () => {
  it('has 6 active columns with key, label and color', () => {
    expect(PIPELINE_COLUMNS).toHaveLength(6)
    for (const col of PIPELINE_COLUMNS) {
      expect(col.key).toEqual(expect.any(String))
      expect(col.label).toEqual(expect.any(String))
      expect(col.color).toEqual(expect.any(String))
    }
  })
})

describe('TERMINAL_STATUSES', () => {
  it('only contains rejected and withdrawn', () => {
    expect([...TERMINAL_STATUSES]).toEqual(['rejected', 'withdrawn'])
  })
})

describe('groupByStatus', () => {
  it('groups apps into their active column', () => {
    const apps = [
      baseApp({ id: 'a1', status: 'applied' }),
      baseApp({ id: 'a2', status: 'screening' }),
      baseApp({ id: 'a3', status: 'interviewing' }),
    ]
    const grouped = groupByStatus(apps)
    expect(grouped.applied?.map((a) => a.id)).toEqual(['a1'])
    expect(grouped.screening?.map((a) => a.id)).toEqual(['a2'])
    expect(grouped.interviewing?.map((a) => a.id)).toEqual(['a3'])
  })

  it('excludes terminal status apps from columns', () => {
    const apps = [
      baseApp({ id: 'a1', status: 'rejected' }),
      baseApp({ id: 'a2', status: 'withdrawn' }),
      baseApp({ id: 'a3', status: 'applied' }),
    ]
    const grouped = groupByStatus(apps)
    expect(grouped.rejected ?? []).toHaveLength(0)
    expect(grouped.withdrawn ?? []).toHaveLength(0)
    expect(grouped.applied?.map((a) => a.id)).toEqual(['a3'])
  })

  it('includes every active column key even when empty', () => {
    const grouped = groupByStatus([])
    for (const col of PIPELINE_COLUMNS) {
      expect(grouped[col.key]).toBeDefined()
      expect(grouped[col.key]).toHaveLength(0)
    }
  })
})

describe('moveCard', () => {
  const columns = groupByStatus([
    baseApp({ id: 'a1', status: 'applied' }),
    baseApp({ id: 'a2', status: 'screening' }),
    baseApp({ id: 'a3', status: 'offer' }),
  ])

  it('moves a card between legal columns and returns the app', () => {
    const result = moveCard(columns, 'applied', 'screening', 'a1')
    expect(result.allowed).toBe(true)
    expect(result.app?.id).toBe('a1')
    expect(result.columns.applied?.map((a) => a.id)).toEqual([])
    expect(result.columns.screening?.map((a) => a.id)).toEqual(['a1', 'a2'])
  })

  it('prepends the moved card to the destination column', () => {
    const result = moveCard(columns, 'screening', 'interviewing', 'a2')
    expect(result.columns.interviewing?.map((a) => a.id)).toEqual(['a2'])
  })

  it('returns allowed:false for an illegal applied → offer move and does not mutate columns', () => {
    const result = moveCard(columns, 'applied', 'offer', 'a1')
    expect(result.allowed).toBe(false)
    expect(result.app).toBeNull()
    expect(result.columns).toBe(columns)
    expect(result.columns.applied?.map((a) => a.id)).toEqual(['a1'])
    expect(result.columns.offer?.map((a) => a.id)).toEqual(['a3'])
  })

  it('returns allowed:false for a same-column move', () => {
    const result = moveCard(columns, 'applied', 'applied', 'a1')
    expect(result.allowed).toBe(false)
    expect(result.app).toBeNull()
  })

  it('returns allowed:false when the app is not in the source column', () => {
    const result = moveCard(columns, 'interviewing', 'offer', 'a1')
    expect(result.allowed).toBe(false)
    expect(result.app).toBeNull()
  })

  it('cannot move a card out of a terminal status', () => {
    const withTerminal = groupByStatus([baseApp({ id: 'a9', status: 'rejected' })])
    const result = moveCard(withTerminal, 'rejected', 'applied', 'a9')
    expect(result.allowed).toBe(false)
    expect(result.app).toBeNull()
  })

  it('allows offer → hired', () => {
    const result = moveCard(columns, 'offer', 'hired', 'a3')
    expect(result.allowed).toBe(true)
    expect(result.app?.id).toBe('a3')
    expect(result.columns.hired?.map((a) => a.id)).toEqual(['a3'])
  })
})
