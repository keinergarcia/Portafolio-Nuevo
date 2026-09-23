import { Link, NavLink } from 'react-router'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_LINKS } from '@/lib/navigation'

interface NavbarProps {
  onOpenMenu: () => void
}

export function Navbar({ onOpenMenu }: NavbarProps) {
  return (
    <nav
      className="shell flex h-16 items-center justify-between"
      aria-label="Navegación principal"
    >
      <Link
        to="/"
        className="flex items-center gap-3 font-display text-lg font-bold tracking-tight"
      >
        <svg viewBox="0 0 64 64" className="h-8 w-8" aria-hidden="true">
          <defs>
            <linearGradient id="brand-g" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#22d3ee" />
              <stop offset="1" stopColor="#a78bfa" />
            </linearGradient>
          </defs>
          <rect width="64" height="64" rx="14" className="fill-surface-elevated" />
          <rect
            x="1"
            y="1"
            width="62"
            height="62"
            rx="13"
            fill="none"
            stroke="url(#brand-g)"
            strokeOpacity="0.6"
          />
          <path
            d="M22 18h20M22 32h14M22 46h20"
            stroke="url(#brand-g)"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-gradient">ElChivalez</span>
      </Link>

      <div className="hidden items-center gap-1 md:flex">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              cn(
                'rounded-lg px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground',
                isActive && 'text-foreground',
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
        <Link
          to="/contact"
          className="ml-2 rounded-xl bg-gradient-to-r from-primary to-secondary px-4 py-2 text-sm font-semibold text-background transition-all hover:brightness-110"
        >
          Trabajemos
        </Link>
      </div>

      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-white/[0.06] md:hidden"
        aria-label="Abrir menú"
        onClick={onOpenMenu}
      >
        <Menu size={22} />
      </button>
    </nav>
  )
}