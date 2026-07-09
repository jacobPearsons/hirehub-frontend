import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary w-5 h-5" aria-hidden="true" />
      <input
        type="text"
        placeholder="Search jobs..."
        aria-label="Search jobs"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 rounded-md border border-hairline bg-surface-1 text-ink placeholder:text-ink-tertiary outline-none focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:border-ink"
      />
    </div>
  )
}
