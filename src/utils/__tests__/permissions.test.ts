import { describe, expect, it } from 'vitest'
import { canManageApplications } from '../permissions'

describe('canManageApplications', () => {
  it('returns false for a null user', () => {
    expect(canManageApplications(null)).toBe(false)
  })

  it('returns true for an admin without permissions', () => {
    expect(canManageApplications({ role: 'admin' })).toBe(true)
  })

  it('returns true for an employer with application:update', () => {
    expect(canManageApplications({ role: 'employer', permissions: ['application:update'] })).toBe(true)
  })

  it('returns true for an employer with application:*', () => {
    expect(canManageApplications({ role: 'employer', permissions: ['application:*'] })).toBe(true)
  })

  it('returns true for an employer with *:*', () => {
    expect(canManageApplications({ role: 'employer', permissions: ['*:*'] })).toBe(true)
  })

  it('returns false for an employer with an unrelated permission', () => {
    expect(canManageApplications({ role: 'employer', permissions: ['job:create'] })).toBe(false)
  })

  it('returns false for an employer with no permissions array', () => {
    expect(canManageApplications({ role: 'employer' })).toBe(false)
  })
})
