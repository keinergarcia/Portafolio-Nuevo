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

      <div className="mt-14 space-y-10">
        {categories.map((group, groupIndex) => (
          <Reveal key={group.category} delay={groupIndex * 0.05}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <h3 className="w-44 shrink-0 font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted">
                {TECHNOLOGY_CATEGORY_LABELS[group.category] ?? group.category}
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {group.items.map((tech) => (
                  <TechnologyChip key={tech.id} name={tech.name} />
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}