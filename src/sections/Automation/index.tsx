import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/animations/Reveal'
import { AutomationCanvas } from '@/components/three/AutomationCanvas'

export function AutomationFlow() {
  return (
    <section id="automatizacion" className="relative overflow-hidden section-pad" aria-label="Flujo de automatización">
      <AutomationCanvas className="absolute inset-0" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-0 h-28 bg-gradient-to-b from-background via-background/60 to-transparent sm:h-40" aria-hidden="true" />

      <div className="shell relative flex min-h-[520px] flex-col items-center justify-between pt-4 sm:min-h-[640px] sm:pt-6">
        <div className="pointer-events-none">
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow="Automatización e IA"
              title="Un proceso,"
              highlight="un flujo"
              description="Las automatizaciones conectan a tu cliente con la respuesta correcta en segundos."
            />
          </Reveal>
        </div>

        <p
          className="pointer-events-none border-t border-white/[0.06] pt-4 text-center font-mono text-[10px] uppercase tracking-[0.32em] text-white/25 sm:text-xs"
          aria-hidden="true"
        >
          Entrada → Procesamiento → Decisión → Acción → Respuesta
        </p>
      </div>
    </section>
  )
}