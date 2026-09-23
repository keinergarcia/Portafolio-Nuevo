/* oxlint-disable react/purity, react/immutability -- campo magnético del logo: estado mutable y semillas aleatorias deliberadas para un sistema físico externo al render */
import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import type { RootState } from '@react-three/fiber'
import * as THREE from 'three'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import logoUrl from '@/assets/logo-elchivalez.png'

const STAR_COLORS = ['#ffffff', '#e8edf7', '#d4e0fb'] as const

const FIELD_RADIUS = 3.4
const INFLUENCE = 2.5
const ABSORB_DIST = 0.5
const STRENGTH = 30
const SWIRL = 7
const VEL_DAMP = 3.4
const SPRING_K = 2.2
const ABSORB_TIME = 0.28

function smoothstep(edge0: number, edge1: number, value: number) {
  const x = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)))
  return x * x * (3 - 2 * x)
}

interface PointerState {
  box: React.MutableRefObject<THREE.Vector2>
  win: React.MutableRefObject<THREE.Vector2>
  lastMove: React.MutableRefObject<number>
  lastClick: React.MutableRefObject<number>
}

function usePointerState(containerRef: React.RefObject<HTMLDivElement | null>): PointerState {
  const box = useRef(new THREE.Vector2())
  const win = useRef(new THREE.Vector2())
  const lastMove = useRef(performance.now())
  const lastClick = useRef(-1e4)

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
    const onPointerDown = () => {
      lastClick.current = performance.now()
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [containerRef])

  return { box, win, lastMove, lastClick }
}

function Logo3D({
  logoTexture,
  logoDims,
  pointer,
}: {
  logoTexture: THREE.Texture
  logoDims: { width: number; height: number }
  pointer: PointerState
}) {
  const logoRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    const logo = logoRef.current
    if (!logo) return
    const dt = Math.min(delta, 0.05)
    const damp = THREE.MathUtils.damp
    const t = state.clock.elapsedTime
    const p = pointer.win.current

    const targetX = p.x * 0.4 + Math.sin(t * 0.3) * 0.05
    const targetY = -p.y * 0.28 + Math.cos(t * 0.24) * 0.04

    logo.rotation.y = damp(logo.rotation.y, targetX, 2.6, dt)
    logo.rotation.x = damp(logo.rotation.x, targetY, 2.6, dt)
    logo.position.x = damp(logo.position.x, p.x * 0.35, 2, dt)
    logo.position.y = damp(logo.position.y, -p.y * 0.22 + Math.sin(t * 1.1) * 0.06, 2, dt)
  })

  return (
    <mesh ref={logoRef} position={[0, 0, 0]} renderOrder={3}>
      <planeGeometry args={[logoDims.width, logoDims.height]} />
      <meshBasicMaterial map={logoTexture} transparent toneMapped={false} />
    </mesh>
  )
}

interface MagnetFieldProps {
  count: number
  pointer: PointerState
}

function MagnetField({ count, pointer }: MagnetFieldProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const ndc = useMemo(() => new THREE.Vector2(), [])
  const cursorWorld = useMemo(() => new THREE.Vector3(), [])
  const spawnTarget = useMemo(() => new THREE.Vector3(), [])

  const data = useMemo(() => {
    const base = new Float32Array(count * 3)
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    const kind = new Uint8Array(count)
    const phase = new Float32Array(count)
    const tilt = new Float32Array(count * 2)
    const spin = new Float32Array(count)
    const baseScale = new Float32Array(count)
    const spawnAt = new Float32Array(count)
    const absorbProgress = new Float32Array(count)
    const respawnAt = new Float32Array(count)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const radius = FIELD_RADIUS * Math.cbrt(Math.random())
      const ix = i * 3
      base[ix] = radius * Math.sin(phi) * Math.cos(theta)
      base[ix + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.8
      base[ix + 2] = radius * Math.cos(phi) * 0.5
      pos[ix] = base[ix]
      pos[ix + 1] = base[ix + 1]
      pos[ix + 2] = base[ix + 2]

      kind[i] = Math.floor(Math.random() * STAR_COLORS.length)
      phase[i] = Math.random() * Math.PI * 2
      tilt[i * 2] = (Math.random() - 0.5) * 1.2
      tilt[i * 2 + 1] = (Math.random() - 0.5) * 1.2
      spin[i] = 0.1 + Math.random() * 0.25
      baseScale[i] = 0.04 + Math.random() * 0.1
      spawnAt[i] = Math.random() * 0.6
      respawnAt[i] = -1
    }

    const colorAttr = new THREE.InstancedBufferAttribute(colors, 3)
    for (let i = 0; i < count; i++) {
      const color = new THREE.Color(STAR_COLORS[kind[i]])
      colorAttr.setXYZ(i, color.r, color.g, color.b)
    }
    colorAttr.needsUpdate = true

    return { base, pos, vel, kind, phase, tilt, spin, baseScale, spawnAt, absorbProgress, respawnAt, colorAttr }
  }, [count])

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    for (let i = 0; i < count; i++) {
      dummy.position.set(data.pos[i * 3], data.pos[i * 3 + 1], data.pos[i * 3 + 2])
      dummy.rotation.set(data.tilt[i * 2], 0, data.tilt[i * 2 + 1])
      dummy.scale.setScalar(Math.max(0.0001, data.baseScale[i] * smoothstep(0, 0.5, -data.spawnAt[i])))
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
    mesh.instanceColor = data.colorAttr
  }, [dummy, data, count])

  function writeFrame(state: RootState, t: number, dt: number) {
    const mesh = meshRef.current
    if (!mesh) return

    const now = performance.now()
    const active = now - pointer.lastMove.current < 650 && now - pointer.lastClick.current > 800

    if (active) {
      ndc.set(pointer.box.current.x, pointer.box.current.y)
      raycaster.setFromCamera(ndc, state.camera)
      const dir = raycaster.ray.direction
      const tHit = (0 - state.camera.position.z) / dir.z
      cursorWorld.copy(state.camera.position).addScaledVector(dir, tHit)
    } else {
      cursorWorld.set(0, 0, 0)
    }

    const { base, pos, vel, kind, phase, tilt, spin, baseScale, spawnAt, absorbProgress, respawnAt } = data

    for (let i = 0; i < count; i++) {
      const ix = i * 3
      const px = pos[ix]
      const py = pos[ix + 1]
      const pz = pos[ix + 2]

      if (t < respawnAt[i]) {
        dummy.position.set(0, 0, 0)
        dummy.scale.setScalar(0)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
        continue
      }

      const fadeIn = smoothstep(0, 0.5, t - spawnAt[i])
      let scale = baseScale[i] * fadeIn
      let autoAbsorb = absorbProgress[i]
      let moving = false

      if (active) {
        const dx = cursorWorld.x - px
        const dy = cursorWorld.y - py
        const dz = cursorWorld.z - pz
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

        if (autoAbsorb > 0) {
          autoAbsorb = Math.min(1, autoAbsorb + dt / ABSORB_TIME)
          absorbProgress[i] = autoAbsorb
          scale = baseScale[i] * (1 - autoAbsorb)
          moving = true
        } else if (dist < ABSORB_DIST) {
          autoAbsorb = dt / ABSORB_TIME
          absorbProgress[i] = autoAbsorb
          scale = baseScale[i] * (1 - autoAbsorb)
          moving = true
        } else if (dist < INFLUENCE) {
          const falloff = 1 - dist / INFLUENCE
          const nx = dx / dist
          const ny = dy / dist
          const nz = dz / dist
          const turb = Math.sin(t * 2.4 + phase[i]) * 0.6

          vel[ix] += (nx * STRENGTH * falloff + ny * SWIRL * falloff + turb) * dt
          vel[ix + 1] += (ny * STRENGTH * falloff - nx * SWIRL * falloff * 0.7 + Math.sin(t * 1.8 + phase[i]) * 0.4) * dt
          vel[ix + 2] += (nz * STRENGTH * falloff + turb * 0.4) * dt
          const decay = Math.exp(-VEL_DAMP * dt)
          vel[ix] *= decay
          vel[ix + 1] *= decay
          vel[ix + 2] *= decay

          pos[ix] += vel[ix] * dt
          pos[ix + 1] += vel[ix + 1] * dt
          pos[ix + 2] += vel[ix + 2] * dt
          scale = baseScale[i] * fadeIn * (1 + falloff * 0.6)
          moving = true
        }
      }

      if (!moving) {
        if (absorbProgress[i] !== 0) {
          absorbProgress[i] = 0
        }
        const settle = 1 - Math.exp(-SPRING_K * dt)
        vel[ix] *= Math.exp(-6 * dt)
        vel[ix + 1] *= Math.exp(-6 * dt)
        vel[ix + 2] *= Math.exp(-6 * dt)
        pos[ix] += (base[ix] - pos[ix] + vel[ix] * dt * 0.4) * settle
        pos[ix + 1] += (base[ix + 1] - pos[ix + 1] + vel[ix + 1] * dt * 0.4) * settle
        pos[ix + 2] += (base[ix + 2] - pos[ix + 2] + vel[ix + 2] * dt * 0.4) * settle
      }

      if (autoAbsorb >= 1) {
        const delay = 0.12 + Math.random() * 1.1
        respawnAt[i] = t + delay
        spawnAt[i] = respawnAt[i]
        absorbProgress[i] = 0
        if (active && kind[i] % 2 === 0) {
          const ring = 0.5 + Math.random() * 1.8
          const angle = Math.random() * Math.PI * 2
          spawnTarget.set(
            cursorWorld.x + Math.cos(angle) * ring,
            cursorWorld.y + Math.sin(angle) * ring,
            0,
          )
          base[ix] = spawnTarget.x
          base[ix + 1] = spawnTarget.y
          base[ix + 2] = spawnTarget.z
        } else {
          const theta = Math.random() * Math.PI * 2
          const phi = Math.acos(2 * Math.random() - 1)
          const radius = 1 + Math.cbrt(Math.random()) * (FIELD_RADIUS - 1)
          base[ix] = radius * Math.sin(phi) * Math.cos(theta)
          base[ix + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.8
          base[ix + 2] = radius * Math.cos(phi) * 0.5
        }
        vel[ix] = 0
        vel[ix + 1] = 0
        vel[ix + 2] = 0
        scale = 0
      }

      const speed = Math.sqrt(vel[ix] * vel[ix] + vel[ix + 1] * vel[ix + 1] + vel[ix + 2] * vel[ix + 2])
      dummy.position.set(pos[ix], pos[ix + 1], pos[ix + 2])
      dummy.rotation.set(tilt[i * 2], t * spin[i] + speed * 1.6, tilt[i * 2 + 1])
      dummy.scale.setScalar(Math.max(0.0001, scale * fadeIn))
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }

    mesh.instanceMatrix.needsUpdate = true
  }

  useFrame((state, delta) => {
    writeFrame(state, state.clock.elapsedTime, Math.min(delta, 0.05))
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count] as [never, never, number]} frustumCulled={false}>
      <octahedronGeometry args={[0.06, 0]} />
      <meshBasicMaterial vertexColors transparent opacity={0.95} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </instancedMesh>
  )
}

interface SceneContentProps {
  logoTexture: THREE.Texture
  logoDims: { width: number; height: number }
  magnetCount: number
  pointer: PointerState
}

function SceneContent({ logoTexture, logoDims, magnetCount, pointer }: SceneContentProps) {
  return (
    <group>
      <Logo3D logoTexture={logoTexture} logoDims={logoDims} pointer={pointer} />
      <MagnetField count={magnetCount} pointer={pointer} />
    </group>
  )
}

interface CoreSceneProps {
  frameloop: 'always' | 'never' | 'demand'
}

export default function CoreScene({ frameloop }: CoreSceneProps) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1150px)')

  const magnetCount = isMobile ? 180 : isTablet ? 300 : 460
  const containerRef = useRef<HTMLDivElement>(null)
  const pointer = usePointerState(containerRef)

  const logoTexture = useLoader(THREE.TextureLoader, logoUrl)

  useEffect(() => {
    logoTexture.colorSpace = THREE.SRGBColorSpace
    logoTexture.needsUpdate = true
  }, [logoTexture])

  const logoDims = useMemo(() => {
    const img = logoTexture.image as HTMLImageElement | undefined
    const aspect = img?.width && img?.height ? img.width / img.height : 1
    const height = 2.5
    return { width: height * aspect, height }
  }, [logoTexture])

  return (
    <div ref={containerRef} className="h-full w-full">
      <Canvas
        dpr={[1, 1.6]}
        frameloop={frameloop}
        camera={{ position: [0, 0, 5.6], fov: 42 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          <SceneContent logoTexture={logoTexture} logoDims={logoDims} magnetCount={magnetCount} pointer={pointer} />
        </Suspense>
      </Canvas>
    </div>
  )
}