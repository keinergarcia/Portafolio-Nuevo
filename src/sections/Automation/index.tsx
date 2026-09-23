import { Fragment } from 'react'
import {
  BrainCircuit,
  Database,
  MessageCircle,
  User,
  Workflow,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/animations/Reveal'

const STEPS: { icon: LucideIcon; label: string }[] = [
  { icon: User, label: 'Cliente' },
  { icon: MessageCircle, label: 'WhatsApp' },
  { icon: Workflow, label: 'Automatización' },
  { icon: BrainCircuit, label: 'IA' },
  { icon: Database, label: 'Base de datos' },
  { icon: Zap, label: 'Respuesta / Acción' },
]

function FlowNode({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="glass flex flex-1 items-center gap-3 px-5 py-4">
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-tertiary/20 text-primary">
        <Icon size={18} aria-hidden="true" />
      </span>
      <span className="font-display text-sm font-semibold text-foreground">{label}</span>
    </div>
  )
}

export function AutomationFlow() {
  return (
    <section id="automatizacion" className="shell py-20 sm:py-24" aria-label="Flujo de automatización">
      <Reveal>
        <SectionHeading
          align="center"
          eyebrow="Automatización e IA"
          title="Un proceso,"
          highlight="un flujo"
          description="Las automatizaciones conectan a tu cliente con la respuesta correcta en segundos."
        />
      </Reveal>

      <Reveal className="mt-12" delay={0.15}>
        <div className="relative rounded-3xl border border-white/[0.08] bg-gradient-to-b from-white/[0.03] to-transparent p-6 sm:p-10">
          <div className="relative flex flex-col items-stretch gap-0 lg:flex-row lg:items-center">
            {STEPS.map((step, index) => (
              <Fragment key={step.label}>
                <FlowNode icon={step.icon} label={step.label} />

                {index < STEPS.length - 1 && (
                  <>
                    <div
                      aria-hidden="true"
                      className="relative mx-auto block h-10 w-px bg-white/10 lg:hidden"
                    >
                      <span className="absolute h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-primary shadow-glow animate-flow-y" />
                    </div>
                    <div
                      aria-hidden="true"
                      className="relative hidden w-12 shrink-0 self-center bg-white/10 lg:block lg:h-px"
                    >
                      <span className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary shadow-glow animate-flow-x" />
                    </div>
                  </>
                )}
              </Fragment>
            ))}
          </div>

          <div className="mt-10 border-t border-white/[0.06] pt-6 text-center">
            <p className="font-mono text-xs tracking-wider text-muted">
              CLIENTE → WHATSAPP → AUTOMATIZACIÓN → IA → BASE DE DATOS → RESPUESTA
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  )
}