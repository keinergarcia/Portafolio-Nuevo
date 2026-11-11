import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/animations/Reveal'
import { ExperienceCard, ExperienceHighlights } from '@/components/cards/ExperienceCard'
import { usePortfolioData } from '@/contexts/PortfolioData'
import { WORK_EXPERIENCE, experienceHighlights } from '@/lib/experience'
import { cn } from '@/lib/utils'

export function Experience() {
  const { profile } = usePortfolioData()
  const highlights = experienceHighlights(profile.experience)

  return (
    <section id="experiencia" className="section-pad shell">
      <SectionHeading
        eyebrow="Trayectoria"
        title="Experiencia"
        highlight="laboral"
        description="Dónde trabajo hoy, qué hago y con qué tecnologías construyo soluciones."
      />

      <div
        className={cn(
          'mt-14 grid grid-cols-1 gap-6',
          highlights.length > 0 && 'lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.55fr)]',
        )}
      >
        <Reveal className="h-full">
          <ExperienceCard job={WORK_EXPERIENCE[0]} />
        </Reveal>
        {highlights.length > 0 && (
          <Reveal delay={0.1} className="h-full">
            <ExperienceHighlights items={highlights} />
          </Reveal>
        )}
      </div>
    </section>
  )
}
