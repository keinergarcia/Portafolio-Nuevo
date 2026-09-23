import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import type { Project } from '@/types'
import { Badge } from '@/components/ui/Badge'

interface ProjectCardProps {
  project: Project
  priority?: boolean
}

export function ProjectCard({ project, priority = false }: ProjectCardProps) {
  return (
    <article className="group glass overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:border-white/15">
      <Link to={`/project/${project.slug}`} className="block" aria-label={`Ver proyecto ${project.title}`}>
        <div className="relative aspect-video overflow-hidden bg-surface-elevated">
          {project.cover_image ? (
            <img
              src={project.cover_image}
              alt={project.title}
              loading={priority ? 'eager' : 'lazy'}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/10 to-tertiary/10">
              <span className="font-display text-6xl font-bold text-white/15">
                {project.title.charAt(0)}
              </span>
            </div>
          )}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between gap-3">
            {project.category ? (
              <Badge variant="accent">{project.category}</Badge>
            ) : (
              <span />
            )}
            <ArrowUpRight
              size={18}
              className="text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary"
            />
          </div>

          <h3 className="mt-4 font-display text-xl font-semibold text-foreground">
            {project.title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted">
            {project.short_description}
          </p>

          {project.technologies && project.technologies.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <Badge key={tech.id} className="font-mono text-[11px]">
                  {tech.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Link>
    </article>
  )
}