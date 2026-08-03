import { Reveal } from '../ui'
import { usePageMeta } from '../../utils/usePageMeta'
import { HeroSection } from './HeroSection'
import { TrustBar } from './TrustBar'
import { ValueProps } from './ValueProps'
import { FeaturedJobs } from './FeaturedJobs'
import { TestimonialStrip } from './TestimonialStrip'
import { WhyUs } from './WhyUs'
import { CTABanner } from './CTABanner'
import { FAQSection } from '../faq/FAQSection'

export default function HomePage() {
  const meta = usePageMeta({ title: 'HireHub Community', description: 'Find your next role at companies that build. Explore thousands of curated job listings from the world\'s best companies.' })

  return (
    <>
      {meta}
      <HeroSection />
      <Reveal><TrustBar /></Reveal>
      <Reveal delay={0.1}><FeaturedJobs /></Reveal>
      <Reveal delay={0.05}><ValueProps /></Reveal>
      <Reveal delay={0.05}><TestimonialStrip /></Reveal>
      <Reveal delay={0.1}><WhyUs /></Reveal>
      <Reveal delay={0.05}><FAQSection /></Reveal>
      <Reveal delay={0.05}><CTABanner /></Reveal>
    </>
  )
}
