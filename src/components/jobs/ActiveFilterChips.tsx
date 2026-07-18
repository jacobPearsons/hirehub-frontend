import { X } from 'lucide-react'

interface ActiveFilterChipsProps {
  filters: { category: string; seniority: string; remote: string }
  onFilterChange: (key: string, value: string) => void
}

const labelMap: Record<string, string> = {
  junior: 'Junior', mid: 'Mid', senior: 'Senior', lead: 'Lead', executive: 'Executive',
  engineering: 'Engineering', design: 'Design', marketing: 'Marketing', sales: 'Sales', operations: 'Operations',
  remote: 'Remote', 'on-site': 'On-site', hybrid: 'Hybrid',
}

function formatLabel(value: string): string {
  return labelMap[value] || value.charAt(0).toUpperCase() + value.slice(1)
}

export function ActiveFilterChips({ filters, onFilterChange }: ActiveFilterChipsProps) {
  const chips: { key: string; label: string }[] = []

  if (filters.category) chips.push({ key: 'category', label: formatLabel(filters.category) })
  if (filters.seniority) chips.push({ key: 'seniority', label: formatLabel(filters.seniority) })
  if (filters.remote) chips.push({ key: 'remote', label: formatLabel(filters.remote) })

  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-pill bg-surface-2 text-sm text-ink-muted"
        >
          {chip.label}
          <button
            type="button"
            onClick={() => onFilterChange(chip.key, '')}
            className="text-ink-tertiary hover:text-ink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 rounded"
            aria-label={`Remove ${chip.label} filter`}
          >
            <X size={14} />
          </button>
        </span>
      ))}
    </div>
  )
}
