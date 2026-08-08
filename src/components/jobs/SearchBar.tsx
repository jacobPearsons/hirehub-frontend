import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react'
import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  locationValue?: string
  onLocationChange?: (value: string) => void
}

function DebouncedInput({
  value,
  onChange,
  placeholder,
  ariaLabel,
  icon,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  ariaLabel: string
  icon?: ReactNode
}) {
  const [localValue, setLocalValue] = useState(value)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setLocalValue(value) }, [value])
  useEffect(() => { return () => clearTimeout(timerRef.current) }, [])

  const handleChange = useCallback((newValue: string) => {
    setLocalValue(newValue)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onChange(newValue), 300)
  }, [onChange])

  return (
    <div className="relative">
      {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-tertiary w-5 h-5">{icon}</span>}
      <input
        type="text"
        placeholder={placeholder}
        aria-label={ariaLabel}
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 rounded-md border border-hairline bg-surface-1 text-ink placeholder:text-ink-tertiary outline-none focus-visible:ring-2 focus-visible:ring-ink/40 focus-visible:border-ink"
      />
    </div>
  )
}

export function SearchBar({ value, onChange, locationValue, onLocationChange }: SearchBarProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="flex-1">
        <DebouncedInput
          value={value}
          onChange={onChange}
          placeholder="Search jobs..."
          ariaLabel="Search jobs"
          icon={<Search className="w-5 h-5" aria-hidden="true" />}
        />
      </div>
      {onLocationChange && (
        <div className="flex-1">
          <DebouncedInput
            value={locationValue ?? ''}
            onChange={onLocationChange}
            placeholder="Location"
            ariaLabel="Location"
          />
        </div>
      )}
    </div>
  )
}
