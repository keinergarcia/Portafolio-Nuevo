import { lazy, Suspense } from 'react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useMediaQuery } from '@/hooks/useMediaQuery'

const AutomationCanvas = lazy(() =>
  import('@/components/three/AutomationCanvas').then((m) => ({
    default: m.AutomationCanvas,
  })),
)

export function AutomationFlow() {
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const heading = (
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
  )

  const caption = (
    <p
      className="pointer-events-none border-t border-white/[0.06] pt-4 text-center font-mono text-[10px] uppercase tracking-[0.32em] text-white/40 sm:text-xs"
      aria-hidden="true"
    >
      Entrada → Procesamiento → Decisión → Acción → Respuesta
    </p>
  )

  return (
    <section id="automatizacion" className="relative overflow-hidden section-pad" aria-label="Flujo de automatización">
      {isDesktop ? (
        <>
          <Suspense fallback={null}>
            <AutomationCanvas className="absolute inset-0" />
          </Suspense>

          <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-28 bg-gradient-to-b from-background via-background/60 to-transparent sm:h-40" aria-hidden="true" />

          <div className="shell relative flex min-h-[520px] flex-col items-center justify-between pt-4 sm:min-h-[640px] sm:pt-6">
            {heading}
            {caption}
          </div>
        </>
      ) : (
        <div className="shell relative">
          {heading}

          {/* La misma escena 3D, con su propio escenario y etiquetas compactas */}
          <Suspense fallback={null}>
            <AutomationCanvas className="relative mt-4 h-[320px] w-full sm:h-[380px]" />
          </Suspense>

          <div className="mt-8">{caption}</div>
        </div>
      )}
    </section>
  )
}
