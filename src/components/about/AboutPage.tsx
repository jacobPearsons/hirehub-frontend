import { Reveal } from '../ui'
import { usePageMeta } from '../../utils/usePageMeta'
import { AboutHero } from './AboutHero'
import { AboutStory } from './AboutStory'
import { AboutValues } from './AboutValues'

export default function AboutPage() {
  const meta = usePageMeta({ title: 'About Us | HireHub Community', description: 'Learn about our mission to connect talent with opportunity.' })
  return (
    <>
      {meta}
      <AboutHero />
      <Reveal><AboutStory /></Reveal>
      <Reveal delay={0.05}><AboutValues /></Reveal>
    </>
  )
}
