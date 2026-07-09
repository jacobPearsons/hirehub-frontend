import { HeroContent } from '../ui/HeroContent'
import { Section, Container, Reveal } from '../ui'
import { usePageMeta } from '../../utils/usePageMeta'
import PostJobForm from './PostJobForm'

export default function PostJobPage() {
  {usePageMeta({ title: 'Post a Job | HireHub Community', description: 'Create a new job listing and reach top talent.' })}

  return (
    <Section className="relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.05]">
        <img
          src="/post-job-bg.png"
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
        <Reveal><PostJobForm /></Reveal>
      </Container>
    </Section>
  )
}
