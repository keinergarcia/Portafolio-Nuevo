import { Check, Bot, Globe, Monitor, Wrench, type LucideIcon } from 'lucide-react'
import type { ServiceCategory } from '@/types'
import { cn } from '@/lib/utils'

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  globe: Globe,
  monitor: Monitor,
  bot: Bot,
  wrench: Wrench,
}

interface ServiceCategoryCardProps {
  category: ServiceCategory
  index?: number
}

export function ServiceCategoryCard({ category, index }: ServiceCategoryCardProps) {
  const Icon = CATEGORY_ICONS[category.icon ?? ''] ?? Globe

  return (
    <div
      className={cn(
        'group glass relative flex h-full flex-col overflow-hidden p-7 transition-all duration-300',
        'hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-[0_30px_60px_-40px_rgba(34,211,238,0.35)]',
        'sm:p-9',
      )}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-16 h-56 w-56 rounded-full bg-primary/[0.06] blur-3xl transition-opacity duration-500 group-hover:opacity-100 sm:opacity-0"
      />

      <div className="relative flex items-start justify-between gap-4">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-gradient-to-br from-primary/20 to-tertiary/15 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <Icon size={24} aria-hidden="true" />
        </span>
        {typeof index === 'number' && (
          <span className="font-mono text-xs tracking-[0.2em] text-white/25">
            {String(index + 1).padStart(2, '0')}
          </span>
        )}
      </div>

      <h3 className="relative mt-6 font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {category.name}
      </h3>
      <p className="relative mt-3 max-w-md text-sm leading-relaxed text-muted">
        {category.description}
      </p>

      <ul className="relative mt-7 space-y-3 border-t border-white/[0.06] pt-6">
        {category.services?.map((service) => (
          <li
            key={service.id}
            className="flex items-start gap-3 text-sm leading-relaxed text-muted"
          >
            <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Check size={12} strokeWidth={3} aria-hidden="true" />
            </span>
            {service.title}
          </li>
        ))}
      </ul>
    </div>
  )
}
