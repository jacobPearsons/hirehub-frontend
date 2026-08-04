import { SKILL_CATEGORIES, SKILL_NICHES, ALL_SKILLS, detectNiche } from '../skills'

describe('skills data', () => {
  it('covers every niche category with non-empty suggestions', () => {
    for (const { id, label } of SKILL_NICHES) {
      expect(SKILL_CATEGORIES[id].length).toBeGreaterThan(10)
      expect(label.length).toBeGreaterThan(0)
    }
  })

  it('flattens all categories into ALL_SKILLS without loss', () => {
    const flat = Object.values(SKILL_CATEGORIES).flat()
    expect(ALL_SKILLS).toEqual(flat)
  })

  it('keeps distinct values', () => {
    expect(new Set(ALL_SKILLS).size).toBe(ALL_SKILLS.length)
  })
})

describe('detectNiche', () => {
  it('detects the office niche from a customer-service description', () => {
    const { niche } = detectNiche(
      'customer service representative. handle support tickets with Zendesk and phone etiquette.',
    )
    expect(niche).toBe('office')
  })

  it('detects tech from a developer-heavy description', () => {
    const { niche } = detectNiche(
      'We are hiring a React developer who knows TypeScript, Docker, AWS and Node.js.',
    )
    expect(niche).toBe('tech')
  })

  it('falls back to general for gibberish', () => {
    const result = detectNiche('asdlkfjasd qwopuir asd fzxv')
    expect(result.niche).toBe('general')
    expect(result.matches).toEqual([])
  })

  it('returns matches present in the text, excluding already-selected skills', () => {
    const result = detectNiche('Need React and TypeScript', ['React'])
    expect(result.niche).toBe('tech')
    expect(result.matches).toContain('TypeScript')
    expect(result.matches).not.toContain('React')
  })

  it('returns an empty result for empty input', () => {
    expect(detectNiche('')).toEqual({ niche: 'general', matches: [] })
  })
})
