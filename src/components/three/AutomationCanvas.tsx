/* oxlint-disable react/immutability, react/set-state-in-effect -- estado mutable del puntero y observers de visibilidad controlados por efectos */
import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { useReducedMotion } from 'motion/react'
import { useInViewport } from '@/hooks/useInViewport'
import { useSpaceTier } from '@/components/three/background/useSpaceTier'
import { CAM_Z, FOV, TIER_CONFIG, type FlowPointer, type FlowTier } from './automation/config'

const FlowScene = lazy(() => import('./automation/FlowScene').then((m) => ({ default: m.FlowScene })))

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    )
  } catch {
    return false
  }
}

function useAutomationPointer(containerRef: React.RefObject<HTMLDivElement | null>): FlowPointer {
  const box = useRef(new THREE.Vector2())
  const win = useRef(new THREE.Vector2())
  const lastMove = useRef(-1e4)

  useEffect(() => {
    const onPointerMove = (event: PointerEvent) => {
      win.current.x = (event.clientX / window.innerWidth) * 2 - 1
      win.current.y = -((event.clientY / window.innerHeight) * 2 - 1)
      lastMove.current = performance.now()
      const el = containerRef.current
      if (el) {
        const rect = el.getBoundingClientRect()
        if (rect.width > 0 && rect.height > 0) {
          box.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
          box.current.y = -((event.clientY - rect.top) / rect.height) * 2 - 1
        }
      }
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    return () => window.removeEventListener('pointermove', onPointerMove)
  }, [containerRef])

  return { box, win, lastMove }
}

export function AutomationCanvas({ className }: { className?: string }) {
  const [ref, inView] = useInViewport<HTMLDivElement>(0.04)
  const [ready, setReady] = useState(false)
  const restrictedMotion = Boolean(useReducedMotion())
  const tier = useSpaceTier() as FlowTier
  const containerRef = useRef<HTMLDivElement>(null)
  const pointer = useAutomationPointer(containerRef)
  const [hidden, setHidden] = useState(false)
  const webgl = useMemo(() => supportsWebGL(), [])

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 350)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const onVisibilityChange = () => setHidden(document.hidden)
    onVisibilityChange()
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  const frameloop: 'always' | 'never' = restrictedMotion || hidden ? 'never' : 'always'

  return (
    <div ref={ref} className={className} aria-hidden="true">
      <div ref={containerRef} className="absolute inset-0">
        {webgl && ready && inView ? (
          <Canvas
            dpr={[1, TIER_CONFIG[tier].dpr]}
            frameloop={frameloop}
            camera={{ position: [0, -0.04, CAM_Z], fov: FOV, near: 0.1, far: 80 }}
            gl={{
              antialias: true,
              alpha: true,
              powerPreference: 'high-performance',
            }}
          >
            <Suspense fallback={null}>
              <FlowScene pointer={pointer} tier={tier} reduce={restrictedMotion} />
            </Suspense>
          </Canvas>
        ) : null}
      </div>
    </div>
  )
}