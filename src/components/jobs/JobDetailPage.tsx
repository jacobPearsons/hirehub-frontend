import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Section, Container } from '../ui'
import { HeroContent } from '../ui/HeroContent'
import { SkeletonCard } from '../ui/SkeletonCard'
import { usePageMeta } from '../../utils/usePageMeta'
import { useJob } from '../../hooks/useJob'
import { JobHeader } from './JobHeader'
import { JobBody } from './JobBody'
import { CompanySidebar } from './CompanySidebar'
import { SaveButton } from './SaveButton'

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: job, isLoading, isError } = useJob(id ?? '')
  const [now] = useState(() => Date.now())

  const meta = usePageMeta({
    title: job ? `${job.title} | HireHub Community` : 'Job | HireHub Community',
    description: job ? job.description.slice(0, 160).replace(/\s+\S*$/, '') : undefined,
    image: job?.companyLogo,
    url: job ? `/jobs/${job.id}` : undefined,
  })

  if (isLoading) {
    return (
      <>
        {meta}
        <Section>
          <Container>
            <div role="status" aria-label="Loading job..." className="max-w-3xl mx-auto">
              <SkeletonCard />
            </div>
          </Container>
        </Section>
      </>
    )
  }

  if (!job || isError) {
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

  const expired = job.expiresAt ? new Date(job.expiresAt).getTime() < now : false

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
              {expired && (
                <div className="mb-6 p-4 rounded-lg border border-accent/30 bg-accent/5 text-sm text-ink">
                  This job has expired. Applications are now closed.
                </div>
              )}
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
