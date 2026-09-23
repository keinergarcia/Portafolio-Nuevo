import { SectionHeading } from '@/components/ui/SectionHeading'
import { ProjectCard } from '@/components/cards/ProjectCard'
import { Stagger, StaggerItem } from '@/components/animations/Reveal'
import { FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { usePortfolioData } from '@/contexts/PortfolioData'

export function Projects() {
  const { projects } = usePortfolioData()
  const published = projects.filter((project) => project.status === 'published')

  return (
    <section className="section-pad shell">
      <SectionHeading
        eyebrow="Portafolio"
        title="Proyectos"
        highlight="completos"
        description="Trabajos reales con su proceso documentado: problema, solución y resultado."
      />

      {published.length > 0 ? (
        <Stagger className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {published.map((project) => (
            <StaggerItem key={project.id}>
              <ProjectCard project={project} priority />
            </StaggerItem>
          ))}
        </Stagger>
      ) : (
        <div className="glass mt-14 flex flex-col items-center gap-4 p-12 text-center">
          <FolderOpen size={32} className="text-muted" aria-hidden="true" />
          <p className="max-w-sm text-sm text-muted">
            Los proyectos se publican desde el panel de administración. Vuelve pronto.
          </p>
          <Button to="/contact" variant="outline" size="sm">
            Contáctame
          </Button>
        </div>
      )}
    </section>
  )
}