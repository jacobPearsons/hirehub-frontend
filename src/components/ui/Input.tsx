import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({
  label,
  error,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  const errorId = `${inputId}-error`

  return (
    <div>
      <label
        htmlFor={inputId}
        className="block text-sm font-medium text-ink mb-1"
      >
        {label}
      </label>
      <input
        id={inputId}
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error ? 'true' : undefined}
        className={`w-full px-3 py-2.5 rounded-md border bg-surface-1 text-ink placeholder:text-ink-tertiary outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ink/40 ${error ? 'border-error focus-visible:border-error' : 'border-hairline focus-visible:border-ink'}${className ? ` ${className}` : ''}`}
        {...props}
      />
      {error && (
        <p id={errorId} className="mt-1 text-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
