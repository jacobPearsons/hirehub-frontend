import type { ReactNode } from 'react'

interface TagProps {
  variant: 'default' | 'category' | 'location' | 'seniority'
  children: ReactNode
  className?: string
}

const seniorityColors: Record<string, string> = {
  junior: 'text-success bg-success/10',
  mid: 'text-accent bg-accent/10',
  senior: 'text-ink-muted bg-surface-2',
  lead: 'text-ink-muted bg-surface-2',
  executive: 'text-error bg-error/10',
}

const variantStyles: Record<TagProps['variant'], string> = {
  default: 'bg-surface-2 text-ink-muted',
  category: 'bg-ink/5 text-ink',
  location: 'text-ink-muted bg-surface-2',
  seniority: '',
}

export function Tag({ variant, children, className }: TagProps) {
  const label = typeof children === 'string' ? children.toLowerCase() : ''
  const colorStyle =
    variant === 'seniority'
      ? (seniorityColors[label] ?? 'bg-surface-2 text-ink-muted')
      : variantStyles[variant]

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-pill text-sm font-medium ${colorStyle}${className ? ` ${className}` : ''}`}
    >
      {children}
    </span>
  )
}
