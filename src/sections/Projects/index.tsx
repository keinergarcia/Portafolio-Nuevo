import { SectionHeading } from '@/components/ui/SectionHeading'
import { ProjectCard } from '@/components/cards/ProjectCard'
import { Stagger, StaggerItem } from '@/components/animations/Reveal'
import { Button } from '@/components/ui/Button'
import { ArrowUpRight, FolderOpen } from 'lucide-react'
import { usePortfolioData } from '@/contexts/PortfolioData'

export function Projects() {
  const { projects } = usePortfolioData()
  const featured = projects.filter((project) => project.status === 'published')
  const [lead, ...rest] = featured

  return (
    <section id="proyectos" className="section-pad shell">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="Portafolio"
          title="Proyectos"
          highlight="destacados"
          description="Selección de trabajos reales: sistemas, sitios y automatizaciones."
        />
        <Button to="/projects" variant="secondary" size="sm" className="shrink-0 self-start sm:self-end">
          Ver todos
        </Button>
      </div>

      {lead ? (
        <Stagger className="mt-16 grid gap-6 lg:grid-cols-3">
          <StaggerItem className="lg:col-span-2">
            <ProjectCard project={lead} featured priority />
          </StaggerItem>

          <StaggerItem className="h-full">
            <div className="glass relative flex h-full flex-col justify-between overflow-hidden p-7 sm:p-8">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-20 -right-16 h-52 w-52 rounded-full bg-secondary/[0.12] blur-3xl"
              />
              <div className="relative">
                <p className="eyebrow">Siguiente proyecto</p>
                <h3 className="mt-5 font-display text-2xl leading-tight font-semibold tracking-tight text-foreground">
                  ¿Tienes una idea en mente?
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  Cuéntame qué necesitas y te propongo una solución clara, sin
                  compromiso.
                </p>
              </div>
              <Button to="/contact" variant="outline" className="relative mt-8 w-full">
                Hablemos
                <ArrowUpRight size={16} aria-hidden="true" />
              </Button>
            </div>
          </StaggerItem>

          {rest.map((project) => (
            <StaggerItem key={project.id}>
              <ProjectCard project={project} priority />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <div className="glass mt-16 flex flex-col items-center gap-4 p-10 text-center">
          <FolderOpen size={28} className="text-muted" aria-hidden="true" />
          <p className="text-sm text-muted">
            Aún no hay proyectos publicados. Los proyectos se administran desde el
            panel.
          </p>
          <Button to="/contact" variant="outline" size="sm">
            Contáctame
          </Button>
        </div>
      )}
    </section>
  )
}
