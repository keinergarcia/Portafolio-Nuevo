import { lazy, Suspense } from 'react'
import { SectionHeading } from '@/components/ui/SectionHeading'

const AutomationCanvas = lazy(() =>
  import('@/components/three/AutomationCanvas').then((m) => ({
    default: m.AutomationCanvas,
  })),
)

export function AutomationFlow() {
  return (
    <section id="automatizacion" className="relative overflow-hidden section-pad" aria-label="Flujo de automatización">
      <Suspense fallback={null}>
        <AutomationCanvas className="absolute inset-0" />
      </Suspense>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-28 bg-gradient-to-b from-background via-background/60 to-transparent sm:h-40" aria-hidden="true" />

      <div className="shell relative flex min-h-[520px] flex-col items-center justify-between pt-4 sm:min-h-[640px] sm:pt-6">
        <div className="pointer-events-none">
          <SectionHeading
            align="center"
            reveal={false}
            eyebrow="Automatización e IA"
            title="Un proceso,"
            highlight="un flujo"
            description="Las automatizaciones conectan a tu cliente con la respuesta correcta en segundos."
          />
        </div>

        <p
          className="pointer-events-none border-t border-white/[0.06] pt-4 text-center font-mono text-[10px] uppercase tracking-[0.32em] text-white/40 sm:text-xs"
          aria-hidden="true"
        >
          Entrada → Procesamiento → Decisión → Acción → Respuesta
        </p>
      </div>
    </section>
  )
}