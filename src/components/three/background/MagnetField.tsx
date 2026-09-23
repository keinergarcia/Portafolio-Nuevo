/* oxlint-disable react/purity, react/immutability -- rastro del cursor: estado mutable y semillas aleatorias deliberadas para un sistema físico externo al render */
import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { RootState } from '@react-three/fiber'
import * as THREE from 'three'
import { useSpaceState } from './space-context'

const CURSOR_COLORS = ['#22d3ee', '#a78bfa', '#f0abfc', '#f6c453', '#ffffff', '#67e8f9'] as const

function makeAuraTexture() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, 'rgba(160, 220, 255, 0.9)')
    gradient.addColorStop(0.25, 'rgba(140, 180, 255, 0.45)')
    gradient.addColorStop(0.55, 'rgba(167, 139, 250, 0.16)')
    gradient.addColorStop(1, 'rgba(140, 160, 255, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

interface CursorTrailProps {
  count: number
  radius: number
}

export function MagnetField({ count, radius }: CursorTrailProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const auraRef = useRef<THREE.Sprite>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const ndc = useMemo(() => new THREE.Vector2(), [])
  const cursorWorld = useMemo(() => new THREE.Vector3(), [])
  const palette = useMemo(() => CURSOR_COLORS.map((hex) => new THREE.Color(hex)), [])
  const temp = useMemo(() => new THREE.Color(), [])
  const auraTexture = useMemo(() => makeAuraTexture(), [])
  const { pointer, lastMove, lastClick } = useSpaceState()

  const data = useMemo(() => {
    const base = new Float32Array(count * 3)
    const phase = new Float32Array(count)
    const angle = new Float32Array(count)
    const startRadius = new Float32Array(count)
    const lifetime = new Float32Array(count)
    const envelope = new Float32Array(count)
    const scale = new Float32Array(count)
    const colors = new Float32Array(count * 3)

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = radius * Math.cbrt(Math.random())
      const ix = i * 3
      base[ix] = r * Math.sin(phi) * Math.cos(theta) * 1.3
      base[ix + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6
      base[ix + 2] = r * Math.cos(phi) * 0.3

      phase[i] = Math.random()
      angle[i] = Math.random() * Math.PI * 2
      startRadius[i] = 1.1 + Math.random() * 1.9
      lifetime[i] = 0.6 + Math.random() * 0.9
      scale[i] = 0.4 + Math.random() * 0.9
    }

    const colorAttr = new THREE.InstancedBufferAttribute(colors, 3)
    for (let i = 0; i < count; i++) {
      temp.copy(palette[Math.floor(Math.random() * palette.length)])
      colorAttr.setXYZ(i, temp.r, temp.g, temp.b)
    }
    colorAttr.needsUpdate = true

    return { base, phase, angle, startRadius, lifetime, envelope, scale, colors, colorAttr }
  }, [count, radius, palette, temp])

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    for (let i = 0; i < count; i++) {
      dummy.position.set(data.base[i * 3], data.base[i * 3 + 1], data.base[i * 3 + 2])
      dummy.scale.setScalar(0.0001)
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
    const active = now - lastMove.current < 800 && now - lastClick.current > 800

    if (active) {
      ndc.set(pointer.current.x, pointer.current.y)
      raycaster.setFromCamera(ndc, state.camera)
      const dir = raycaster.ray.direction
      const tHit = (0.4 - state.camera.position.z) / dir.z
      cursorWorld.copy(state.camera.position).addScaledVector(dir, tHit)
    }

    const { base, phase, angle, startRadius, lifetime, envelope, scale } = data

    for (let i = 0; i < count; i++) {
      const target = active ? 1 : 0
      envelope[i] += (target - envelope[i]) * Math.min(1, dt * 3.2)
      const env = envelope[i]

      const cycle = t / lifetime[i] + phase[i]
      const progress = cycle - Math.floor(cycle)
      const bell = Math.sin(progress * Math.PI)
      const r = startRadius[i] * (1 - progress)

      const swirl = cursorWorld.x + Math.cos(angle[i] + progress * 4.2) * r
      const swirlY = cursorWorld.y + Math.sin(angle[i] + progress * 4.2) * r
      const swirlZ = cursorWorld.z + Math.sin(progress * Math.PI * 2) * 0.5

      const ix = i * 3
      dummy.position.set(
        base[ix] + (swirl - base[ix]) * env,
        base[ix + 1] + (swirlY - base[ix + 1]) * env,
        base[ix + 2] + (swirlZ - base[ix + 2]) * env,
      )
      dummy.rotation.set(0, t * 0.5 + i, 0)
      dummy.scale.setScalar(Math.max(0.0001, scale[i] * bell * env))
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }

    if (mesh.instanceColor) {
      for (let i = 0; i < count; i++) {
        const slot = Math.floor(t * 3 + phase[i] * palette.length)
        temp.copy(palette[slot % palette.length])
        const bright = 0.7 + 0.3 * Math.sin(t * 6 + phase[i] * 10)
        temp.multiplyScalar(bright)
        data.colorAttr.setXYZ(i, temp.r, temp.g, temp.b)
      }
      mesh.instanceColor.needsUpdate = true
    }

    mesh.instanceMatrix.needsUpdate = true

    const aura = auraRef.current
    if (aura) {
      const env = data.envelope[0]
      aura.position.copy(cursorWorld).setZ(0.2)
      const pulse = 1 + Math.sin(t * 6) * 0.12
      aura.scale.setScalar(1.1 * (0.6 + env * 0.9) * pulse)
      ;(aura.material as THREE.SpriteMaterial).opacity = env * 0.55
    }
  }

  useFrame((state, delta) => {
    writeFrame(state, state.clock.elapsedTime, Math.min(delta, 0.05))
  })

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, count] as [never, never, number]} frustumCulled={false}>
        <octahedronGeometry args={[0.07, 0]} />
        <meshBasicMaterial vertexColors transparent opacity={0.95} depthWrite={false} toneMapped={false} />
      </instancedMesh>
      <sprite ref={auraRef} position={[0, 0, 0.2]} scale={[1.2, 1.2, 1]} renderOrder={1}>
        <spriteMaterial map={auraTexture} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </sprite>
    </group>
  )
}