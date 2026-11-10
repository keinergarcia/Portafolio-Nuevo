import { useRef, type CSSProperties, type PointerEvent } from 'react'
import { motion, useReducedMotion, useSpring } from 'motion/react'
import { resolveTechnologyLogo } from '@/lib/technology-logos'
import { cn } from '@/lib/utils'

interface TechnologyChipProps {
  name: string
  icon?: string | null
  /** Posición dentro de la sección: desfasa la flotación de cada ficha. */
  index?: number
  /** `tile` = ficha 3D grande; `pill` = chip compacto (Sobre mí). */
  variant?: 'tile' | 'pill'
  className?: string
}

const TILT_SPRING = { stiffness: 260, damping: 20, mass: 0.6 }
const HOVER_SPRING = { type: 'spring', stiffness: 330, damping: 14, mass: 0.7 } as const

export function TechnologyChip({
  name,
  icon,
  index = 0,
  variant = 'tile',
  className,
}: TechnologyChipProps) {
  const logo = resolveTechnologyLogo({ name, icon })
  const reducedMotion = useReducedMotion()
  const tileRef = useRef<HTMLDivElement>(null)
  const rotateX = useSpring(0, TILT_SPRING)
  const rotateY = useSpring(0, TILT_SPRING)
  const tilt = variant === 'pill' ? 18 : 26

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType !== 'mouse' || !tileRef.current) return
    const rect = tileRef.current.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5
    rotateY.set(px * tilt)
    rotateX.set(-py * tilt)
  }

  const resetTilt = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  const style = {
    '--tech-color': logo?.color ?? 'var(--color-primary)',
    '--tech-delay': `${(index % 7) * -0.55}s`,
    '--tech-duration': `${5.2 + (index % 4) * 0.45}s`,
  } as CSSProperties

  if (variant === 'pill') {
    return (
      <div className={cn('tech-pill-slot', className)} style={style}>
        <motion.div
          ref={tileRef}
          className="tech-pill"
          onPointerMove={handlePointerMove}
          onPointerLeave={resetTilt}
          style={{ rotateX, rotateY }}
          whileHover={reducedMotion ? undefined : { y: -4, scale: 1.04 }}
          transition={HOVER_SPRING}
        >
          {logo && (
            <img className="tech-pill-logo" src={logo.src} alt="" loading="lazy" draggable={false} />
          )}
          <span className="tech-pill-name">{name}</span>
        </motion.div>
      </div>
    )
  }

  return (
    <div className={cn('tech-slot', className)} style={style}>
      <span className="tech-shadow" aria-hidden="true" />
      <div className="tech-float">
        <motion.div
          ref={tileRef}
          className="tech-tile"
          onPointerMove={handlePointerMove}
          onPointerLeave={resetTilt}
          style={{ rotateX, rotateY }}
          whileHover={reducedMotion ? undefined : { y: -11, scale: 1.06 }}
          transition={HOVER_SPRING}
        >
          <span className="tech-tile-face">
            {logo ? (
              <img className="tech-logo" src={logo.src} alt="" loading="lazy" draggable={false} />
            ) : (
              <span className="tech-monogram" aria-hidden="true">
                {name.slice(0, 1)}
              </span>
            )}
          </span>
          <span className="tech-name">{name}</span>
        </motion.div>
      </div>
    </div>
  )
}
