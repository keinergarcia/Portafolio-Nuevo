/* oxlint-disable react/purity -- la disposición de la galaxia usa Math.random de forma deliberada y estable; se comparte el reloj y el scroll del loop de frames */
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSpaceState } from './space-context'

const STAR_COLORS = [
  '#ffffff',
  '#dfe7ff',
  '#b6c8ff',
  '#93b4fb',
  '#62e6ff',
  '#9d8cff',
  '#f3b5fa',
  '#74d4ff',
] as const

const CHROMA = ['#22d3ee', '#a78bfa', '#f3b5fa', '#f6c453', '#67e8f9'] as const

const MAX_SCROLL_TWIST = 1.6
const REF_RADIUS = 2.6

interface GalaxyProps {
  starCount: number
  armCount?: number
  radius?: number
  assemblyDuration?: number
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const x = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)))
  return x * x * (3 - 2 * x)
}

function buildGalaxy(count: number, armCount: number, radius: number) {
  const starCount = Math.floor(count * 0.38)
  const dustCount = count - starCount

  const starPos = new Float32Array(starCount * 3)
  const starBase = new Float32Array(starCount * 3)
  const starColor = new Float32Array(starCount * 3)
  const starR = new Float32Array(starCount)
  const starA = new Float32Array(starCount)
  const starY = new Float32Array(starCount)
  const starPhase = new Float32Array(starCount)

  const dustPos = new Float32Array(dustCount * 3)
  const dustColor = new Float32Array(dustCount * 3)
  const dustPhase = new Float32Array(dustCount)

  const palette = STAR_COLORS.map((hex) => new THREE.Color(hex))
  const temp = new THREE.Color()
  let si = 0
  let di = 0

  const place = (i: number, star: boolean) => {
    const t = Math.random()
    const r = radius * Math.pow(t, 0.62)
    const arm = i % armCount
    const spin = (arm / armCount) * Math.PI * 2
    const wind = (r / radius) * 4.8
    const spread = 0.16 + (1 - t) * 0.55
    const angle = spin + wind + (Math.random() - 0.5) * spread * 2.6
    const x = Math.cos(angle) * r
    const y = (Math.random() - 0.5) * Math.max(0.08, (1 - t) * 0.9)
    const z = Math.sin(angle) * r

    temp.copy(palette[Math.floor(Math.random() * palette.length)])
    const brightness = star ? 0.3 + 0.55 * (1 - t) : 0.16 + 0.32 * (1 - t)

    if (star) {
      const idx = si * 3
      starPos[idx] = x
      starPos[idx + 1] = y
      starPos[idx + 2] = z
      temp.multiplyScalar(brightness)
      starBase[idx] = temp.r
      starBase[idx + 1] = temp.g
      starBase[idx + 2] = temp.b
      starColor[idx] = temp.r
      starColor[idx + 1] = temp.g
      starColor[idx + 2] = temp.b
      starR[si] = r
      starA[si] = angle
      starY[si] = y
      starPhase[si] = Math.random() * Math.PI * 2
      si++
    } else {
      const idx = di * 3
      dustPos[idx] = x
      dustPos[idx + 1] = y
      dustPos[idx + 2] = z
      temp.multiplyScalar(brightness)
      dustColor[idx] = temp.r
      dustColor[idx + 1] = temp.g
      dustColor[idx + 2] = temp.b
      dustPhase[di] = Math.random() * Math.PI * 2
      di++
    }
  }

  for (let i = 0; i < count; i++) {
    place(i, i % 10 < 4)
  }

  return {
    starPos,
    starBase,
    starColor,
    starR,
    starA,
    starY,
    starPhase,
    starCount: si,
    dustPos,
    dustColor,
    dustPhase,
    dustCount: di,
  }
}

function makeCoreTexture() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)')
    gradient.addColorStop(0.18, 'rgba(226, 232, 255, 0.55)')
    gradient.addColorStop(0.45, 'rgba(167, 139, 250, 0.2)')
    gradient.addColorStop(0.7, 'rgba(103, 232, 249, 0.08)')
    gradient.addColorStop(1, 'rgba(120, 140, 210, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

export function Galaxy({ starCount, armCount = 3, radius = 7, assemblyDuration }: GalaxyProps) {
  const group = useRef<THREE.Group>(null)
  const core = useRef<THREE.Sprite>(null)
  const starMesh = useRef<THREE.Points>(null)
  const dustMesh = useRef<THREE.Points>(null)
  const starMat = useRef<THREE.PointsMaterial>(null)
  const dustMat = useRef<THREE.PointsMaterial>(null)
  const { scroll } = useSpaceState()

  const data = useMemo(() => buildGalaxy(starCount, armCount, radius), [starCount, armCount, radius])
  const coreTexture = useMemo(() => makeCoreTexture(), [])
  const chroma = useMemo(() => CHROMA.map((hex) => new THREE.Color(hex)), [])
  const temp = useMemo(() => new THREE.Color(), [])

  const starGeometry = useMemo(
    () =>
      new THREE.BufferGeometry()
        .setAttribute('position', new THREE.BufferAttribute(data.starPos, 3))
        .setAttribute('color', new THREE.BufferAttribute(data.starColor, 3)),
    [data],
  )
  const dustGeometry = useMemo(
    () =>
      new THREE.BufferGeometry()
        .setAttribute('position', new THREE.BufferAttribute(data.dustPos, 3))
        .setAttribute('color', new THREE.BufferAttribute(data.dustColor, 3)),
    [data],
  )

  useFrame((state) => {
    const g = group.current
    const c = core.current
    const stars = starMesh.current
    const dust = dustMesh.current
    const t = state.clock.elapsedTime
    const s = scroll.current
    const assembly = assemblyDuration
      ? smoothstep(0.1, assemblyDuration, t)
      : 1

    if (g) {
      g.rotation.z = Math.sin(t * 0.05) * 0.04 + (1 - assembly) * 0.14
      g.position.set(0, 0, -6)
      g.scale.setScalar(Math.max(0.0001, 0.01 + 0.99 * assembly))
    }
    if (c) {
      const pulse = 1 + Math.sin(t * 0.5) * 0.05
      c.scale.setScalar(radius * 0.8 * pulse * assembly)
      const mat = c.material as THREE.SpriteMaterial
      mat.opacity = (0.26 + Math.sin(t * 0.6) * 0.06) * assembly
    }
    if (dust) {
      const mat = dustMat.current
      if (mat) mat.opacity = (0.2 + Math.sin(t * 0.7) * 0.03) * assembly
    }
    if (starMat.current) {
      starMat.current.opacity = 0.55 * assembly
    }

    if (stars) {
      const posAttr = stars.geometry.attributes.position
      const colorAttr = stars.geometry.attributes.color
      const pos = posAttr.array as Float32Array
      const colors = colorAttr.array as Float32Array
      const cycle = s * 3
      const band = Math.floor(cycle) % chroma.length
      const next = (Math.floor(cycle) + 1) % chroma.length
      const frac = cycle - Math.floor(cycle)

      for (let j = 0; j < data.starCount; j++) {
        const phase = data.starPhase[j]
        const wave = Math.sin(t * (0.2 + data.starR[j] * 0.06) + phase)
        const angle = data.starA[j] + s * MAX_SCROLL_TWIST * (REF_RADIUS / data.starR[j]) * 0.35 + wave * 0.09
        const r = data.starR[j] * (1 + Math.sin(t * 0.6 + phase) * 0.04)
        const idx = j * 3
        pos[idx] = Math.cos(angle) * r
        pos[idx + 1] = data.starY[j] + Math.sin(t * 0.45 + phase * 1.7) * 0.08
        pos[idx + 2] = Math.sin(angle) * r

        const twinkle = 0.4 + 0.35 * Math.sin(t * 1.7 + phase * 2.1)
        const base = data.starBase
        if (j % 4 === 0) {
          temp.copy(chroma[band]).lerp(chroma[next], frac)
          colors[idx] = temp.r * twinkle
          colors[idx + 1] = temp.g * twinkle
          colors[idx + 2] = temp.b * twinkle
        } else {
          colors[idx] = base[idx] * twinkle
          colors[idx + 1] = base[idx + 1] * twinkle
          colors[idx + 2] = base[idx + 2] * twinkle
        }
      }
      posAttr.needsUpdate = true
      colorAttr.needsUpdate = true
    }
  })

  return (
    <group ref={group} position={[0, 0, -6]} rotation={[1.0, 0, 0.42]}>
      <points ref={dustMesh} frustumCulled={false} geometry={dustGeometry}>
        <pointsMaterial
          ref={dustMat}
          size={0.028}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.2}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <points ref={starMesh} frustumCulled={false} geometry={starGeometry}>
        <pointsMaterial
          ref={starMat}
          size={0.05}
          sizeAttenuation
          vertexColors
          transparent
          opacity={0.55}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
      <sprite ref={core} scale={[radius * 0.8, radius * 0.8, 1]} renderOrder={1}>
        <spriteMaterial
          map={coreTexture}
          transparent
          opacity={0.26}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </sprite>
    </group>
  )
}