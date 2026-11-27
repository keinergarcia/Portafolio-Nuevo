import { ArrowUpRight, Bot, Globe, Monitor, Wrench, type LucideIcon } from 'lucide-react'
import {
  formatCOP,
  priceUnitLabel,
  type PricingCategory,
} from '@/lib/pricing'

const CATEGORY_ICONS: Record<PricingCategory['icon'], LucideIcon> = {
  globe: Globe,
  monitor: Monitor,
  bot: Bot,
  wrench: Wrench,
}

interface PricingCategoryCardProps {
  category: PricingCategory
  index: number
  onQuote: () => void
}

export function PricingCategoryCard({
  category,
  index,
  onQuote,
}: PricingCategoryCardProps) {
  const Icon = CATEGORY_ICONS[category.icon]

  return (
    <article className="group glass relative flex h-full flex-col overflow-hidden p-7 transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/25 hover:shadow-[0_30px_60px_-40px_rgba(34,211,238,0.35)] sm:p-9">
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
        <div className="flex flex-col items-end gap-1.5 text-right">
          <span className="font-mono text-xs tracking-[0.2em] text-white/25">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
            Tarifas desde · COP
          </span>
        </div>
      </div>

      <h3 className="relative mt-6 font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
        {category.name}
      </h3>
      <p className="relative mt-3 max-w-md text-sm leading-relaxed text-muted">
        {category.tagline}
      </p>

      <ul className="relative mt-7 border-t border-white/[0.06]">
        {category.items.map((item) => (
          <li
            key={item.title}
            className="grid grid-cols-[minmax(0,1fr)_8.25rem] items-baseline gap-3 border-b border-white/[0.06] py-3.5 last:border-b-0"
          >
            <span className="text-sm leading-snug text-muted transition-colors duration-200 group-hover:text-foreground/90">
              {item.title}
            </span>
            <span className="flex items-baseline justify-end gap-1.5 whitespace-nowrap">
              <span className="font-display text-[0.95rem] font-semibold tracking-tight text-foreground tabular-nums">
                {formatCOP(item.amount)}
              </span>
              <span className="w-9 shrink-0 text-left font-mono text-[10px] font-normal tracking-normal text-muted">
                {priceUnitLabel(item.unit)}
              </span>
            </span>
          </li>
        ))}
      </ul>

      <div className="relative mt-auto pt-6">
        <button
          type="button"
          onClick={onQuote}
          aria-label={`Cotizar servicios de ${category.name}`}
          className="flex w-full min-h-11 items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/[0.05] px-3.5 py-2.5 font-mono text-[10px] tracking-[0.14em] text-primary uppercase transition-colors duration-200 hover:border-primary/35 hover:bg-primary/10 sm:min-h-0"
        >
          Cotizar este servicio
          <ArrowUpRight size={13} aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}
