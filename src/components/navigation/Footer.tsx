import { Link } from 'react-router'
import { MessageCircle, Globe } from 'lucide-react'
import type { ComponentType } from 'react'
import { GitHubIcon, LinkedInIcon } from '@/components/ui/BrandIcons'
import { NAV_LINKS } from '@/lib/navigation'
import { usePortfolioData } from '@/contexts/PortfolioData'

type SocialIconProps = {
  size?: number | string
  className?: string
  'aria-hidden'?: boolean | 'true' | 'false'
}

const SOCIAL_ICONS: Record<string, ComponentType<SocialIconProps>> = {
  whatsapp: MessageCircle,
  github: GitHubIcon,
  linkedin: LinkedInIcon,
}

export function Footer() {
  const { socialLinks, profile } = usePortfolioData()

  return (
    <footer className="border-t border-white/[0.07]">
      <div className="shell py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link to="/" className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                <svg viewBox="0 0 64 64" className="h-6 w-6" aria-hidden="true">
                  <defs>
                    <linearGradient id="footer-brand-g" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#22d3ee" />
                      <stop offset="1" stopColor="#a78bfa" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M22 18h20M22 32h14M22 46h20"
                    stroke="url(#footer-brand-g)"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              <span className="font-display text-lg font-bold tracking-tight">
                <span className="text-gradient">ElChivalez</span>
              </span>
            </Link>
            <p className="mt-5 text-sm leading-relaxed text-muted">
              Desarrollador y Analista de Software. Soluciones digitales para personas,
              emprendimientos y empresas.
            </p>
          </div>

          <nav aria-label="Enlaces del pie de página">
            <p className="eyebrow mb-4">Navegación</p>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="eyebrow mb-4">Encuéntrame</p>
            <div className="flex flex-wrap gap-2">
              {socialLinks
                .filter((link) => link.url !== 'TODO')
                .map((link) => {
                  const Icon = SOCIAL_ICONS[link.platform] ?? Globe
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Enlace a ${link.platform}`}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-muted transition hover:border-primary/40 hover:text-primary"
                    >
                      <Icon size={18} aria-hidden="true" />
                    </a>
                  )
                })}
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/[0.07] pt-7 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} ElChivalez · {profile.full_name ?? 'Keiner García'}</p>
          <p className="font-mono">Hecho con React, TypeScript y mucho café</p>
        </div>
      </div>
    </footer>
  )
}
