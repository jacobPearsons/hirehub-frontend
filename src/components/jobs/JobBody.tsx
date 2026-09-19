import type { Job } from '../../data/jobs'

const DEFINITIONAL_CUES = ['is a', 'is the', 'is building', 'is revolutionizing', 'creates', 'powers', "world's", 'in the world', 'is one of']
const PRESENCE_CUES = ['is featured on', 'is listed on', 'is posted on', 'appears on', 'is advertised on', 'can be found on']
const RECRUITMENT_CUES = ['looking for', 'seeking', 'to join', "we're", 'we are']
const ROLE_FLUFF_CUES = ['this role', 'this is an', 'this is a', 'opportunity', 'ideal for']

function scoreCompanyParagraph(paragraph: string, company: string): number {
  const lower = paragraph.toLowerCase()
  const companyFirst = company.split(' ')[0].toLowerCase()
  let score = 0
  if (lower.startsWith(companyFirst) || lower.startsWith(`${companyFirst}'s`)) {
    score += 2
  }
  if (DEFINITIONAL_CUES.some((cue) => lower.includes(cue))) {
    score += 1
  }
  if (PRESENCE_CUES.some((cue) => lower.includes(cue))) {
    score += 1
  }
  if (RECRUITMENT_CUES.some((cue) => lower.includes(cue))) {
    score -= 2
  }
  if (ROLE_FLUFF_CUES.some((cue) => lower.includes(cue))) {
    score -= 1
  }
  return score
}

// eslint-disable-next-line react-refresh/only-export-components
export function getCompanySummary(company: string, description: string): string | undefined {
  const paragraphs = description
    .split('\n\n')
    .map((p) => p.trim())
    .filter(Boolean)
  let best: string | undefined
  let bestScore = 0
  for (const paragraph of paragraphs) {
    const score = scoreCompanyParagraph(paragraph, company)
    if (score > bestScore) {
      bestScore = score
      best = paragraph
    }
  }
  return bestScore >= 3 ? best : undefined
}

interface JobBodyProps {
  job: Job
}

export function JobBody({ job }: JobBodyProps) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-[28px] leading-[1.2] font-medium mb-4">About this role</h2>
        {job.description ? job.description.split('\n\n').map((paragraph, i) => (
          <p key={i} className="text-base leading-[1.7] text-ink-muted mb-4">
            {paragraph}
          </p>
        )) : null}
      </section>

      <section>
        <h2 className="text-[28px] leading-[1.2] font-medium mb-4">Requirements</h2>
        <ul className="list-disc list-inside space-y-2 text-base text-ink-muted">
          {job.requirements.map((req, i) => (
            <li key={i}>{req}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-[28px] leading-[1.2] font-medium mb-4">Responsibilities</h2>
        <ol className="list-decimal list-inside space-y-2 text-base text-ink-muted">
          {job.responsibilities.map((resp, i) => (
            <li key={i}>{resp}</li>
          ))}
        </ol>
      </section>
    </div>
  )
}
