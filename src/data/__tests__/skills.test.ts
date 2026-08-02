import { SKILL_CATEGORIES, SKILL_NICHES, ALL_SKILLS } from '../skills'

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
