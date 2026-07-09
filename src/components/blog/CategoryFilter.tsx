interface CategoryFilterProps {
  categories: string[]
  active: string
  onChange: (cat: string) => void
}

export function CategoryFilter({
  categories,
  active,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {categories.map((cat) => {
        const isActive = cat === active
        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            aria-pressed={isActive}
            className={`rounded-pill px-4 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/40 ${
              isActive
                ? 'bg-ink text-white'
                : 'bg-surface-2 text-ink-muted hover:text-ink'
            }`}
          >
            {cat}
          </button>
        )
      })}
    </div>
  )
}
