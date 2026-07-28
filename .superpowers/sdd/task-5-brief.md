### Task 5: FilterDrawer + ActiveFilterChips

**Files:**
- Create: `src/components/jobs/FilterDrawer.tsx`
- Create: `src/components/jobs/ActiveFilterChips.tsx`

**Interfaces:**
- Consumes: Same filter state as FilterSidebar (`filters`, `onFilterChange`); Radix Dialog; Framer Motion
- Produces: `FilterDrawer` (mobile bottom sheet), `ActiveFilterChips` (chip row)

- [ ] **Step 1: Create FilterDrawer component**

A bottom sheet using Radix Dialog with slide-up animation. Contains the same filter groups as FilterSidebar.

```tsx
// src/components/jobs/FilterDrawer.tsx
import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '../ui/Button'

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
```

- [ ] **Step 2: Create ActiveFilterChips component**

```tsx
// src/components/jobs/ActiveFilterChips.tsx
import { X } from 'lucide-react'

interface ActiveFilterChipsProps {
  filters: { category: string; seniority: string; remote: string }
  onFilterChange: (key: string, value: string) => void
}

export function ActiveFilterChips({ filters, onFilterChange }: ActiveFilterChipsProps) {
  const chips: { key: string; label: string }[] = []

  if (filters.category) chips.push({ key: 'category', label: filters.category })
  if (filters.seniority) chips.push({ key: 'seniority', label: filters.seniority })
  if (filters.remote) chips.push({ key: 'remote', label: filters.remote })

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
```

- [ ] **Step 3: Run build to verify**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add src/components/jobs/FilterDrawer.tsx src/components/jobs/ActiveFilterChips.tsx
git commit -m "feat: add FilterDrawer bottom sheet and ActiveFilterChips for mobile"
```

---

