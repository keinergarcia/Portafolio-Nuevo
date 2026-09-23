import { Link } from 'react-router'
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

const variantStyles = {
  primary:
    'bg-gradient-to-r from-primary to-secondary text-background font-semibold shadow-glow transition-all hover:shadow-glow-soft hover:brightness-110',
  secondary:
    'glass-strong text-foreground transition-colors hover:bg-white/[0.08]',
  outline:
    'border border-primary/40 text-primary transition-colors hover:bg-primary/10',
  ghost: 'text-muted transition-colors hover:bg-white/[0.06] hover:text-foreground',
} as const

const sizeStyles = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-sm',
  lg: 'h-[52px] px-8 text-base',
} as const

type ButtonVariant = keyof typeof variantStyles
type ButtonSize = keyof typeof sizeStyles

interface ButtonBaseProps {
  variant?: ButtonVariant
  size?: ButtonSize
  children?: ReactNode
  className?: string
}

type ButtonProps = ButtonBaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    to?: string
    href?: string
  }

export function Button({
  variant = 'primary',
  size = 'md',
  to,
  href,
  className,
  children,
  type,
  ...props
}: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50',
    variantStyles[variant],
    sizeStyles[size],
    className,
  )

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} className={classes} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  }

  return (
    <button type={type ?? 'button'} className={classes} {...props}>
      {children}
    </button>
  )
}