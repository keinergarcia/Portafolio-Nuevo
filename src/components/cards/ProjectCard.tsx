import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import type { Project } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface ProjectCardProps {
  project: Project
  priority?: boolean
  featured?: boolean
}

export function ProjectCard({ project, priority = false, featured = false }: ProjectCardProps) {
  return (
    <article
      className={cn(
        'group glass overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-white/15',
        featured && 'md:flex md:items-stretch',
      )}
    >
      <Link
        to={`/project/${project.slug}`}
        className={cn('block', featured && 'md:flex md:w-full md:flex-row')}
        aria-label={`Ver proyecto ${project.title}`}
      >
        <div
          className={cn(
            'relative aspect-video overflow-hidden bg-surface-elevated',
            featured && 'md:aspect-auto md:min-h-[21rem] md:w-[53%] md:shrink-0',
          )}
        >
          {project.cover_image ? (
            <img
              src={project.cover_image}
              alt={project.title}
              loading={priority ? 'eager' : 'lazy'}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-tertiary/10">
              <span
                className={cn(
                  'font-display font-bold text-white/15',
                  featured ? 'text-8xl' : 'text-6xl',
                )}
              >
                {project.title.charAt(0)}
              </span>
            </div>
          )}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100"
          />
        </div>

        <div
          className={cn(
            'p-6',
            featured && 'flex flex-col justify-center md:flex-1 md:p-9 lg:p-10',
          )}
        >
          <div className="flex items-center justify-between gap-3">
            {project.category ? (
              <Badge variant="accent">{project.category}</Badge>
            ) : (
              <span />
            )}
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] text-muted transition-all duration-300 group-hover:border-primary/30 group-hover:text-primary">
              <ArrowUpRight size={16} aria-hidden="true" />
            </span>
          </div>

          <h3
            className={cn(
              'mt-4 font-display font-semibold tracking-tight text-foreground',
              featured ? 'text-2xl lg:text-3xl' : 'text-xl',
            )}
          >
            {project.title}
          </h3>
          <p
            className={cn(
              'mt-2 leading-relaxed text-muted',
              featured ? 'line-clamp-3 text-sm sm:text-base' : 'line-clamp-2 text-sm',
            )}
          >
            {project.short_description}
          </p>

          {project.technologies && project.technologies.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <Badge key={tech.id} className="font-mono text-[11px]">
                  {tech.name}
                </Badge>
              ))}
            </div>
          )}

          {featured && (
            <span className="mt-7 inline-flex items-center gap-2 text-sm font-medium text-primary">
              Ver caso completo
              <ArrowUpRight size={15} aria-hidden="true" />
            </span>
          )}
        </div>
      </Link>
    </article>
  )
}
