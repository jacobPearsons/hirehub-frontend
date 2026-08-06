import { describe, it, expect } from 'vitest'
import { getLegalDocument, legalDocuments } from '../legalData'

describe('legalDocuments', () => {
  it('defines privacy, terms, and cookies documents in order', () => {
    expect(legalDocuments.map((d) => d.slug)).toEqual(['privacy', 'terms', 'cookies'])
  })

  it('gives every document a title, description, and updated date', () => {
    for (const doc of legalDocuments) {
      expect(doc.title.length).toBeGreaterThan(0)
      expect(doc.description.length).toBeGreaterThan(0)
      expect(doc.updatedAt).toMatch(/^\w+ \d{1,2}, \d{4}$/)
    }
  })

  it('has unique section ids and at least one paragraph per section', () => {
    for (const doc of legalDocuments) {
      const ids = doc.sections.map((s) => s.id)
      expect(new Set(ids).size).toBe(ids.length)
      for (const section of doc.sections) {
        expect(section.id.length).toBeGreaterThan(0)
        expect(section.title.length).toBeGreaterThan(0)
        expect(section.paragraphs.length).toBeGreaterThan(0)
      }
    }
  })

  it('looks up a document by slug', () => {
    expect(getLegalDocument('privacy').title).toBe('Privacy Policy')
    expect(getLegalDocument('terms').title).toBe('Terms of Service')
    expect(getLegalDocument('cookies').title).toBe('Cookie Policy')
  })
})
