import { describe, it, expect } from 'vitest'
import { getCompanySummary } from '../JobBody'

describe('getCompanySummary', () => {
  it('returns a paragraph that defines the company', () => {
    const description = 'Build and maintain the frontend.\n\nSonarSource is a leader in code quality and security solutions, trusted by thousands of organizations worldwide.\n\nRequirements below.'
    expect(getCompanySummary('SonarSource', description)).toBe(
      'SonarSource is a leader in code quality and security solutions, trusted by thousands of organizations worldwide.'
    )
  })

  it('accepts the possessive form of the company name', () => {
    const description = 'You will build systems.\n\nFidelity\'s technology teams power some of the most critical financial infrastructure in the world. Zero tolerance for errors.'
    expect(getCompanySummary('Fidelity Investments', description)).toBe(
      'Fidelity\'s technology teams power some of the most critical financial infrastructure in the world. Zero tolerance for errors.'
    )
  })

  it('rejects a recruitment opening that merely names the company', () => {
    const description = 'Linear is looking for a Junior Frontend Engineer to join our growing team. You will work alongside senior engineers.'
    expect(getCompanySummary('Linear', description)).toBeUndefined()
  })

  it('rejects "is seeking" recruitment phrasing', () => {
    const description = 'STERRY is seeking a creative Ad Graphic Designer to join our marketing team.'
    expect(getCompanySummary('STERRY', description)).toBeUndefined()
  })

  it('returns undefined when no paragraph scores above threshold', () => {
    const description = 'Lead product strategy.\n\nYou will drive customer engagement and retention through insights.'
    expect(getCompanySummary('TransUnion', description)).toBeUndefined()
  })

  it('returns undefined for an empty description', () => {
    expect(getCompanySummary('SonarSource', '')).toBeUndefined()
  })
})