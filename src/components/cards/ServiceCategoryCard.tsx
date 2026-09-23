import { Check } from 'lucide-react'
import { Bot, Globe, Monitor, Wrench, type LucideIcon } from 'lucide-react'
import type { ServiceCategory } from '@/types'

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

export function ServiceCategoryCard({ category }: ServiceCategoryCardProps) {
  const Icon = CATEGORY_ICONS[category.icon ?? ''] ?? Globe

  return (
    <div className="glass relative p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-white/15 sm:p-8">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      />
      <div className="flex items-start justify-between">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-tertiary/20 text-primary">
          <Icon size={22} aria-hidden="true" />
        </span>
      </div>

      <h3 className="mt-5 font-display text-lg font-semibold text-foreground sm:text-xl">
        {category.name}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{category.description}</p>

      <ul className="mt-6 space-y-2.5">
        {category.services?.map((service) => (
          <li
            key={service.id}
            className="flex items-start gap-2.5 text-sm leading-relaxed text-muted"
          >
            <Check size={15} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            {service.title}
          </li>
        ))}
      </ul>
    </div>
  )
}