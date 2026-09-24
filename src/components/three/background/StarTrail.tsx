/* oxlint-disable react/purity -- estela del puntero: semillas aleatorias y mutación de arrays locales en el loop de frames (sistema externo a React) */
import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { useEffects } from '@/contexts/Effects'

const SPACING = 4.5
const MAX_PARTICLES = 800
const MAX_STEPS_PER_FRAME = 30

const STAR_COLORS = [
  '#7dd3fc',
  '#c4b5fd',
  '#f6c453',
  '#5eead4',
  '#f9a8d4',
  '#ffffff',
  '#93c5fd',
] as const

interface TrailParticle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  max: number
  size: number
  color: string
  phase: number
}

export function StarTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reduce = Boolean(useReducedMotion())
  const { background3D, trailThickness, trailLife } = useEffects()

  const settingsRef = useRef({ trailThickness, trailLife })
  useEffect(() => {
    settingsRef.current = { trailThickness, trailLife }
  }, [trailThickness, trailLife])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || reduce || !background3D) return
    const maybe = canvas.getContext('2d')
    if (!maybe) return
    const c2d = maybe

    let raf = 0
    let running = true
    let w = 0
    let h = 0
    const dpr = Math.min(1.5, window.devicePixelRatio || 1)
    const pointer = { x: -99999, y: -99999 }
    const prev = { x: -99999, y: -99999 }
    const particles: TrailParticle[] = []
    let prevNow = performance.now()
    let time = 0

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      c2d.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const onMove = (event: PointerEvent) => {
      pointer.x = event.clientX
      pointer.y = event.clientY
    }

    const onVisibility = () => {
      running = !document.hidden
      if (running) {
        prevNow = performance.now()
        raf = requestAnimationFrame(frame)
      } else {
        cancelAnimationFrame(raf)
        c2d.clearRect(0, 0, w, h)
      }
    }

    const emit = (x: number, y: number, dx: number, dy: number) => {
      const { trailThickness, trailLife } = settingsRef.current
      const spread = 3.5 * trailThickness
      const drift = 18 + Math.random() * 28
      const maxLife = (0.4 + Math.random() * 0.55) * trailLife
      particles.push({
        x: x + (Math.random() - 0.5) * spread,
        y: y + (Math.random() - 0.5) * spread,
        vx: dx * drift + (Math.random() - 0.5) * 14,
        vy: dy * drift + (Math.random() - 0.5) * 14,
        life: maxLife,
        max: maxLife,
        size: (1.5 + Math.random() * 1.6) * trailThickness,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        phase: Math.random() * Math.PI * 2,
      })
    }

    function frame(now: number) {
      if (!running) return
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.05, (now - prevNow) / 1000)
      prevNow = now
      time += dt

      const dx = pointer.x - prev.x
      const dy = pointer.y - prev.y
      const dist = Math.hypot(dx, dy)
      if (pointer.x > -9999 && dist > 0.5) {
        const steps = Math.min(Math.floor(dist / SPACING), MAX_STEPS_PER_FRAME)
        const nx = dx / dist
        const ny = dy / dist
        for (let s = 1; s <= steps; s++) {
          emit(prev.x + nx * SPACING * s, prev.y + ny * SPACING * s, nx, ny)
        }
      }
      prev.x = pointer.x
      prev.y = pointer.y

      if (particles.length > MAX_PARTICLES) {
        particles.splice(0, particles.length - MAX_PARTICLES)
      }

      c2d.globalCompositeOperation = 'source-over'
      c2d.clearRect(0, 0, w, h)
      c2d.globalCompositeOperation = 'lighter'

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.life -= dt
        if (p.life <= 0) {
          particles.splice(i, 1)
          i--
          continue
        }
        p.x += p.vx * dt
        p.y += p.vy * dt

        const blend = Math.max(0, p.life / p.max)
        const eased = blend * blend
        const twinkle = 0.82 + 0.18 * Math.sin(time * 9 + p.phase)
        const radius = p.size * (0.5 + eased * 0.8) * twinkle

        c2d.globalAlpha = eased * 0.32
        c2d.fillStyle = p.color
        c2d.beginPath()
        c2d.arc(p.x, p.y, radius * 2.3, 0, Math.PI * 2)
        c2d.fill()

        c2d.globalAlpha = eased
        c2d.beginPath()
        c2d.arc(p.x, p.y, radius, 0, Math.PI * 2)
        c2d.fill()
      }
      c2d.globalAlpha = 1
    }

    resize()
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('resize', resize, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    raf = requestAnimationFrame(frame)

    return () => {
      running = false
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [reduce, background3D])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[70]"
    />
  )
}