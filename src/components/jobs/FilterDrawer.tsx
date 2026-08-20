import * as Dialog from '@radix-ui/react-dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '../ui'
import type { JobFacets, TagFacet } from '../../api/types'

interface FilterDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  filters: { category: string; seniority: string; location: string; remote: string }
  onFilterChange: (key: string, value: string) => void
  activeCount: number
  facets?: JobFacets
}

function facetOptions(list?: TagFacet[]): { label: string; value: string }[] {
  return ['All', ...(list?.map((facet) => facet.name) ?? [])].map((name) => ({
    label: name,
    value: name === 'All' ? '' : name,
  }))
}

const remoteOptions = [
  { label: 'All', value: '' },
  { label: 'Remote', value: 'true' },
  { label: 'On-site', value: 'false' },
]

function FilterGroup({ label, options, value, onChange }: {
  label: string
  options: { label: string; value: string }[]
  value: string
  onChange: (val: string) => void
}) {
  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="text-sm font-medium mb-3 text-ink">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isSelected = value === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`px-3 py-1.5 rounded-pill text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 ${
                isSelected
                  ? 'bg-accent text-white'
                  : 'bg-surface-2 text-ink-muted hover:text-ink'
              }`}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

export function FilterDrawer({ open, onOpenChange, filters, onFilterChange, activeCount, facets }: FilterDrawerProps) {
  const handleClear = () => {
    onFilterChange('category', '')
    onFilterChange('seniority', '')
    onFilterChange('location', '')
    onFilterChange('remote', '')
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/40 md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>
            <Dialog.Content asChild aria-label="Filter jobs">
              <motion.div
                className="fixed inset-x-0 bottom-0 z-50 bg-canvas rounded-t-xl border-t border-hairline max-h-[80vh] overflow-y-auto md:hidden"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
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
                  <FilterGroup label="Category" options={facetOptions(facets?.categories)} value={filters.category} onChange={(v) => onFilterChange('category', v)} />
                  <FilterGroup label="Seniority" options={facetOptions(facets?.seniorities)} value={filters.seniority} onChange={(v) => onFilterChange('seniority', v)} />
                  <FilterGroup label="Location" options={facetOptions(facets?.locations)} value={filters.location} onChange={(v) => onFilterChange('location', v)} />
                  <FilterGroup label="Remote" options={remoteOptions} value={filters.remote} onChange={(v) => onFilterChange('remote', v)} />
                </div>

                <div className="sticky bottom-0 bg-canvas border-t border-hairline px-4 py-3 flex gap-3">
                  <Button variant="ghost" size="md" className="flex-1" onClick={handleClear}>Clear all</Button>
                  <Dialog.Close asChild>
                    <Button variant="primary" size="md" className="flex-1">Show results</Button>
                  </Dialog.Close>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  )
}
