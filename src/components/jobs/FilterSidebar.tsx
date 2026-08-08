import { Button } from '../ui'
import type { JobFacets, TagFacet } from '../../api/types'

interface FilterSidebarProps {
  filters: { category: string; seniority: string; location: string; remote: string }
  onFilterChange: (key: string, value: string) => void
  facets?: JobFacets
}

const remoteOptions = [
  { label: 'All', value: '' },
  { label: 'Remote', value: 'true' },
  { label: 'On-site', value: 'false' },
]

function facetOptions(list?: TagFacet[]): string[] {
  return ['All', ...(list?.map((facet) => facet.name) ?? [])]
}

function FilterOption({
  label,
  isSelected,
  onClick,
}: {
  label: string
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 rounded-md ${
        isSelected
          ? 'text-ink font-medium bg-surface-2 px-3 py-1.5'
          : 'text-ink-muted hover:text-ink px-3 py-1.5'
      }`}
    >
      {label}
    </button>
  )
}

export function FilterSidebar({ filters, onFilterChange, facets }: FilterSidebarProps) {
  const categories = facetOptions(facets?.categories)
  const seniorities = facetOptions(facets?.seniorities)
  const locations = facetOptions(facets?.locations)

  const handleClear = () => {
    onFilterChange('category', '')
    onFilterChange('seniority', '')
    onFilterChange('location', '')
    onFilterChange('remote', '')
  }

  return (
    <div className="sticky top-20 w-full bg-surface-1 rounded-lg p-6">
      <fieldset className="border-0 p-0 m-0">
        <legend className="text-sm font-medium mb-3">Category</legend>
        <div className="space-y-0.5">
          {categories.map((cat) => {
            const value = cat === 'All' ? '' : cat
            return (
              <FilterOption
                key={cat}
                label={cat}
                isSelected={filters.category === value}
                onClick={() => onFilterChange('category', value)}
              />
            )
          })}
        </div>
      </fieldset>

      <fieldset className="border-0 p-0 m-0 mt-6">
        <legend className="text-sm font-medium mb-3">Seniority</legend>
        <div className="space-y-0.5">
          {seniorities.map((sen) => {
            const value = sen === 'All' ? '' : sen
            return (
              <FilterOption
                key={sen}
                label={sen}
                isSelected={filters.seniority === value}
                onClick={() => onFilterChange('seniority', value)}
              />
            )
          })}
        </div>
      </fieldset>

      <fieldset className="border-0 p-0 m-0 mt-6">
        <legend className="text-sm font-medium mb-3">Location</legend>
        <div className="space-y-0.5">
          {locations.map((loc) => {
            const value = loc === 'All' ? '' : loc
            return (
              <FilterOption
                key={loc}
                label={loc}
                isSelected={filters.location === value}
                onClick={() => onFilterChange('location', value)}
              />
            )
          })}
        </div>
      </fieldset>

      <fieldset className="border-0 p-0 m-0 mt-6">
        <legend className="text-sm font-medium mb-3">Remote</legend>
        <div className="space-y-0.5">
          {remoteOptions.map((opt) => (
            <FilterOption
              key={opt.value}
              label={opt.label}
              isSelected={filters.remote === opt.value}
              onClick={() => onFilterChange('remote', opt.value)}
            />
          ))}
        </div>
      </fieldset>

      <Button variant="ghost" size="sm" className="w-full mt-6" onClick={handleClear}>
        Clear filters
      </Button>
    </div>
  )
}
