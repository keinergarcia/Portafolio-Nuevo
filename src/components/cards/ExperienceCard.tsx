import { ArrowUpRight, CheckCircle2 } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { WorkExperience } from '@/lib/experience'

export function ExperienceCard({
  job,
  className,
}: {
  job: WorkExperience
  className?: string
}) {
  return (
    <article className={cn('glass relative flex h-full flex-col overflow-hidden p-6 sm:p-8', className)}>
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-20 -right-16 h-48 w-48 rounded-full bg-primary/[0.07] blur-3xl"
      />

      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] sm:h-16 sm:w-16 sm:p-2.5">
            <img
              src={job.logo}
              alt={`Logo de ${job.company}`}
              className="h-full w-full object-contain"
              loading="lazy"
            />
          </span>
          <div>
            <h3 className="font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {job.role}
            </h3>
            <a
              href={job.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group/link mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              {job.company}
              <ArrowUpRight
                size={14}
                aria-hidden="true"
                className="transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5"
              />
            </a>
          </div>
        </div>

        {job.current && (
          <Badge variant="accent" className="gap-2">
            <span aria-hidden="true" className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            {job.period}
          </Badge>
        )}
      </div>

      <div className="relative mt-6 space-y-3.5 text-sm leading-relaxed text-muted sm:text-[0.95rem]">
        {job.summary.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <div className="relative mt-auto border-t border-white/[0.07] pt-5">
        <p className="text-[11px] font-semibold tracking-[0.16em] text-muted uppercase">
          Tecnologías
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {job.technologies.map((technology) => (
            <li
              key={technology}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[11px] text-muted"
            >
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-primary" />
              {technology}
            </li>
          ))}
        </ul>
      </div>
    </article>
  )
}

export function ExperienceHighlights({
  items,
  className,
}: {
  items: string[]
  className?: string
}) {
  if (items.length === 0) return null

  return (
    <div className={cn('glass h-full p-6 sm:p-7', className)}>
      <p className="eyebrow">Experiencia y fortalezas</p>
      <ul className="mt-5 space-y-3.5">
        {items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2.5 text-sm leading-relaxed text-muted"
          >
            <CheckCircle2
              size={16}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-primary"
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
