import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { Button } from '../ui'

interface FilterDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: { category: string; seniority: string; remote: string }
  onFilterChange: (key: string, value: string) => void
  activeCount: number
}

const categories = ['All', 'Engineering', 'Design', 'Marketing', 'Sales', 'Operations']
const seniorities = ['All', 'Junior', 'Mid', 'Senior', 'Lead', 'Executive']
const locations = ['All', 'Remote', 'On-site', 'Hybrid']

function FilterGroup({ label, options, value, onChange }: {
  label: string
  options: string[]
  value: string
  onChange: (val: string) => void
}) {
  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="text-sm font-medium mb-3 text-ink">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const optValue = opt === 'All' ? '' : (label === 'Seniority' ? opt.toLowerCase() : opt)
          const isSelected = value === optValue
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(optValue)}
              className={`px-3 py-1.5 rounded-pill text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 ${
                isSelected
                  ? 'bg-accent text-white'
                  : 'bg-surface-2 text-ink-muted hover:text-ink'
              }`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function FilterDrawer({ open, onOpenChange, filters, onFilterChange, activeCount }: FilterDrawerProps) {
  const handleClear = () => {
    onFilterChange('category', '')
    onFilterChange('seniority', '')
    onFilterChange('remote', '')
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 md:hidden" />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 z-50 bg-canvas rounded-t-xl border-t border-hairline max-h-[80vh] overflow-y-auto md:hidden"
          aria-label="Filter jobs"
        >
          <div className="sticky top-0 bg-canvas border-b border-hairline px-4 py-3 flex items-center justify-between">
            <Dialog.Title className="text-base font-medium text-ink">
              Filters {activeCount > 0 && <span className="text-ink-muted">({activeCount})</span>}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                className="p-1 text-ink-muted hover:text-ink rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
                aria-label="Close filters"
              >
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-4 space-y-6">
            <FilterGroup label="Category" options={categories} value={filters.category} onChange={(v) => onFilterChange('category', v)} />
            <FilterGroup label="Seniority" options={seniorities} value={filters.seniority} onChange={(v) => onFilterChange('seniority', v)} />
            <FilterGroup label="Location" options={locations} value={filters.remote} onChange={(v) => onFilterChange('remote', v)} />
          </div>

          <div className="sticky bottom-0 bg-canvas border-t border-hairline px-4 py-3 flex gap-3">
            <Button variant="ghost" size="md" className="flex-1" onClick={handleClear}>Clear all</Button>
            <Dialog.Close asChild>
              <Button variant="primary" size="md" className="flex-1">Show results</Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
