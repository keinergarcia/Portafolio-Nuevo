import { SectionHeading } from '@/components/ui/SectionHeading'
import { ProjectCard } from '@/components/cards/ProjectCard'
import { Stagger, StaggerItem } from '@/components/animations/Reveal'
import { Button } from '@/components/ui/Button'
import { FolderOpen } from 'lucide-react'
import { usePortfolioData } from '@/contexts/PortfolioData'

export function Projects() {
  const { projects } = usePortfolioData()
  const featured = projects.filter((project) => project.status === 'published')

  return (
    <section id="proyectos" className="section-pad shell">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading
          eyebrow="Portafolio"
          title="Proyectos"
          highlight="destacados"
          description="Selección de trabajos reales: sistemas, sitios y automatizaciones."
        />
        <Button to="/projects" variant="ghost" size="sm" className="shrink-0">
          Ver todos
        </Button>
      </div>

      {featured.length > 0 ? (
        <Stagger className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((project) => (
            <StaggerItem key={project.id}>
              <ProjectCard project={project} />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <div className="glass mt-14 flex flex-col items-center gap-4 p-10 text-center">
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