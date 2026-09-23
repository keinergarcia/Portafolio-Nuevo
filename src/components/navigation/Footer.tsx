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
    <footer className="border-t border-white/[0.06]">
      <div className="shell py-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xs">
            <Link to="/" className="font-display text-lg font-bold tracking-tight">
              <span className="text-gradient">ElChivalez</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Desarrollador y Analista de Software. Soluciones digitales para personas,
              emprendimientos y empresas.
            </p>
          </div>

          <nav aria-label="Enlaces del pie de página">
            <p className="eyebrow mb-4">Navegación</p>
            <ul className="space-y-2">
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

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/[0.06] pt-6 text-xs text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} ElChivalez · {profile.full_name ?? 'Keiner García'}</p>
          <p className="font-mono">Hecho con React, TypeScript y mucho café</p>
        </div>
      </div>
    </footer>
  )
}