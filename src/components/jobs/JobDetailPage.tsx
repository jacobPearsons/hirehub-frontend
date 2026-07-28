import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Section, Container } from '../ui'
import { HeroContent } from '../ui/HeroContent'
import { usePageMeta } from '../../utils/usePageMeta'
import { getJobById } from '../../api/jobs'
import { JobHeader } from './JobHeader'
import { JobBody } from './JobBody'
import { CompanySidebar } from './CompanySidebar'
import { SaveButton } from './SaveButton'
import type { Job } from '../../data/jobs'

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    getJobById(id)
      .then(res => setJob(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const meta = usePageMeta({
    title: job ? `${job.title} | HireHub Community` : 'Job | HireHub Community',
    description: job ? job.description.slice(0, 160).replace(/\s+\S*$/, '') : undefined,
    image: job?.companyLogo,
    url: job ? `/jobs/${job.id}` : undefined,
  })

  if (loading) {
    return (
      <>
        {meta}
        <Section>
          <Container><div className="text-center py-24"><p className="text-ink-muted">Loading...</p></div></Container>
        </Section>
      </>
    )
  }

  if (!job || error) {
    return (
      <>
        {meta}
        <Section>
          <Container>
            <div className="text-center py-24">
              <HeroContent variant="accent" className="mb-6">
                <h1 className="text-[40px] leading-[1.15] tracking-[-0.8px] font-medium">Job not found</h1>
                <p className="text-ink-muted mt-2">The job you're looking for doesn't exist or has been removed.</p>
              </HeroContent>
              <Link to="/jobs" className="text-accent hover:underline text-sm font-medium">Back to all jobs</Link>
            </div>
          </Container>
        </Section>
      </>
    )
  }

  return (
    <>
      {meta}
      <Section>
        <Container>
          <div className="flex items-center justify-between mb-8">
            <HeroContent variant="accent" className="mb-8">
              <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-ink-muted">
                <Link to="/jobs" className="hover:text-ink transition-colors">Jobs</Link>
                <span aria-hidden="true">→</span>
                <span aria-current="page" >{job.title}</span>
              </nav>
            </HeroContent>
            <SaveButton jobId={job.id} />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
            <div>
              <JobHeader job={job} />
              <JobBody job={job} />
            </div>
            <div>
              <CompanySidebar job={job} />
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
