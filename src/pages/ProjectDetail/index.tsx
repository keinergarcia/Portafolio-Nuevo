import { Link, useParams } from 'react-router'
import { ArrowLeft, CheckCircle2, ExternalLink } from 'lucide-react'
import { GitHubIcon } from '@/components/ui/BrandIcons'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Reveal } from '@/components/animations/Reveal'
import { usePortfolioData } from '@/contexts/PortfolioData'
import type { Project } from '@/types'

function DetailBlock({
  title,
  items,
}: {
  title: string
  items: string[] | null | undefined
}) {
  if (!items || items.length === 0) return null
  return (
    <Reveal>
      <div className="glass p-6">
        <h3 className="eyebrow mb-4">{title}</h3>
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={index} className="flex items-start gap-2.5 text-sm text-muted">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  )
}

export function ProjectDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { projects } = usePortfolioData()
  const project: Project | undefined = projects.find((p) => p.slug === slug)

  if (!project) {
    return (
      <section className="shell section-pad text-center">
        <p className="eyebrow">Proyecto</p>
        <h1 className="mt-4 font-display text-4xl font-semibold">No encontrado</h1>
        <p className="mt-4 text-muted">Este proyecto no existe o aún no se publicó.</p>
        <Link
          to="/projects"
          className="mt-8 inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft size={16} /> Volver a proyectos
        </Link>
      </section>
    )
  }

  const hasGallery = project.images && project.images.length > 0

  return (
    <article className="shell section-pad">
      <Reveal>
        <Link
          to="/projects"
          className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-primary"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Proyectos
        </Link>
      </Reveal>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
          <Reveal>
            <div className="glass overflow-hidden">
              <div className="relative aspect-video bg-surface-elevated">
                {project.cover_image ? (
                  <img
                    src={project.cover_image}
                    alt={`Portada de ${project.title}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-tertiary/10">
                    <span className="font-display text-7xl font-bold text-white/15">
                      {project.title.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Reveal>

          {hasGallery && (
            <Reveal className="mt-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {project.images!.map((image) => (
                  <img
                    key={image.id}
                    src={image.url}
                    alt={image.alt ?? project.title}
                    loading="lazy"
                    className="aspect-video w-full rounded-xl border border-white/[0.06] object-cover"
                  />
                ))}
              </div>
            </Reveal>
          )}
        </div>

        <div className="space-y-8">
          <Reveal delay={0.05}>
            <div className="flex flex-wrap items-center gap-2">
              {project.category && <Badge variant="accent">{project.category}</Badge>}
              {project.featured && <Badge variant="tertiary">Destacado</Badge>}
            </div>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {project.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted">
              {project.description || project.short_description}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {project.github_url && project.github_url !== 'TODO' && (
                <Button href={project.github_url} variant="outline" size="sm">
                  <GitHubIcon size={15} aria-hidden="true" /> GitHub
                </Button>
              )}
              {project.demo_url && (
                <Button href={project.demo_url} size="sm">
                  <ExternalLink size={15} aria-hidden="true" /> Demo en vivo
                </Button>
              )}
            </div>
          </Reveal>

          {project.technologies && project.technologies.length > 0 && (
            <Reveal delay={0.1}>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech) => (
                  <Badge key={tech.id} className="font-mono text-[11px]">
                    {tech.name}
                  </Badge>
                ))}
              </div>
            </Reveal>
          )}

          {project.problem && (
            <Reveal delay={0.15}>
              <div className="glass p-6">
                <h3 className="eyebrow mb-3">El problema</h3>
                <p className="text-sm leading-relaxed text-muted">{project.problem}</p>
              </div>
            </Reveal>
          )}

          {project.solution && (
            <Reveal delay={0.2}>
              <div className="glass p-6">
                <h3 className="eyebrow mb-3">La solución</h3>
                <p className="text-sm leading-relaxed text-muted">{project.solution}</p>
              </div>
            </Reveal>
          )}
        </div>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        <DetailBlock title="Características" items={project.features} />
        <DetailBlock title="Resultados" items={project.results} />
      </div>
    </article>
  )
}