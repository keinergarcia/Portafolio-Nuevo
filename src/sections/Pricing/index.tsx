import { useState } from 'react'
import { ArrowRight, Check, ShieldCheck } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { PricingCategoryCard } from '@/components/cards/PricingCategoryCard'
import { QuoteModal } from '@/components/quote/QuoteModal'
import { Reveal, Stagger, StaggerItem } from '@/components/animations/Reveal'
import { Button } from '@/components/ui/Button'
import { PRICING_CATEGORIES } from '@/lib/pricing'

const PRICING_TERMS = [
  {
    title: 'Anticipo del 50 %',
    description:
      'Para reservar el cupo y comenzar el proyecto. El saldo se paga contra entrega.',
  },
  {
    title: 'Alcance por escrito',
    description:
      'Cada cotización detalla entregables, tiempos y condiciones antes de empezar.',
  },
  {
    title: 'Trabajo completo',
    description:
      'La tarifa cubre análisis, diseño, desarrollo, pruebas y acompañamiento hasta la entrega.',
  },
  {
    title: 'Qué no incluye',
    description:
      'Dominio, hosting, licencias, servicios externos y mantenimiento, salvo que se especifiquen en la cotización.',
  },
]

export function Pricing() {
  const [quote, setQuote] = useState<{
    open: boolean
    categoryId?: string
    session: number
  }>({ open: false, session: 0 })

  const openQuote = (categoryId?: string) => {
    setQuote((current) => ({
      open: true,
      categoryId,
      session: current.session + 1,
    }))
  }

  const closeQuote = () => {
    setQuote((current) => ({ ...current, open: false }))
  }

  return (
    <section id="precios" className="section-pad">
      <div className="shell">
        <SectionHeading
          eyebrow="Servicios y precios"
          title="Precios claros,"
          highlight="sin sorpresas"
          description="Tarifas de referencia en pesos colombianos. Selecciona los servicios que necesitas y elige cómo contactarme."
        />

        <Stagger className="mt-16 grid gap-6 md:grid-cols-2" gap={0.1}>
          {PRICING_CATEGORIES.map((category, index) => (
            <StaggerItem key={category.id} className="h-full">
              <PricingCategoryCard
                category={category}
                index={index}
                onQuote={() => openQuote(category.id)}
              />
            </StaggerItem>
          ))}
        </Stagger>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Reveal className="h-full">
            <div className="glass relative h-full overflow-hidden p-7 sm:p-9">
              <p className="eyebrow">Cómo se cotiza</p>
              <h3 className="mt-5 font-display text-2xl font-semibold tracking-tight text-foreground">
                Un precio inicial, un proyecto a la medida
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
                Los precios son tarifas iniciales de referencia. Cada proyecto se
                cotiza según su complejidad, funcionalidades, tecnologías y tiempo
                de desarrollo.
              </p>

              <ul className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                {PRICING_TERMS.map((term) => (
                  <li key={term.title} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check size={12} strokeWidth={3} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {term.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">
                        {term.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-7 flex items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                <ShieldCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <p className="text-xs leading-relaxed text-muted">
                  Para software comercial siempre se utiliza una licencia legítima.
                  No se ofrecen activaciones ilegales, cracks ni keygens.
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="h-full">
            <div className="glass relative flex h-full flex-col overflow-hidden p-7 sm:p-9">
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-20 -right-16 h-52 w-52 rounded-full bg-tertiary/[0.08] blur-3xl"
              />

              <p className="eyebrow relative">Servicios personalizados</p>
              <h3 className="relative mt-5 font-display text-2xl font-semibold tracking-tight text-foreground">
                ¿Tienes un proyecto en mente?
              </h3>
              <p className="relative mt-4 text-sm leading-relaxed text-muted">
                Contáctame para recibir una cotización personalizada y encontrar
                una solución tecnológica adaptada a tus necesidades.
              </p>

              <div className="relative mt-auto pt-8">
                <Button onClick={() => openQuote()} size="lg" className="w-full">
                  Solicitar cotización
                  <ArrowRight size={16} aria-hidden="true" />
                </Button>
                <p className="mt-4 text-center font-mono text-[11px] text-muted">
                  Sin compromiso · Te preparo una propuesta a la medida.
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <p className="mt-6 text-center font-mono text-[11px] leading-relaxed text-muted">
          Precios en pesos colombianos (COP) · Tarifas de referencia sujetas a
          cotización.
        </p>
      </div>

      <QuoteModal
        key={quote.session}
        open={quote.open}
        onClose={closeQuote}
        initialCategoryId={quote.categoryId}
      />
    </section>
  )
}
