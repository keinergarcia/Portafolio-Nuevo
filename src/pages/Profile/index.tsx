import type { ComponentType } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  Download,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Reveal } from '@/components/animations/Reveal'
import { GitHubIcon, LinkedInIcon } from '@/components/ui/BrandIcons'
import { ExperienceCard, ExperienceHighlights } from '@/components/cards/ExperienceCard'
import { Documents } from '@/sections/Documents'
import { usePortfolioData } from '@/contexts/PortfolioData'
import { WORK_EXPERIENCE, experienceHighlights } from '@/lib/experience'

type IconProps = {
  size?: number | string
  className?: string
  'aria-hidden'?: boolean | 'true' | 'false'
}

const SOCIAL_ICONS: Record<string, ComponentType<IconProps>> = {
  whatsapp: MessageCircle,
  github: GitHubIcon,
  linkedin: LinkedInIcon,
}

const SOCIAL_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  github: 'GitHub',
  linkedin: 'LinkedIn',
  instagram: 'Instagram',
  twitter: 'X / Twitter',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  facebook: 'Facebook',
  portafolio: 'Portafolio',
}

/** Descarta valores vacíos o los marcadores «TODO» del contenido de ejemplo. */
function cleanText(value: string | null | undefined): string | null {
  if (!value) return null
  const text = value.trim()
  return text.length > 0 && text !== 'TODO' ? text : null
}

function cleanList(items: string[] | null | undefined): string[] {
  return (items ?? [])
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item !== 'TODO')
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function TimelineCard({
  eyebrow,
  title,
  icon: Icon,
  items,
}: {
  eyebrow: string
  title: string
  icon: ComponentType<IconProps>
  items: string[]
}) {
  return (
    <div className="glass h-full p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-br from-primary/15 to-tertiary/15 text-primary">
          <Icon size={19} aria-hidden="true" />
        </span>
        <div>
          <p className="font-mono text-[10px] tracking-[0.22em] text-muted uppercase">{eyebrow}</p>
          <h3 className="font-display text-lg font-semibold tracking-tight text-foreground">
            {title}
          </h3>
        </div>
      </div>

      <ul className="mt-6">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="relative flex gap-3.5 pb-5 last:pb-0">
            <span className="flex w-2 shrink-0 flex-col items-center pt-1.5">
              <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(34,211,238,0.7)]" />
              {index < items.length - 1 && <span className="mt-1.5 w-px flex-1 bg-white/10" />}
            </span>
            <p className="text-sm leading-relaxed text-muted">{item}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}

function ChannelCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: ComponentType<IconProps>
  label: string
  value: string
  href?: string
}) {
  const content = (
    <div className="glass group flex h-full items-center gap-4 p-5 transition-colors hover:border-white/[0.16]">
      <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-tertiary/20 text-primary">
        <Icon size={19} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
          {label}
        </span>
        <span className="mt-1 block truncate text-sm text-foreground/90">{value}</span>
      </span>
      {href && (
        <ArrowUpRight
          size={16}
          aria-hidden="true"
          className="shrink-0 text-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
        />
      )}
    </div>
  )

  if (!href) return content

  const external = /^https?:\/\//i.test(href)

  return (
    <a
      href={href}
      className="block h-full"
      aria-label={`${label}: ${value}`}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {content}
    </a>
  )
}

export function ProfilePage() {
  const { profile, socialLinks, documents } = usePortfolioData()

  const name = cleanText(profile.full_name) ?? 'ElChivalez'
  const [firstName, ...otherNames] = name.split(/\s+/)
  const lastName = otherNames.join(' ')
  const professionalTitle = cleanText(profile.professional_title)
  const bio = cleanText(profile.bio)
  const location = cleanText(profile.location)
  const email = cleanText(profile.email)
  const phone = cleanText(profile.phone)
  const formation = cleanList(profile.formation)
  const highlights = experienceHighlights(profile.experience)

  const socials = socialLinks.filter((link) => link.is_active && cleanText(link.url))
  const cvDocument = documents.find((document) => document.kind === 'cv')
  const resumeUrl = cvDocument?.file_url ?? cleanText(profile.resume_url)

  return (
    <>
      <section className="shell pt-12 pb-4 sm:pt-16 lg:pt-20">
        <Reveal>
          <div className="glass relative overflow-hidden p-7 sm:p-10 lg:p-12">
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-primary/[0.08] blur-3xl"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-28 -left-20 h-72 w-72 rounded-full bg-tertiary/[0.07] blur-3xl"
            />

            <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-center lg:gap-14">
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                {profile.photo_url ? (
                  <img
                    src={profile.photo_url}
                    alt={`Foto de ${name}`}
                    className="h-36 w-36 rounded-3xl object-cover shadow-glow-soft ring-1 ring-white/10 sm:h-44 sm:w-44"
                  />
                ) : (
                  <div className="flex h-36 w-36 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/25 via-secondary/25 to-tertiary/25 font-display text-4xl font-bold text-primary shadow-glow-soft ring-1 ring-white/10 sm:h-44 sm:w-44">
                    {initialsOf(name)}
                  </div>
                )}

                <h1 className="mt-6 font-display text-3xl leading-[1.04] font-bold tracking-[-0.03em] text-balance text-foreground sm:text-4xl lg:text-[2.9rem]">
                  {firstName}
                  {lastName && <span className="text-gradient"> {lastName}</span>}
                </h1>

                {professionalTitle && (
                  <p className="mt-3 text-base font-medium text-muted sm:text-lg">
                    {professionalTitle}
                  </p>
                )}

                {location && (
                  <Badge variant="outline" className="mt-4">
                    <MapPin size={13} aria-hidden="true" />
                    {location}
                  </Badge>
                )}
              </div>

              <div>
                <p className="eyebrow">Perfil profesional</p>

                {bio && (
                  <p className="mt-5 text-base leading-relaxed text-pretty whitespace-pre-line text-muted sm:text-lg">
                    {bio}
                  </p>
                )}

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button to="/contact" size="lg" className="group">
                    Trabajemos juntos
                    <ArrowRight
                      size={17}
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </Button>
                  {resumeUrl && (
                    <Button href={resumeUrl} size="lg" variant="secondary">
                      <Download size={17} aria-hidden="true" />
                      Descargar CV
                    </Button>
                  )}
                  <Button to="/projects" size="sm" variant="ghost" className="group text-muted">
                    Ver proyectos
                    <ArrowUpRight
                      size={15}
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </Button>
                </div>

                {(email || phone) && (
                  <div className="mt-8 flex flex-col gap-2 border-t border-white/[0.07] pt-6 text-sm text-muted sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6">
                    {email && (
                      <a
                        href={`mailto:${email}`}
                        className="inline-flex items-center gap-2 transition-colors hover:text-primary"
                      >
                        <Mail size={15} aria-hidden="true" className="text-primary" />
                        {email}
                      </a>
                    )}
                    {phone && (
                      <a
                        href={`tel:${phone.replace(/[^\d+]/g, '')}`}
                        className="inline-flex items-center gap-2 transition-colors hover:text-primary"
                      >
                        <Phone size={15} aria-hidden="true" className="text-primary" />
                        {phone}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section id="experiencia" className="shell pt-14 sm:pt-16 lg:pt-20">
        <div
          className={`grid grid-cols-1 gap-6 ${formation.length > 0 ? 'md:grid-cols-2' : ''}`}
        >
          {formation.length > 0 && (
            <Reveal className="h-full">
              <TimelineCard
                eyebrow="Trayectoria"
                title="Formación"
                icon={GraduationCap}
                items={formation}
              />
            </Reveal>
          )}
          <Reveal delay={0.1} className="h-full">
            <ExperienceCard job={WORK_EXPERIENCE[0]} />
          </Reveal>
        </div>

        {highlights.length > 0 && (
          <Reveal delay={0.15} className="mt-6">
            <ExperienceHighlights items={highlights} />
          </Reveal>
        )}
      </section>

      <Documents />

      <section id="contacto" className="section-pad shell">
        <SectionHeading
          eyebrow="Contacto"
          title="Conectemos y hablemos de tu"
          highlight="proyecto"
          description="Estos son mis canales directos. Elige el que prefieras o escríbeme por el formulario."
        />

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2">
          {email && (
            <Reveal>
              <ChannelCard icon={Mail} label="Email" value={email} href={`mailto:${email}`} />
            </Reveal>
          )}
          {phone && (
            <Reveal delay={0.05}>
              <ChannelCard
                icon={Phone}
                label="Teléfono"
                value={phone}
                href={`tel:${phone.replace(/[^\d+]/g, '')}`}
              />
            </Reveal>
          )}
          {location && (
            <Reveal delay={0.1}>
              <ChannelCard icon={MapPin} label="Ubicación" value={location} />
            </Reveal>
          )}

          {socials.length > 0 && (
            <Reveal delay={0.15}>
              <div className="glass h-full p-5">
                <p className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
                  Redes
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {socials.map((link) => {
                    const Icon = SOCIAL_ICONS[link.platform] ?? Globe
                    const label = SOCIAL_LABELS[link.platform] ?? link.platform
                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Abrir ${label}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2 text-sm text-muted transition hover:border-primary/40 hover:text-primary"
                      >
                        <Icon size={16} aria-hidden="true" />
                        {label}
                      </a>
                    )
                  })}
                </div>
              </div>
            </Reveal>
          )}
        </div>

        <Reveal delay={0.1}>
          <div className="glass mt-6 flex flex-col items-start justify-between gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
            <div>
              <p className="font-display text-lg font-semibold tracking-tight text-foreground">
                ¿Tienes un proyecto en mente?
              </p>
              <p className="mt-1 text-sm text-muted">
                Cuéntame qué necesitas y te propongo una solución.
              </p>
            </div>
            <Button to="/contact" className="group">
              Contactarme
              <ArrowRight
                size={16}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </Button>
          </div>
        </Reveal>
      </section>
    </>
  )
}
