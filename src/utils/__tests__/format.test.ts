import { describe, expect, it } from 'vitest'
import { formatSalary } from '../format'

describe('formatSalary', () => {
  it('formats a salary range', () => {
    expect(formatSalary(142000, 191000, 'USD')).toBe('$142,000 - $191,000')
  })

  it('returns null when currency is missing', () => {
    expect(formatSalary(142000, 191000, undefined)).toBeNull()
    expect(formatSalary(142000, 191000, null)).toBeNull()
    expect(formatSalary(142000, 191000, '')).toBeNull()
  })

  it('returns null when min or max is missing', () => {
    expect(formatSalary(null, 191000, 'USD')).toBeNull()
    expect(formatSalary(142000, undefined, 'USD')).toBeNull()
  })

  it('returns null for an invalid currency code', () => {
    expect(formatSalary(142000, 191000, 'not-a-code')).toBeNull()
  })
})
