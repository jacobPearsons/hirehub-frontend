import { Reveal } from '../ui'
import { usePageMeta } from '../../utils/usePageMeta'
import { EmployersHero } from './EmployersHero'
import { EmployerStats } from './EmployerStats'
import { EmployerFeatures } from './EmployerFeatures'
import { PricingSection } from './PricingSection'

export default function EmployersPage() {
  const meta = usePageMeta({ title: 'For Employers | HireHub Community', description: 'Post jobs, find talent, and build your team with HireHub Community.' })
  return (
    <>
      {meta}
      <EmployersHero />
      <Reveal><EmployerStats /></Reveal>
      <Reveal delay={0.05}><EmployerFeatures /></Reveal>
      <Reveal delay={0.1}><PricingSection /></Reveal>
    </>
  )
}
