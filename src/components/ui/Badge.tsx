import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const badgeStyles = {
  default: 'border-white/10 bg-white/[0.05] text-muted',
  accent: 'border-primary/30 bg-primary/10 text-primary',
  tertiary: 'border-tertiary/30 bg-tertiary/10 text-tertiary',
  outline: 'border-white/15 text-foreground',
} as const

type BadgeVariant = keyof typeof badgeStyles

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs font-medium tracking-wide',
        badgeStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}