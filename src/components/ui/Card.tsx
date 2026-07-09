import type { ReactNode } from 'react'

interface CardProps {
  variant: 'default' | 'feature' | 'testimonial' | 'pricing'
  children: ReactNode
  className?: string
  featured?: boolean
}

const variantStyles: Record<CardProps['variant'], string> = {
  default: 'rounded-lg',
  feature: 'rounded-lg p-6',
  testimonial: 'rounded-lg p-8',
  pricing: 'rounded-xl p-8',
}

export function Card({
  variant,
  children,
  className,
  featured,
}: CardProps) {
  return (
    <div
      className={`bg-surface-1 ${variantStyles[variant]}${featured ? ' bg-ink text-inverse-ink' : ''}${className ? ` ${className}` : ''}`}
    >
      {children}
    </div>
  )
}
