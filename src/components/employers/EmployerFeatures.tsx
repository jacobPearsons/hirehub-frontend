import { Target, BarChart3, Sparkles, Users, Globe, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { Section } from '../ui/Section'
import { Container } from '../ui/Container'
import { Card } from '../ui/Card'

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
}

const features = [
  {
    icon: Target,
    title: 'Smart Matching',
    description:
      'AI-powered algorithm connects you with candidates who have the exact skills and experience you need.',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description:
      'Track your hiring funnel with detailed insights on views, applications, and conversion rates.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Screening',
    description:
      'Automatically screen and rank candidates based on your job requirements.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description:
      'Invite your team to review candidates, leave feedback, and make decisions together.',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description:
      'Tap into a diverse talent pool spanning 50+ countries and 100+ skill categories.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description:
      'SOC 2 compliant with SSO, SAML, and role-based access controls.',
  },
] as const

export function EmployerFeatures() {
  return (
    <Section className="bg-canvas">
      <Container>
        <h2 className="text-[32px] md:text-[40px] leading-[1.15] font-medium text-center mb-4">
          Everything you need to hire
        </h2>
        <p className="text-lg text-ink-muted text-center max-w-2xl mx-auto mb-12">
          Powerful tools to help you find, screen, and hire the best talent from
          around the world.
        </p>
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={itemVariants} whileHover={{ y: -4 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
            <Card variant="default" className="p-6">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <feature.icon
                  className="w-5 h-5 text-accent"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">
                {feature.description}
              </p>
            </Card></motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  )
}
