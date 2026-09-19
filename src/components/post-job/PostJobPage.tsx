import { Lock } from 'lucide-react'
import { HeroContent } from '../ui/HeroContent'
import { Section, Container, Reveal, Card } from '../ui'
import { usePageMeta } from '../../utils/usePageMeta'
import { canPostJob } from '../../utils/permissions'
import { useApp } from '../../context/AppContext'
import PostJobForm from './PostJobForm'

export default function PostJobPage() {
  const meta = usePageMeta({ title: 'Post a Job | HireHub Community', description: 'Create a new job listing and reach top talent.' })
  const { user } = useApp()
  const allowed = canPostJob(user)

  return (
    <>
      {meta}
      <Section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]">
          <img
            src="/post-job-bg.svg"
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <Container className="relative max-w-2xl">
          <HeroContent variant="card" className="mb-8">
            <h1 className="text-[40px] font-medium">Post a Job</h1>
            <p className="text-lg text-ink-muted mt-2">
              Fill out the form below to create a new job listing.
            </p>
          </HeroContent>
          {allowed ? (
            <Reveal><PostJobForm /></Reveal>
          ) : (
            <Card variant="default" className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-2">
                <Lock className="h-6 w-6 text-ink-muted" aria-hidden="true" />
              </div>
              <h2 className="text-lg font-medium text-ink">Posting is locked</h2>
              <p className="mt-2 text-sm text-ink-muted">
                You need permission from an admin before posting jobs. Contact the site
                administrator to request the <code>job:create</code> permission.
              </p>
            </Card>
          )}
        </Container>
      </Section>
    </>
  )
}