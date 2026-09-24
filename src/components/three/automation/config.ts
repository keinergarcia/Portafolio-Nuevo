import * as THREE from 'three'
import type { MutableRefObject } from 'react'

export type RouteIcon = 'chat' | 'database' | 'mail' | 'api' | 'zap'

export interface RouteDef {
  id: string
  label: string
  color: string
  icon: RouteIcon
  inputY: number
  inputZ: number
  outputY: number
  outputZ: number
}

export const ROUTES: RouteDef[] = [
  { id: 'whatsapp', label: 'WhatsApp', color: '#22d3ee', icon: 'chat', inputY: -1.25, inputZ: -0.1, outputY: 1.25, outputZ: -0.1 },
  { id: 'database', label: 'Base de datos', color: '#6366f1', icon: 'database', inputY: -0.62, inputZ: -0.05, outputY: 0.62, outputZ: -0.2 },
  { id: 'mail', label: 'Correo', color: '#a78bfa', icon: 'mail', inputY: 0, inputZ: 0.01, outputY: 0, outputZ: 0.08 },
  { id: 'api', label: 'API / CRM', color: '#5eead4', icon: 'api', inputY: 0.62, inputZ: 0.05, outputY: -0.62, outputZ: 0.15 },
  { id: 'response', label: 'Respuesta automática', color: '#e8eef6', icon: 'zap', inputY: 1.25, inputZ: 0.1, outputY: -1.25, outputZ: -0.12 },
] as const

export type FlowTier = 'mobile' | 'tablet' | 'desktop'

export const TIER_CONFIG = {
  mobile: { data: 180, dust: 70, fragments: 24, ghosts: 2, pulsePool: 8, dpr: 1.3 },
  tablet: { data: 330, dust: 120, fragments: 42, ghosts: 3, pulsePool: 10, dpr: 1.4 },
  desktop: { data: 520, dust: 170, fragments: 64, ghosts: 3, pulsePool: 12, dpr: 1.5 },
} as const

export interface FlowPointer {
  box: MutableRefObject<THREE.Vector2>
  win: MutableRefObject<THREE.Vector2>
  lastMove: MutableRefObject<number>
}

export const CAM_Z = 7.6
export const FOV = 50
export const HALF_VIEW = Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * CAM_Z
export const FLOW_SPAN = 5.0
export const IN_X = -4.4
export const DEST_X = 4.4
export const WAVE_INTERVAL = 2.8
export const INFLUENCE_R = 2.15
export const FORCE_K = 5.4
export const SWIRL_K = 3.6
export const RESTORE = 6.5
export const SPINE_SAMPLES = 80

export function smoothstep(edge0: number, edge1: number, value: number) {
  const x = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)))
  return x * x * (3 - 2 * x)
}

export function clamp(x: number, min: number, max: number) {
  return x < min ? min : x > max ? max : x
}

/** Extiende 6 puntos de control a 7 (duplicando los extremos) para que la curva Catmull-Rom pase por p0 y p5. */
export function buildExtControls(
  p: readonly [number, number, number][],
): Float32Array {
  const ext = new Float32Array(7 * 3)
  const write = (idx: number, v: readonly [number, number, number]) => {
    ext[idx * 3] = v[0]
    ext[idx * 3 + 1] = v[1]
    ext[idx * 3 + 2] = v[2]
  }
  write(0, p[0])
  write(1, p[0])
  for (let i = 1; i <= 5; i++) write(i + 1, p[i])
  return ext
}

export function evalCatmullExt(out: THREE.Vector3, ext: Float32Array, offset: number, t: number) {
  const S = 5
  const u = t * S
  let s = Math.floor(u)
  if (s < 0) s = 0
  else if (s > S - 1) s = S - 1
  const v = u - s
  const v2 = v * v
  const v3 = v2 * v
  const a = -0.5 * v3 + v2 - 0.5 * v
  const b = 1.5 * v3 - 2.5 * v2 + 1
  const c = -1.5 * v3 + 2 * v2 + 0.5 * v
  const d = 0.5 * v3 - 0.5 * v2
  const i0 = offset + s * 3
  const i1 = offset + (s + 1) * 3
  const i2 = offset + (s + 2) * 3
  const i3 = offset + (s + 3) * 3
  out.x = ext[i0] * a + ext[i1] * b + ext[i2] * c + ext[i3] * d
  out.y = ext[i0 + 1] * a + ext[i1 + 1] * b + ext[i2 + 1] * c + ext[i3 + 1] * d
  out.z = ext[i0 + 2] * a + ext[i1 + 2] * b + ext[i2 + 2] * c + ext[i3 + 2] * d
}

export function flowProfile(t: number) {
  const boost = 1 + 0.95 * Math.exp(-((t - 0.6) * (t - 0.6)) / 0.042)
  let m = boost
  if (t < 0.1) m *= 0.45 + 0.55 * (t / 0.1)
  else if (t > 0.9) m *= 1 - 0.42 * ((t - 0.9) / 0.1)
  return m
}

let glowCache: THREE.Texture | null = null

export function makeGlowTexture(): THREE.Texture {
  if (glowCache) return glowCache
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.22, 'rgba(255,255,255,0.6)')
    g.addColorStop(0.6, 'rgba(255,255,255,0.16)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 64)
  }
  glowCache = new THREE.CanvasTexture(canvas)
  glowCache.colorSpace = THREE.SRGBColorSpace
  return glowCache
}