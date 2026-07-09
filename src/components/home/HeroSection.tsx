import { Link } from 'react-router-dom'
import { Container } from '../ui/Container'
import { HeroContent } from '../ui/HeroContent'

export function HeroSection() {
  return (
    <section className="relative bg-canvas overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/hero-homepage.png"
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-canvas/20 via-canvas/40 to-canvas" />
      </div>
      <Container>
        <div className="relative flex flex-col items-center text-center pt-24 pb-32 md:pt-32 md:pb-40">
          <HeroContent variant="card" className="flex flex-col items-center">
            <span className="bg-ink/5 text-ink rounded-full px-3 py-1 text-sm mb-6 backdrop-blur-sm">
              <span aria-hidden="true">🎉</span> We're hiring!
            </span>
            <h1 className="text-[56px] md:text-[72px] leading-[1.05] tracking-[-2px] font-medium max-w-4xl mx-auto text-ink">
              Find your next role at companies that build
            </h1>
            <p className="text-lg md:text-xl leading-[1.5] text-ink-muted max-w-2xl mx-auto mt-6">
              Explore thousands of curated job listings from the world's best companies.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center">
              <Link
                to="/jobs"
                className="inline-flex items-center justify-center px-6 py-3 text-base rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 bg-ink text-white hover:bg-[#3a3a3a] dark:hover:bg-[#3a3a3a]"
              >
                Browse Jobs
              </Link>
              <Link
                to="/employers"
                className="inline-flex items-center justify-center px-6 py-3 text-base rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 bg-surface-2 text-ink hover:bg-hairline"
              >
                For Employers
              </Link>
            </div>
          </HeroContent>
        </div>
      </Container>
    </section>
  )
}
