import { motion } from 'motion/react'
import { ArrowRight, ArrowUpRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { HeroScene } from '@/components/three/HeroScene'
import { ScrollParallax } from '@/components/animations/ScrollParallax'
import { usePortfolioData } from '@/contexts/PortfolioData'

const EASE = [0.22, 1, 0.36, 1] as const

const DEFAULT_TAGLINE =
  'Creo soluciones digitales modernas mediante desarrollo web, aplicaciones de escritorio, automatización e inteligencia artificial.'

const STACK = ['React', 'TypeScript', 'Node.js', 'Supabase', 'IA generativa']

export function Hero() {
  const { profile, settings } = usePortfolioData()

  const eyebrow = settings['home.hero_eyebrow'] ?? 'ElChivalez · Portafolio'
  const fullName = settings['home.hero_name'] ?? profile.full_name ?? 'Keiner García'
  const [firstName, ...restParts] = fullName.trim().split(/\s+/)
  const lastName = restParts.join(' ')
  const title =
    settings['home.hero_title'] ?? profile.professional_title ?? 'Desarrollador y Analista de Software'
  const tagline = settings['home.hero_tagline'] ?? profile.bio ?? DEFAULT_TAGLINE

  return (
    <section className="relative overflow-hidden" aria-label="Presentación">
      <div
        className="grid-glow pointer-events-none absolute inset-0 opacity-70"
        aria-hidden="true"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 -left-48 h-[34rem] w-[34rem] rounded-full bg-primary/[0.06] blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -right-56 h-[38rem] w-[38rem] rounded-full bg-secondary/[0.09] blur-[140px]"
      />

      <div className="shell relative grid min-h-[calc(100svh-4.5rem)] items-center gap-10 py-12 sm:gap-12 sm:py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-8 lg:py-24">
        <div className="relative z-10 order-last max-w-[42rem] lg:order-none">
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            {eyebrow}
          </motion.p>

          <motion.h1
            className="mt-7 font-display text-[clamp(3.25rem,6.2vw,5.75rem)] leading-[0.95] font-bold tracking-[-0.035em]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          >
            <span className="block">{firstName}</span>
            {lastName && <span className="text-gradient block">{lastName}</span>}
          </motion.h1>

          <motion.p
            className="mt-7 font-display text-xl font-semibold tracking-tight text-foreground/90 sm:text-2xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
          >
            {title}
          </motion.p>

          <motion.p
            className="mt-5 max-w-xl text-base leading-relaxed text-pretty text-muted sm:text-lg"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
          >
            {tagline}
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
          >
            <Button to="/projects" size="lg" className="group">
              Ver proyectos
              <ArrowRight
                size={17}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </Button>
            <Button to="/contact" size="lg" variant="secondary">
              Hablemos
            </Button>
            <Button
              to="/services"
              size="sm"
              variant="ghost"
              className="group text-muted"
            >
              Mis servicios
              <ArrowUpRight
                size={15}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </Button>
          </motion.div>

          <motion.div
            className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-white/[0.07] pt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <span className="mr-1 font-mono text-[10px] tracking-[0.26em] text-white/35 uppercase">
              Stack
            </span>
            {STACK.map((tech, index) => (
              <span key={tech} className="flex items-center gap-3">
                {index > 0 && (
                  <span aria-hidden="true" className="h-1 w-1 rounded-full bg-primary/50" />
                )}
                <span className="font-mono text-xs text-muted/80">{tech}</span>
              </span>
            ))}
          </motion.div>
        </div>

        <motion.div
          className="relative order-first mx-auto flex w-full max-w-[15rem] items-center justify-center sm:max-w-[26rem] lg:order-none lg:mx-0 lg:max-w-[30rem] xl:max-w-[34rem]"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.25, ease: EASE }}
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute inset-[10%] rounded-full bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),rgba(99,102,241,0.10)_45%,transparent_72%)] blur-2xl" />
            <div className="absolute inset-[3%] rounded-full border border-white/[0.05]" />
            <div className="absolute inset-[16%] rounded-full border border-dashed border-white/[0.05]" />
          </div>

          <ScrollParallax className="relative w-full" speed={0.12}>
            <HeroScene />
          </ScrollParallax>
        </motion.div>
      </div>

      <motion.a
        href="#sobre-mi"
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 font-mono text-[10px] tracking-[0.3em] text-muted/60 uppercase transition-colors hover:text-primary lg:flex"
        aria-label="Bajar a la sección siguiente"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        Explora
        <ChevronDown size={18} className="animate-bounce text-primary/70" />
      </motion.a>
    </section>
  )
}
