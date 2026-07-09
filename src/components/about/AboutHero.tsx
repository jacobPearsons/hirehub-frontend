import { Container } from '../ui/Container'
import { HeroContent } from '../ui/HeroContent'

export function AboutHero() {
  return (
    <section className="relative overflow-hidden bg-canvas">
      <div className="absolute inset-0">
        <img
          src="/about-hero.png"
          alt=""
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-canvas/10 via-canvas/30 to-canvas" />
      </div>
      <Container className="relative py-24 md:py-32 text-center">
        <HeroContent variant="card">
          <h1 className="text-[40px] md:text-[56px] leading-[1.1] tracking-[-1px] font-medium max-w-3xl mx-auto">
            About HireHub Community
          </h1>
          <p className="text-lg text-ink mt-6 max-w-2xl mx-auto">
            We're on a mission to make hiring human again. <span className=''>HireHub</span> Community
            connects talented professionals with companies that value culture,
            growth, and impact.
          </p>
        </HeroContent>
      </Container>
    </section>
  )
}
