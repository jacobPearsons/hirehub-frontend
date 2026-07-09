import type { ReactNode } from 'react'

interface SectionProps {
  variant?: 'default' | 'inverse'
  children: ReactNode
  className?: string
  id?: string
}

export function Section({
  variant = 'default',
  children,
  className,
  id,
}: SectionProps) {
  return (
    <section
      id={id}
      className={`py-24 ${variant === 'inverse' ? 'bg-inverse-canvas text-inverse-ink' : 'bg-canvas'}${className ? ` ${className}` : ''}`}
    >
      {children}
    </section>
  )
}
