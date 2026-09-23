import { motion } from 'motion/react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { HeroScene } from '@/components/three/HeroScene'
import { ScrollParallax } from '@/components/animations/ScrollParallax'
import { usePortfolioData } from '@/contexts/PortfolioData'

const EASE = [0.22, 1, 0.36, 1] as const

const DEFAULT_TAGLINE =
  'Creo soluciones digitales modernas mediante desarrollo web, aplicaciones de escritorio, automatización e inteligencia artificial.'

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
      <div className="grid-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-b from-primary/10 to-transparent blur-3xl"
      />

      <div className="shell relative flex min-h-[calc(100svh-4rem)] flex-col justify-center py-20 lg:flex-row lg:items-center lg:gap-10">
        <div className="max-w-2xl lg:flex-1">
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            {eyebrow}
          </motion.p>

          <motion.h1
            className="mt-6 font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-6xl xl:text-7xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
          >
            {firstName}
            <br />
            {lastName ? <span className="text-gradient">{lastName}</span> : <span className="text-gradient">{firstName}</span>}
          </motion.h1>

          <motion.p
            className="mt-5 font-display text-lg font-semibold uppercase tracking-[0.18em] text-muted sm:text-xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
          >
            {title}
          </motion.p>

          <motion.p
            className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: EASE }}
          >
            {tagline}
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap items-center gap-3"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
          >
            <Button to="/projects" size="lg">
              Ver proyectos
            </Button>
            <Button to="/services" size="lg" variant="secondary">
              Mis servicios
            </Button>
            <Button to="/contact" size="lg" variant="ghost">
              Contactar
            </Button>
          </motion.div>
        </div>

        <ScrollParallax className="mt-16 flex justify-center lg:mt-0 lg:flex-1" speed={0.15}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, delay: 0.3, ease: EASE }}
          >
            <HeroScene />
          </motion.div>
        </ScrollParallax>
      </div>

      <motion.a
        href="#sobre-mi"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-muted transition-colors hover:text-primary md:block"
        aria-label="Bajar a la sección siguiente"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <ChevronDown size={22} className="animate-bounce" />
      </motion.a>
    </section>
  )
}