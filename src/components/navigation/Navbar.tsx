import { Link, NavLink } from 'react-router'
import { ArrowUpRight, Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { NAV_LINKS } from '@/lib/navigation'

interface NavbarProps {
  onOpenMenu: () => void
}

export function Navbar({ onOpenMenu }: NavbarProps) {
  return (
    <nav
      className="shell flex h-[72px] items-center justify-between gap-6"
      aria-label="Navegación principal"
    >
      <Link to="/" className="group flex items-center gap-3">
        <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors duration-300 group-hover:border-primary/40">
          <svg viewBox="0 0 64 64" className="h-6 w-6" aria-hidden="true">
            <defs>
              <linearGradient id="brand-g" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#22d3ee" />
                <stop offset="1" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
            <path
              d="M22 18h20M22 32h14M22 46h20"
              stroke="url(#brand-g)"
              strokeWidth="5.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
        <span className="flex flex-col">
          <span className="font-display text-lg leading-none font-bold tracking-tight text-foreground">
            ElChivalez
          </span>
          <span className="mt-1 font-mono text-[9px] leading-none tracking-[0.26em] text-muted/70 uppercase">
            Software Studio
          </span>
        </span>
      </Link>

      <div className="hidden items-center gap-1 md:flex">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              cn(
                'rounded-full px-3 py-2 text-sm font-medium transition-colors lg:px-4',
                isActive
                  ? 'bg-white/[0.07] text-foreground'
                  : 'text-muted hover:bg-white/[0.04] hover:text-foreground',
              )
            }
          >
            {link.label}
          </NavLink>
        ))}
        <Link
          to="/contact"
          className="ml-3 inline-flex h-10 items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-secondary px-4 text-sm font-semibold text-background shadow-glow transition-all hover:brightness-110 lg:px-5"
        >
          Trabajemos
          <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </div>

      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-foreground transition-colors hover:bg-white/[0.06] md:hidden"
        aria-label="Abrir menú"
        onClick={onOpenMenu}
      >
        <Menu size={22} />
      </button>
    </nav>
  )
}
