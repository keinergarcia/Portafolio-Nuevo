import { Suspense, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { motion } from 'motion/react'
import * as THREE from 'three'
import { SpaceStateProvider } from '@/components/three/background/space-context'
import type { SpaceStateValue } from '@/components/three/background/space-context'
import { Galaxy } from '@/components/three/background/Galaxy'
import { useIntro } from '@/contexts/Intro'
import logoUrl from '@/assets/logo-elchivalez.png'

const SPLASH_MS = 5000
const FADE_MS = 800

function SplashScene() {
  const [scene] = useState<SpaceStateValue>(() => ({
    pointerTarget: { current: new THREE.Vector2(0, 0) },
    pointer: { current: new THREE.Vector2(0, 0) },
    scroll: { current: 0 },
    lastMove: { current: performance.now() },
    lastClick: { current: -1e4 },
    tier: 'desktop',
    reduce: false,
  }))

  return (
    <SpaceStateProvider value={scene}>
      <Galaxy starCount={2400} armCount={3} assemblyDuration={2.6} />
    </SpaceStateProvider>
  )
}

export function SplashScreen() {
  const { done, finish } = useIntro()
  const [hide, setHide] = useState(false)

  useEffect(() => {
    const fade = window.setTimeout(() => setHide(true), SPLASH_MS)
    const close = window.setTimeout(() => finish(), SPLASH_MS + FADE_MS)
    return () => {
      window.clearTimeout(fade)
      window.clearTimeout(close)
    }
  }, [finish])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  if (done) return null

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black"
      style={{ pointerEvents: hide ? 'none' : 'auto' }}
      animate={{ opacity: hide ? 0 : 1 }}
      transition={{ duration: FADE_MS / 1000, ease: 'easeInOut' }}
    >
      <div aria-hidden="true" className="absolute inset-0">
        <Canvas
          dpr={[1, 1.6]}
          camera={{ position: [0, 0, 8.5], fov: 55, near: 0.1, far: 160 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>
            <SplashScene />
          </Suspense>
        </Canvas>
      </div>
      <motion.img
        src={logoUrl}
        alt="ElChivalez"
        className="relative z-10 w-48 sm:w-64 md:w-80"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
      />
    </motion.div>
  )
}