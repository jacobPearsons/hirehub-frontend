import type { ReactNode, ComponentPropsWithoutRef } from 'react'
import { motion } from 'framer-motion'

interface ButtonProps extends ComponentPropsWithoutRef<typeof motion.button> {
  variant: 'primary' | 'secondary' | 'accent' | 'ghost'
  size: 'sm' | 'md' | 'lg'
  children: ReactNode
}

const variantStyles: Record<ButtonProps['variant'], string> = {
  primary: 'bg-ink text-white hover:bg-[#2a2a2a] dark:bg-ink dark:text-white dark:hover:bg-[#3a3a3a]',
  secondary: 'bg-surface-2 text-ink hover:bg-hairline',
  accent: 'bg-accent text-white hover:bg-[#e04d00] dark:hover:bg-[#e06000]',
  ghost: 'bg-transparent text-ink-muted hover:text-ink hover:bg-surface-2',
}

const sizeStyles: Record<ButtonProps['size'], string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-[15px]',
  lg: 'px-6 py-3 text-base',
}

export function Button({
  variant,
  size,
  children,
  className,
  type = 'button',
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileTap={{ scale: 0.96 }}
      className={`rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30 ${variantStyles[variant]} ${sizeStyles[size]} ${className ?? ''}${disabled ? ' opacity-50 cursor-not-allowed' : ''}`}
      {...rest}
    >
      {children}
    </motion.button>
  )
}
