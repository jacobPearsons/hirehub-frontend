import { describe, expect, it } from 'vitest'
import { ALLOWED_TRANSITIONS, STATUS_CONFIG, canTransition } from '../status'
import type { ApplicationStatus } from '../../types/application'

describe('STATUS_CONFIG', () => {
  it('has an entry for all 8 application statuses', () => {
    const statuses: ApplicationStatus[] = ['applied', 'screening', 'shortlist', 'interviewing', 'offer', 'hired', 'rejected', 'withdrawn']
    for (const status of statuses) {
      expect(STATUS_CONFIG[status]).toBeDefined()
      expect(STATUS_CONFIG[status].label.length).toBeGreaterThan(0)
      expect(STATUS_CONFIG[status].color.length).toBeGreaterThan(0)
    }
    expect(Object.keys(STATUS_CONFIG)).toHaveLength(8)
  })
})

describe('ALLOWED_TRANSITIONS', () => {
  it('covers every status key', () => {
    for (const status of Object.keys(ALLOWED_TRANSITIONS) as ApplicationStatus[]) {
      expect(STATUS_CONFIG[status]).toBeDefined()
    }
  })
})

describe('canTransition', () => {
  it('allows screening → interviewing', () => {
    expect(canTransition('screening', 'interviewing')).toBe(true)
  })

  it('does not allow applied → offer', () => {
    expect(canTransition('applied', 'offer')).toBe(false)
  })

  it('rejects unknown transitions', () => {
    expect(canTransition('hired', 'rejected')).toBe(false)
    expect(canTransition('withdrawn', 'applied')).toBe(false)
  })
})
