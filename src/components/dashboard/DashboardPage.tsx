import { useSearchParams } from 'react-router-dom'
import { HeroContent } from '../ui/HeroContent'
import { usePageMeta } from '../../utils/usePageMeta'
import { OverviewTab } from './OverviewTab'
import { SavedJobsTab } from './SavedJobsTab'
import { ApplicationsTab } from './ApplicationsTab'

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'saved', label: 'Saved Jobs' },
  { id: 'applications', label: 'My Applications' },
] as const

export default function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as 'overview' | 'saved' | 'applications') ?? 'overview'
  const meta = usePageMeta({ title: 'Dashboard | HireHub Community', description: 'Manage your saved jobs and applications' })

  function setActiveTab(tab: string) {
    setSearchParams(tab === 'overview' ? {} : { tab })
  }

  return (
    <>
      {meta}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <HeroContent variant="accent">
          <div>
            <h1 className="text-3xl md:text-[40px] leading-[1.15] tracking-[-0.8px] font-medium">Dashboard</h1>
            <p className="text-ink-muted mt-1">Manage your saved jobs and applications</p>
          </div>
        </HeroContent>
      </div>

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
