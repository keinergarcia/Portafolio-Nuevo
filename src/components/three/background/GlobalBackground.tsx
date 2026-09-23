/* oxlint-disable react/immutability -- el objeto `scene` es un hub mutable compartido con el loop de frames (sistema externo) */
import { Suspense, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { useReducedMotion } from 'motion/react'
import * as THREE from 'three'
import { SPACE_CONFIG, useSpaceTier } from './useSpaceTier'
import type { SpaceStateValue } from './space-context'
import { SpaceStateProvider, useSpaceState } from './space-context'
import { ParticleField } from './ParticleField'
import { Galaxy } from './Galaxy'
import { MagnetField } from './MagnetField'
import { CameraRig } from './CameraRig'
import { useIntro } from '@/contexts/Intro'

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

const MAGNET_COUNT = {
  desktop: 240,
  tablet: 140,
  mobile: 85,
} as const

const MAGNET_RADIUS = {
  desktop: 8,
  tablet: 7,
  mobile: 6,
} as const

const GALAXY_STARS = {
  desktop: 3400,
  tablet: 1900,
  mobile: 1100,
} as const

function SceneContents() {
  const { tier, reduce } = useSpaceState()
  const { done } = useIntro()
  const cfg = SPACE_CONFIG[tier]

  const counts = reduce
    ? {
        starCount: Math.floor(cfg.starCount * 0.3),
        particleCount: Math.floor(cfg.particleCount * 0.28),
        accentCount: Math.floor(cfg.accentCount * 0.25),
        magnetCount: Math.floor(MAGNET_COUNT[tier] * 0.25),
      }
    : {
        starCount: cfg.starCount,
        particleCount: cfg.particleCount,
        accentCount: cfg.accentCount,
        magnetCount: MAGNET_COUNT[tier],
      }

  return (
    <>
      <ParticleField
        starCount={counts.starCount}
        particleCount={counts.particleCount}
        accentCount={counts.accentCount}
      />
      {!done && <Galaxy starCount={GALAXY_STARS[tier]} />}
      <MagnetField count={counts.magnetCount} radius={MAGNET_RADIUS[tier]} />
    </>
  )
}

export function GlobalBackground() {
  const tier = useSpaceTier()
  const reduce = Boolean(useReducedMotion())
  const [hidden, setHidden] = useState(false)
  const webgl = useMemo(() => supportsWebGL(), [])

  const [scene] = useState<SpaceStateValue>(() => ({
    pointerTarget: { current: new THREE.Vector2(0.12, -0.08) },
    pointer: { current: new THREE.Vector2(0.12, -0.08) },
    scroll: { current: 0 },
    lastMove: { current: performance.now() },
    lastClick: { current: -1e4 },
    tier,
    reduce,
  }))

  useEffect(() => {
    scene.tier = tier
    scene.reduce = reduce
  }, [scene, tier, reduce])

  useEffect(() => {
    const onVisibilityChange = () => setHidden(document.hidden)
    onVisibilityChange()
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [])

  const config = SPACE_CONFIG[tier]
  const frameloop: 'always' | 'never' = hidden || reduce ? 'never' : 'always'

  if (!webgl) return null

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 90% at 50% 40%, #03040a 0%, #010103 60%, #000000 100%)',
        }}
      />
      <Suspense fallback={null}>
        <Canvas
          dpr={[1, config.dpr]}
          frameloop={frameloop}
          camera={{ position: [0, 0, 8.5], fov: 55, near: 0.1, far: 160 }}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          style={{ pointerEvents: 'none' }}
        >
          <SpaceStateProvider value={scene}>
            <SceneContents />
            <CameraRig animate={!reduce} />
          </SpaceStateProvider>
        </Canvas>
      </Suspense>
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0, 0, 0, 0.35)' }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0) 52%, rgba(0,0,0,0.6) 100%)',
        }}
      />
    </div>
  )
}