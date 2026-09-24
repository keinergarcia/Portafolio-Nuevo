/* oxlint-disable react/immutability -- el objeto `scene` es un hub mutable compartido con el loop de frames (sistema externo) */
import { Suspense, useEffect, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { useReducedMotion } from 'motion/react'
import * as THREE from 'three'
import { SPACE_CONFIG, useSpaceTier } from './useSpaceTier'
import type { SpaceStateValue } from './space-context'
import { SpaceStateProvider, useSpaceState } from './space-context'
import { useEffects } from '@/contexts/Effects'
import { ParticleField } from './ParticleField'
import { StarTrail } from './StarTrail'
import { CameraRig } from './CameraRig'

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

function ColorfulStars({ reduce }: { reduce: boolean }) {
  const layers = reduce
    ? [
        { count: 60, z: -7, size: 2.4, speed: 0.2, color: '#7dd3fc' },
        { count: 50, z: -5, size: 2.8, speed: 0.18, color: '#c4b5fd' },
      ]
    : [
        { count: 170, z: -8, size: 2.6, speed: 0.22, color: '#7dd3fc' },
        { count: 150, z: -6, size: 2.9, speed: 0.2, color: '#c4b5fd' },
        { count: 130, z: -4, size: 3.1, speed: 0.28, color: '#f6c453' },
        { count: 110, z: -10, size: 2.4, speed: 0.24, color: '#5eead4' },
        { count: 100, z: -3, size: 3.3, speed: 0.3, color: '#f9a8d4' },
      ]
  return (
    <>
      {layers.map((layer) => (
        <Sparkles
          key={`${layer.color}-${layer.z}`}
          count={layer.count}
          scale={[24, 15, 4]}
          position={[0, 0, layer.z]}
          size={layer.size}
          speed={layer.speed}
          color={layer.color}
          opacity={0.75}
        />
      ))}
    </>
  )
}

function SceneContents() {
  const { tier, reduce } = useSpaceState()
  const cfg = SPACE_CONFIG[tier]

  const counts = reduce
    ? {
        starCount: Math.floor(cfg.starCount * 0.3),
        particleCount: Math.floor(cfg.particleCount * 0.28),
        accentCount: Math.floor(cfg.accentCount * 0.25),
      }
    : {
        starCount: cfg.starCount,
        particleCount: cfg.particleCount,
        accentCount: cfg.accentCount,
      }

  return (
    <>
      <ParticleField
        starCount={counts.starCount}
        particleCount={counts.particleCount}
        accentCount={counts.accentCount}
      />
      <ColorfulStars reduce={reduce} />
    </>
  )
}

export function GlobalBackground() {
  const tier = useSpaceTier()
  const reduce = Boolean(useReducedMotion())
  const { background3D } = useEffects()
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
    <>
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
            {background3D && <SceneContents />}
            <CameraRig animate={!reduce} />
          </SpaceStateProvider>
        </Canvas>
      </Suspense>
      <div
        className="absolute inset-0"
        style={{ background: 'rgba(0, 0, 0, 0.26)' }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)',
        }}
      />
      </div>
      <StarTrail />
    </>
  )
}