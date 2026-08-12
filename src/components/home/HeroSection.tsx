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
        <div className="relative flex flex-col items-center text-center pt-36 pb-44">
          <HeroContent variant="card" className="flex flex-col items-center">
             <span className="mb-6 rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm">
            🎉 We're Hiring!
        </span>

             <h1 className="text-white font-semibold text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-[-0.05em]">
            Find your next role at
            <br />
            companies that build
        </h1>
           <p className="mt-8 max-w-2xl text-lg md:text-xl text-white/80">
            Explore thousands of curated job listings from the world's best companies.
        </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-12 justify-center">
              <Link
                to="/jobs"
                className="inline-flex items-center justify-center px-6 py-3 text-base  rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 bg-ink dark:text-accent text-white hover:bg-black"
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
