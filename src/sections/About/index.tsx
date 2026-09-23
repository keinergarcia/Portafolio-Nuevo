import { GraduationCap, MapPin, Briefcase } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/animations/Reveal'
import { Badge } from '@/components/ui/Badge'
import { TechnologyChip } from '@/components/cards/TechnologyChip'
import { usePortfolioData } from '@/contexts/PortfolioData'

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

      <div className="mt-14 grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Reveal>
          <div className="glass relative overflow-hidden p-8">
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            />
            <div className="flex items-center gap-5">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={`Foto de ${profile.full_name}`}
                  className="h-20 w-20 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 via-secondary/25 to-tertiary/25 font-display text-2xl font-bold text-primary">
                  {initials}
                </div>
              )}
              <div>
                <h3 className="font-display text-xl font-semibold text-foreground">
                  {profile.full_name}
                </h3>
                <p className="text-sm text-muted">{profile.professional_title}</p>
              </div>
            </div>

            {profile.location && profile.location !== 'TODO' && (
              <p className="mt-6 flex items-center gap-2 text-sm text-muted">
                <MapPin size={16} className="text-primary" aria-hidden="true" />
                {profile.location}
              </p>
            )}

            <div className="mt-6 border-t border-white/[0.06] pt-6">
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
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="space-y-8">
            <div>
              <p className="text-base leading-relaxed text-muted sm:text-lg">
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

            <div className="glass p-6">
              <p className="eyebrow mb-4">Experiencia</p>
              <ul className="space-y-3">
                {(profile.experience ?? ['TODO']).map((item, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-sm text-muted">
                    <Briefcase size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
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

            <div>
              <p className="eyebrow mb-4">Áreas de especialización</p>
              <div className="flex flex-wrap gap-2.5">
                {chipTechnologies.map((tech) => (
                  <TechnologyChip key={tech} name={tech} />
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}