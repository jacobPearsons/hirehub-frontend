import { useSearchParams, Link } from 'react-router-dom'
import { HeroContent } from '../ui/HeroContent'
import { usePageMeta } from '../../utils/usePageMeta'
import { useApp } from '../../context/AppContext'
import { Button } from '../ui/Button'
import { OverviewTab } from './OverviewTab'
import { SavedJobsTab } from './SavedJobsTab'
import { ApplicationsTab } from './ApplicationsTab'

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'saved', label: 'Saved Jobs' },
  { id: 'applications', label: 'My Applications' },
] as const

const tabMeta = {
  overview: { title: 'Overview', subtitle: 'Your activity at a glance' },
  saved: { title: 'Saved Jobs', subtitle: 'Jobs you’ve bookmarked' },
  applications: { title: 'My Applications', subtitle: 'Track every application and hiring stage' },
} as const

export default function DashboardPage() {
  const { user } = useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as 'overview' | 'saved' | 'applications') ?? 'overview'
  const meta = usePageMeta({ title: tabMeta[activeTab].title, description: tabMeta[activeTab].subtitle })

  function setActiveTab(tab: string) {
    setSearchParams(tab === 'overview' ? {} : { tab })
  }

  return (
    <>
      {meta}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <HeroContent variant="accent">
          <div>
            <h1 className="text-3xl md:text-[40px] leading-[1.15] tracking-[-0.8px] font-medium">
              {tabMeta[activeTab].title}
            </h1>
            <p className="text-ink-muted mt-1">{tabMeta[activeTab].subtitle}</p>
          </div>
        </HeroContent>
      </div>

      {user && !user.onboardingCompleted && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 p-4 rounded-lg border border-accent/30 bg-accent/5">
          <div>
            <p className="text-sm font-medium text-ink">Complete your onboarding</p>
            <p className="text-sm text-ink-muted">Finish setting up your profile so employers can find you.</p>
          </div>
          <Link to="/onboarding" className="sm:flex-shrink-0">
            <Button variant="primary" size="sm">Continue</Button>
          </Link>
        </div>
      )}

      <div role="tablist" aria-label="Dashboard tabs" className="flex overflow-x-auto gap-1 border-b border-hairline mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 rounded-t ${
              activeTab === tab.id
                ? 'border-ink text-ink'
                : 'border-transparent text-ink-muted hover:text-ink hover:border-ink/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'saved' && <SavedJobsTab />}
      {activeTab === 'applications' && <ApplicationsTab />}
    </>
  )
}
