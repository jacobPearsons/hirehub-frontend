import { FileText, Bookmark, Calendar } from 'lucide-react'
import { useApplications } from '../../context/ApplicationsContext'
import { useApp } from '../../context/AppContext'
import { Card } from '../ui/Card'

const statCards = [
  {
    label: 'Applications',
    description: 'applications submitted',
    icon: FileText,
    bgClass: 'bg-blue-100 text-blue-600',
  },
  {
    label: 'Saved Jobs',
    description: 'jobs saved',
    icon: Bookmark,
    bgClass: 'bg-purple-100 text-purple-600',
  },
  {
    label: 'Interviews',
    description: 'interviewing',
    icon: Calendar,
    bgClass: 'bg-green-100 text-green-600',
  },
] as const

export function OverviewTab() {
  const { applications } = useApplications()
  const { savedJobIds } = useApp()

  const counts = [
    applications.length,
    savedJobIds.length,
    applications.filter(a => a.status === 'interviewing').length,
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {statCards.map((card, i) => {
        const Icon = card.icon
        const count = counts[i]
        return (
          <Card key={card.label} variant="feature" className="p-5">
            <div className="flex items-center gap-4">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full ${card.bgClass}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-ink-muted">{card.label}</p>
                <p className="text-2xl font-semibold text-ink">{count}</p>
                <p className="text-xs text-ink-muted">
                  {count === 1 ? card.description.replace(/s$/, '') : card.description}
                </p>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
