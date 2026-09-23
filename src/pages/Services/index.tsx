import { SectionHeading } from '@/components/ui/SectionHeading'
import { ServiceCategoryCard } from '@/components/cards/ServiceCategoryCard'
import { Stagger, StaggerItem } from '@/components/animations/Reveal'
import { ShieldCheck } from 'lucide-react'
import { AutomationFlow } from '@/sections/Automation'
import { Contact } from '@/sections/Contact'
import { usePortfolioData } from '@/contexts/PortfolioData'

export function Services() {
  const { serviceCategories } = usePortfolioData()

  return (
    <>
      <section className="section-pad shell">
        <SectionHeading
          eyebrow="Servicios"
          title="Catálogo de"
          highlight="servicios"
          description="Del desarrollo web al software de escritorio, con automatización e IA aplicada a procesos reales."
        />

        <Stagger className="mt-14 grid gap-6 md:grid-cols-2" gap={0.12}>
          {serviceCategories.map((category) => (
            <StaggerItem key={category.id}>
              <ServiceCategoryCard category={category} />
            </StaggerItem>
          ))}
        </Stagger>

        <div className="glass mt-8 flex items-start gap-4 p-6">
          <ShieldCheck size={20} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          <p className="text-sm leading-relaxed text-muted">
            Para software comercial siempre se utiliza una licencia legítima. Cuando
            es necesaria, el cliente debe disponer de una licencia válida; no se
            ofrecen activaciones ilegales, cracks ni keygens.
          </p>
        </div>
      </section>

      <AutomationFlow />
      <Contact />
    </>
  )
}