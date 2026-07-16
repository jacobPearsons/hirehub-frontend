import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Section, Container } from '../ui'
import { HeroContent } from '../ui/HeroContent'
import { usePageMeta } from '../../utils/usePageMeta'
import { SavedJobsTab } from './SavedJobsTab'
import { ApplicationsTab } from './ApplicationsTab'

const tabs = [
  { id: 'saved', label: 'Saved Jobs' },
  { id: 'applications', label: 'My Applications' },
] as const

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'saved' | 'applications'>('saved')
  const meta = usePageMeta({ title: 'Dashboard | HireHub Community', description: 'Manage your saved jobs and applications' })

  return (
    <>
      {meta}
      <Section>
        <Container>
          <div className="flex items-center justify-between mb-8">
            <HeroContent variant="accent">
              <div>
                <h1 className="text-[40px] leading-[1.15] tracking-[-0.8px] font-medium">Dashboard</h1>
                <p className="text-ink-muted mt-1">Manage your saved jobs and applications</p>
              </div>
            </HeroContent>
            <Link
              to="/jobs"
              className="text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded"
            >
              Browse jobs
            </Link>
          </div>

          <div role="tablist" aria-label="Dashboard tabs" className="flex gap-1 border-b border-hairline mb-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded-t ${
                  activeTab === tab.id
                    ? 'border-ink text-ink'
                    : 'border-transparent text-ink-muted hover:text-ink hover:border-ink/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'saved' && <SavedJobsTab />}
          {activeTab === 'applications' && <ApplicationsTab />}
        </Container>
      </Section>
    </>
  )
}
