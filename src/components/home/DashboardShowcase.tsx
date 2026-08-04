import { Check } from 'lucide-react'
import { Section } from '../ui/Section'
import { Container } from '../ui/Container'

const highlights = [
  {
    title: 'Follow every application in one place',
    description: 'Track submitted, review, interview, and offer stages at a glance from the dashboard.',
  },
  {
    title: 'Interviews and offers without the chasing',
    description: 'Status changes land on your dashboard the moment they happen.',
  },
  {
    title: 'Built for your pocket',
    description: 'Manage your job search on the go — responsive on every screen.',
  },
]

const MOBILE_SHOT = '/new/%28mobile%20dashboard%20overview%20%E2%80%94%209%3A16%29.png'

export function DashboardShowcase() {
  return (
    <Section className="py-20">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
          <div>
            <p className="text-sm font-medium text-ink-subtle mb-2">Your dashboard</p>
            <h2 className="text-[40px] leading-[1.15] tracking-[-0.8px] font-medium mb-4">
              Your job search, at a glance
            </h2>
            <p className="text-lg text-ink-muted max-w-lg mb-8">
              From the moment you hit apply to the day you sign an offer, the dashboard keeps
              every stage visible — so you never have to guess where you stand.
            </p>
            <ul className="space-y-5">
              {highlights.map((item) => (
                <li key={item.title} className="flex items-start gap-3">
                  <span className="mt-0.5 flex items-center justify-center w-6 h-6 rounded-full bg-accent/10 text-accent flex-shrink-0">
                    <Check className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-base font-medium text-ink">{item.title}</h3>
                    <p className="text-base text-ink-muted mt-0.5">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mx-auto w-full max-w-[300px]">
            <div className="absolute -inset-4 rounded-[2rem] bg-accent/10 blur-2xl" aria-hidden="true" />
            <div className="relative rounded-[1.75rem] border border-hairline bg-surface-1 p-2.5 shadow-xl">
              <img
                src={MOBILE_SHOT}
                alt="HireHub mobile dashboard overview"
                className="w-full h-auto rounded-[1.25rem] object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}
