import { TECHNOLOGY_CATEGORY_LABELS, TECHNOLOGY_CATEGORY_ORDER } from '@/lib/content'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { TechnologyChip } from '@/components/cards/TechnologyChip'
import { Reveal } from '@/components/animations/Reveal'
import { usePortfolioData } from '@/contexts/PortfolioData'

export function Technologies() {
  const { technologies } = usePortfolioData()
  const categories = TECHNOLOGY_CATEGORY_ORDER.map((category) => ({
    category,
    items: technologies.filter(
      (tech) => tech.category === category && tech.is_active,
    ),
  })).filter((group) => group.items.length > 0)

  return (
    <section id="tecnologias" className="section-pad shell">
      <SectionHeading
        eyebrow="Stack"
        title="Tecnologías"
        highlight="y herramientas"
        description="El conjunto de tecnologías que aplico para construir soluciones modernas."
      />

      <div className="mt-16 space-y-14">
        {categories.map((group, groupIndex) => (
          <Reveal key={group.category} delay={groupIndex * 0.05}>
            <div className="flex items-center gap-5">
              <h3 className="shrink-0 font-display text-xs font-semibold uppercase tracking-[0.24em] text-foreground/85 sm:text-sm">
                {TECHNOLOGY_CATEGORY_LABELS[group.category] ?? group.category}
              </h3>
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-gradient-to-r from-white/[0.14] via-white/[0.06] to-transparent"
              />
              <span className="shrink-0 font-mono text-[10px] tracking-[0.2em] text-white/30">
                {String(groupIndex + 1).padStart(2, '0')} ·{' '}
                {String(group.items.length).padStart(2, '0')}
              </span>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-4 gap-y-7">
              {group.items.map((tech, itemIndex) => (
                <TechnologyChip
                  key={tech.id}
                  name={tech.name}
                  icon={tech.icon}
                  index={groupIndex * 4 + itemIndex}
                />
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
