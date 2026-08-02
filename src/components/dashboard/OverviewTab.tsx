import { FileText, Bookmark, Calendar, MapPin, ArrowRight, Pencil } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useApplications } from '../../context/ApplicationsContext'
import { useApp } from '../../context/AppContext'
import { Card } from '../ui/Card'
import { Avatar } from '../ui/Avatar'
import { formatSalary } from '../../utils/format'

const statCards = [
  {
    label: 'Applications',
    description: 'applications submitted',
    icon: FileText,
    bgClass: 'bg-blue-100 text-blue-600',
    to: '/dashboard?tab=applications',
  },
  {
    label: 'Saved Jobs',
    description: 'jobs saved',
    icon: Bookmark,
    bgClass: 'bg-purple-100 text-purple-600',
    to: '/dashboard?tab=saved',
  },
  {
    label: 'Interviews',
    description: 'interviewing',
    icon: Calendar,
    bgClass: 'bg-green-100 text-green-600',
    to: '/dashboard?tab=applications',
  },
] as const

export function OverviewTab() {
  const { applications } = useApplications()
  const { user, savedJobIds } = useApp()

  const applicationsList = Array.isArray(applications) ? applications : []

  const counts = [
    applicationsList.length,
    savedJobIds.length,
    applicationsList.filter(a => a?.status === 'interviewing').length,
  ]

  const salary = user ? formatSalary(user.salaryMin, user.salaryMax, user.currency) : null
  const employmentType = user?.employmentType
    ? user.employmentType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : null

  return (
    <div className="space-y-6">
      {user && (
        <Card variant="default" className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Avatar name={user.name} src={user.avatarUrl} size="lg" />
              <div className="min-w-0">
                <p className="text-lg font-semibold text-ink truncate">{user.name}</p>
                {user.headline && <p className="text-sm text-ink-muted truncate">{user.headline}</p>}
                {user.location && (
                  <p className="flex items-center gap-1 text-sm text-ink-muted mt-0.5">
                    <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                    {user.location}
                  </p>
                )}
              </div>
            </div>
            <Link
              to="/dashboard/profile"
              className="sm:ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded"
            >
              <Pencil className="w-4 h-4" aria-hidden="true" />
              Edit profile
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div className="min-w-0">
              <p className="text-xs text-ink-tertiary">Email</p>
              <p className="text-ink font-medium truncate">{user.email}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-ink-tertiary">Salary expectation</p>
              <p className="text-ink font-medium truncate">{salary ?? 'Not specified'}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-ink-tertiary">Employment type</p>
              <p className="text-ink font-medium truncate capitalize">{employmentType ?? 'Not specified'}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-ink-tertiary">Work mode</p>
              <p className="text-ink font-medium truncate">
                {user.remoteOnly == null ? 'Not specified' : user.remoteOnly ? 'Remote only' : 'On-site / hybrid'}
              </p>
            </div>
          </div>

          {user.skills && user.skills.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-ink-tertiary mb-2">Skills</p>
              <div className="flex flex-wrap gap-2">
                {user.skills.map((skill) => (
                  <span key={skill} className="inline-flex items-center px-2.5 py-0.5 rounded-pill text-sm font-medium bg-surface-2 text-ink-muted">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {user.resumeFileName && (
            <p className="mt-4 text-sm text-ink-muted">
              Resume: <span className="text-ink font-medium">{user.resumeFileName}</span>
            </p>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon
          const count = counts[i]
          return (
            <Link
              key={card.label}
              to={card.to}
              className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded-xl"
            >
              <Card variant="feature" className="p-5 h-full transition-transform duration-200 group-hover:-translate-y-1">
                <div className="flex items-center justify-between gap-3">
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
                  <ArrowRight
                    className="w-4 h-4 text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-hidden="true"
                  />
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
