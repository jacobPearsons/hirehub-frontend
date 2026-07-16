import { useSearchParams, Link } from 'react-router-dom'
import { Section, Container } from '../ui'
import { HeroContent } from '../ui/HeroContent'
import { usePageMeta } from '../../utils/usePageMeta'
import { JobListingsTab } from './JobListingsTab'
import { ApplicantsTab } from './ApplicantsTab'

const tabs = [
  { id: 'listings', label: 'Job Listings' },
  { id: 'applicants', label: 'Applicants' },
] as const

export default function EmployerDashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as 'listings' | 'applicants') ?? 'listings'
  const meta = usePageMeta({ title: 'Employer Dashboard | HireHub Community', description: 'Manage your job listings and review applicants' })

  function setActiveTab(tab: 'listings' | 'applicants') {
    setSearchParams(tab === 'listings' ? {} : { tab })
  }

  return (
    <>
      {meta}
      <Section>
        <Container>
          <div className="flex items-center justify-between mb-8">
            <HeroContent variant="accent">
              <div>
                <h1 className="text-[40px] leading-[1.15] tracking-[-0.8px] font-medium">Employer Dashboard</h1>
                <p className="text-ink-muted mt-1">Manage your job listings and review applicants</p>
              </div>
            </HeroContent>
            <Link
              to="/post-job"
              className="text-sm font-medium text-accent hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded"
            >
              Post a new job
            </Link>
          </div>

          <div role="tablist" aria-label="Employer dashboard tabs" className="flex gap-1 border-b border-hairline mb-8">
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

          {activeTab === 'listings' && <JobListingsTab />}
          {activeTab === 'applicants' && <ApplicantsTab />}
        </Container>
      </Section>
    </>
  )
}
