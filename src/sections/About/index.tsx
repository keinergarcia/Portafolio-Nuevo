import { GraduationCap, MapPin, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/animations/Reveal'
import { Badge } from '@/components/ui/Badge'
import { TechnologyChip } from '@/components/cards/TechnologyChip'
import { usePortfolioData } from '@/contexts/PortfolioData'
import { WORK_EXPERIENCE } from '@/lib/experience'

const SPECIALTIES = [
  'Desarrollo Web',
  'Aplicaciones de Escritorio',
  'Automatización',
  'Inteligencia Artificial',
  'Sistemas a medida',
]

const HIGHLIGHT_TECHNOLOGIES = new Set([
  'React',
  'TypeScript',
  'Node.js',
  'Supabase',
  'n8n',
  '.NET',
])

export function About() {
  const { profile, technologies } = usePortfolioData()
  const currentJob = WORK_EXPERIENCE[0]
  const initials = (profile.full_name ?? 'EC')
    .split(' ')
    .map((word) => word.charAt(0))
    .slice(0, 2)
    .join('')

  const chipTechnologies =
    technologies.length > 0
      ? technologies.filter((tech) => HIGHLIGHT_TECHNOLOGIES.has(tech.name)).map((tech) => tech.name)
      : [...HIGHLIGHT_TECHNOLOGIES]

  return (
    <section id="sobre-mi" className="section-pad shell">
      <SectionHeading
        eyebrow="Sobre mí"
        title="Transformo ideas en"
        highlight="software"
        description="Desarrollo soluciones digitales funcionales, bien diseñadas y adaptadas a las necesidades reales de cada cliente."
      />

      <div className="mt-16 grid gap-6 lg:grid-cols-[0.88fr_1.12fr] lg:gap-8">
        <Reveal>
          <div className="glass relative flex h-full flex-col overflow-hidden p-8 sm:p-9">
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-20 h-56 w-56 rounded-full bg-primary/[0.07] blur-3xl"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-3 bottom-16 font-display text-[8rem] leading-none font-bold text-white/[0.02] select-none"
            >
              EC
            </span>
            <div className="relative flex items-center gap-5">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={`Foto de ${profile.full_name}`}
                  className="h-20 w-20 rounded-2xl object-cover ring-1 ring-white/10"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 via-secondary/25 to-tertiary/25 font-display text-2xl font-bold text-primary ring-1 ring-white/10">
                  {initials}
                </div>
              )}
              <div>
                <h3 className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                  {profile.full_name}
                </h3>
                <p className="mt-1 text-sm text-muted">{profile.professional_title}</p>
              </div>
            </div>

            {profile.location && profile.location !== 'TODO' && (
              <p className="relative mt-6 flex items-center gap-2 text-sm text-muted">
                <MapPin size={16} className="text-primary" aria-hidden="true" />
                {profile.location}
              </p>
            )}

            <div className="relative mt-6 border-t border-white/[0.06] pt-6">
              <p className="eyebrow mb-4">Formación</p>
              <ul className="space-y-3">
                {(profile.formation ?? ['TODO']).map((item, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm text-muted">
                    <GraduationCap size={16} className="mt-0.5 shrink-0 text-tertiary" aria-hidden="true" />
                    {item === 'TODO' ? (
                      <span className="font-mono text-xs opacity-60">
                        TODO · esta sección se edita desde el panel
                      </span>
                    ) : (
                      item
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              to="/contact"
              className="group relative mt-auto flex items-center justify-between gap-3 border-t border-white/[0.06] pt-6 text-sm font-medium text-foreground/90 transition-colors hover:text-primary"
            >
              Hablemos de tu proyecto
              <ArrowUpRight
                size={16}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="flex flex-col justify-center">
          <div className="space-y-8">
            <div>
              <p className="text-base leading-relaxed text-pretty text-muted sm:text-lg">
                Perfil orientado a ofrecer soluciones digitales para personas,
                emprendimientos y empresas: desde sitios web y sistemas a medida
                hasta automatizaciones e inteligencia artificial aplicada a
                procesos reales.
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {SPECIALTIES.map((specialty) => (
                  <Badge key={specialty} variant="tertiary">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="glass p-6 sm:p-7">
              <p className="eyebrow mb-4">Actualmente</p>
              <a
                href={currentJob.companyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3.5"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] p-2">
                  <img
                    src={currentJob.logo}
                    alt={`Logo de ${currentJob.company}`}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold tracking-tight text-foreground">
                    {currentJob.role}
                  </span>
                  <span className="mt-0.5 block text-sm text-muted">
                    {currentJob.company}
                  </span>
                </span>
                <ArrowUpRight
                  size={16}
                  aria-hidden="true"
                  className="ml-auto shrink-0 text-muted transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
                />
              </a>
              <a
                href="#experiencia"
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Ver experiencia laboral
                <ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </div>

            <div>
              <p className="eyebrow mb-4">Áreas de especialización</p>
              <div className="flex flex-wrap gap-2.5">
                {chipTechnologies.map((tech) => (
                  <TechnologyChip key={tech} name={tech} variant="pill" />
                ))}
              </div>
            </div>

            <Link
              to="/perfil"
              className="group inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              Ver perfil completo
              <ArrowUpRight
                size={15}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}