import { Link } from 'react-router-dom'
import { Container } from '../ui/Container'
import { Tag } from '../ui/Tag'
import { HeroContent } from '../ui/HeroContent'

export function EmployersHero() {
  return (
    <section className="relative overflow-hidden bg-canvas">
      <div className="absolute inset-0">
        <img
          src="/employers-hero.png"
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-canvas/80 via-canvas/40 to-transparent" />
      </div>
      <Container className="relative py-24 md:py-32">
        <div className="flex flex-col items-start max-w-xl">
          <HeroContent variant="card">
            <Tag variant="category" className="mb-4 text-white">
              For Employers
            </Tag>
            <h1 className="text-white text-[40px] md:text-[56px] leading-[1.1] tracking-[-1px] font-medium max-w-3xl">
              Find the talent your team needs to grow
            </h1>
            <p className="text-lg text-white/80 max-w-2xl mt-4 mb-8">
              Post jobs, discover top candidates, and build your dream team with HireHub Community.
            </p>
            <div className="flex items-center gap-6">
              <Link
                to="#"
                className="inline-flex items-center justify-center rounded-md bg-accent text-white px-6 py-3 text-base font-medium hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40"
              >
                Post a job
              </Link>
              <Link
                to="#pricing"
                className="text-sm font-medium text-white/70 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded"
              >
                Learn more
              </Link>
            </div>
          </HeroContent>
        </div>
      </Container>
    </section>
  )
}
