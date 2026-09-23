/* oxlint-disable react/purity, react/only-export-components -- la semilla de partículas usa Math.random de forma deliberada y estable; las paletas se exportan como constantes compartidas */
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSpaceState } from './space-context'

interface LayerPointsProps {
  count: number
  minRadius: number
  maxRadius: number
  palette: readonly string[]
  size: number
  opacity: number
  additive?: boolean
  groupZ: number
  parallax: number
  rotationSpeed: number
}

function distribute(count: number, minRadius: number, maxRadius: number) {
  const positions = new Float32Array(count * 3)
  const radiusSpread = maxRadius - minRadius
  for (let i = 0; i < count; i++) {
    const radius = minRadius + Math.pow(Math.random(), 0.55) * radiusSpread
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const index = i * 3
    positions[index] = radius * Math.sin(phi) * Math.cos(theta)
    positions[index + 1] = radius * Math.sin(phi) * Math.sin(theta)
    positions[index + 2] = radius * Math.cos(phi)
  }
  return positions
}

function colorize(count: number, palette: readonly string[]) {
  const colors = new Float32Array(count * 3)
  const paletteColors = palette.map((hex) => new THREE.Color(hex))
  for (let i = 0; i < count; i++) {
    const color = paletteColors[Math.floor(Math.random() * paletteColors.length)]
    const index = i * 3
    colors[index] = color.r
    colors[index + 1] = color.g
    colors[index + 2] = color.b
  }
  return colors
}

function LayerPoints({
  count,
  minRadius,
  maxRadius,
  palette,
  size,
  opacity,
  additive = false,
  groupZ,
  parallax,
  rotationSpeed,
}: LayerPointsProps) {
  const group = useRef<THREE.Group>(null)
  const { pointer } = useSpaceState()

  const { positions, colors } = useMemo(
    () => ({
      positions: distribute(count, minRadius, maxRadius),
      colors: colorize(count, palette),
    }),
    [count, minRadius, maxRadius, palette],
  )

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    const p = pointer.current
    const targetX = p.x * parallax
    const targetY = -p.y * parallax * 0.6
    g.position.x = THREE.MathUtils.damp(g.position.x, targetX, 2.6, delta)
    g.position.y = THREE.MathUtils.damp(g.position.y, targetY, 2.6, delta)
    g.rotation.y += delta * rotationSpeed
    g.rotation.x = Math.sin(t * 0.04) * 0.02 + p.y * parallax * 0.01
  })

  return (
    <group ref={group} position={[0, 0, groupZ]}>
      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        </bufferGeometry>
        <pointsMaterial
          size={size}
          vertexColors
          sizeAttenuation
          transparent
          opacity={opacity}
          depthWrite={false}
          blending={additive ? THREE.AdditiveBlending : THREE.NormalBlending}
        />
      </points>
    </group>
  )
}

export const STAR_PALETTE = ['#ffffff', '#e6ecf8', '#dbe6f9', '#c9d8f7'] as const
export const PARTICLE_PALETTE = ['#ffffff', '#eaf0fb', '#e0e9f9', '#ffffff'] as const
export const ACCENT_PALETTE = ['#f4f8ff', '#ffffff', '#dfe9fb', '#eef4ff'] as const

interface ParticleFieldProps {
  starCount: number
  particleCount: number
  accentCount: number
}

export function ParticleField({ starCount, particleCount, accentCount }: ParticleFieldProps) {
  return (
    <>
      <LayerPoints
        count={starCount}
        minRadius={16}
        maxRadius={30}
        palette={STAR_PALETTE}
        size={0.03}
        opacity={0.45}
        groupZ={-14}
        parallax={0.1}
        rotationSpeed={0.004}
      />
      <LayerPoints
        count={particleCount}
        minRadius={6}
        maxRadius={15}
        palette={PARTICLE_PALETTE}
        size={0.04}
        opacity={0.4}
        groupZ={-7}
        parallax={0.35}
        rotationSpeed={0.012}
      />
      <LayerPoints
        count={accentCount}
        minRadius={3}
        maxRadius={9}
        palette={ACCENT_PALETTE}
        size={0.06}
        opacity={0.3}
        additive
        groupZ={-2}
        parallax={0.7}
        rotationSpeed={0.02}
      />
    </>
  )
}