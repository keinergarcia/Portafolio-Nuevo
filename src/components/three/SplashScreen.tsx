/* oxlint-disable react/purity, react/immutability, react/set-state-in-effect -- intro de splash: el logo real se ensambla con partículas muestreadas de su píxeles; los buffers/meshes 3D se mutan deliberadamente en el loop de frames (sistema físico externo al render) */
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { motion, useReducedMotion } from 'motion/react'
import * as THREE from 'three'
import { SPACE_CONFIG, useSpaceTier } from '@/components/three/background/useSpaceTier'
import { useIntro } from '@/contexts/Intro'
import logoUrl from '@/assets/logo-elchivalez.png'

const SPLASH_MS = 5200
const FADE_MS = 740

/* --- Cronología de la secuencia (segundos) ------------------------------- */
const ATTRACT_START = 0.55
const ATTRACT_END = 1.7
const ASM_START = 1.8
const ASM_WINDOW = 0.95
const PULSE_START = 2.8
const PULSE_END = 3.32
const DISPERSE_START = 3.4
const LOGO_REVEAL_START = 3.02
const LOGO_REVEAL_END = 3.4
const DOLLY_START = 3.2
const DOLLY_END = 4.6
const CLEAN_START = 3.5
const CLEAN_END = 4.1
const SNAP_WINDOW = 0.14

/* --- El logo real, en unidades de mundo ----------------------------------- */
const LOGO_WORLD_H = 4.5

/* --- Utilidades de easing ------------------------------------------------ */
function clamp01(v: number) {
  return Math.min(1, Math.max(0, v))
}
function smoothstep(edge0: number, edge1: number, value: number) {
  const x = clamp01((value - edge0) / (edge1 - edge0))
  return x * x * (3 - 2 * x)
}
function easeOutQuad(x: number) {
  return 1 - (1 - x) * (1 - x)
}
function easeInOutCubic(x: number) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2
}
function easeOutBack(x: number) {
  const c1 = 1.70158
  const c3 = c1 + 1
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2)
}

/* --- Utilidades visuales -------------------------------------------------- */
function makeAuraTexture() {
  const size = 128
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, 'rgba(103, 232, 249, 0.9)')
    gradient.addColorStop(0.28, 'rgba(167, 139, 250, 0.45)')
    gradient.addColorStop(0.6, 'rgba(34, 211, 238, 0.16)')
    gradient.addColorStop(1, 'rgba(120, 140, 210, 0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

const SWARM_VERT = /* glsl */ `
uniform float uTime;
uniform float uPixelScale;
attribute float aSize;
attribute float aSeed;
attribute vec3 aColor;
attribute float aEnergy;
attribute float aFade;
varying vec3 vColor;
varying float vEnergy;
void main() {
  vColor = aColor;
  vEnergy = aEnergy;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float tw = 0.9 + 0.1 * sin(uTime * (1.5 + aSeed) + aSeed * 40.0);
  float s = aSize * (tw * (1.0 + 0.35 * vEnergy) + vEnergy * 1.2);
  gl_PointSize = s * uPixelScale / max(0.1, -mv.z) * aFade;
  gl_Position = projectionMatrix * mv;
}
`
const SWARM_FRAG = /* glsl */ `
uniform float uFade;
varying vec3 vColor;
varying float vEnergy;
void main() {
  vec2 p = gl_PointCoord - 0.5;
  float d = length(p);
  if (d > 0.5) discard;
  vec3 col = vColor * (1.0 + vEnergy * 1.6);
  float a = smoothstep(0.5, 0.12, d);
  gl_FragColor = vec4(col * (1.4 + vEnergy * 1.2) * a, a * uFade);
}
`

const AMBIENT_VERT = /* glsl */ `
uniform float uTime;
uniform float uPixelScale;
attribute vec3 aBase;
attribute vec3 aColor;
attribute float aSize;
attribute float aSeed;
varying vec3 vColor;
varying float vAlpha;
void main() {
  vColor = aColor;
  vec3 p = aBase;
  p.x += sin(uTime * 0.05 + aSeed * 6.283) * 0.4;
  p.y += cos(uTime * 0.042 + aSeed * 2.5) * 0.3;
  p.z += sin(uTime * 0.031 + aSeed * 4.1) * 0.8;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = aSize * uPixelScale / max(0.1, -mv.z);
  float tw = 0.5 + 0.5 * sin(uTime * (0.35 + aSeed) + aSeed * 30.0);
  vAlpha = tw;
  gl_Position = projectionMatrix * mv;
}
`
const AMBIENT_FRAG = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec2 p = gl_PointCoord - 0.5;
  float d = length(p);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.05, d);
  gl_FragColor = vec4(vColor * vAlpha * 0.75, a * 0.4);
}
`

/* --- Muestreo de la silueta real del logo --------------------------------- */
interface LogoSampleData {
  opaque: Int32Array
  symbol: Int32Array
  text: Int32Array
  count: number
  w: number
  h: number
  minX: number
  maxX: number
  minY: number
  maxY: number
  splitY: number
  centerX: number
  centerY: number
  scaleToWorld: number
  textX0: number
  textX1: number
  textY0: number
  textY1: number
}

function sampleLogo(img: HTMLImageElement): LogoSampleData {
  const maxW = 512
  const sc = Math.min(1, maxW / (img.width || 1))
  const w = Math.max(2, Math.round((img.width || 1) * sc))
  const h = Math.max(2, Math.round((img.height || 1) * sc))
  const cv = document.createElement('canvas')
  cv.width = w
  cv.height = h
  const ctx = cv.getContext('2d', { willReadFrequently: true }) ?? cv.getContext('2d')
  let data: Uint8ClampedArray | null = null
  const opaque: number[] = []
  if (ctx) {
    ctx.drawImage(img, 0, 0, w, h)
    data = ctx.getImageData(0, 0, w, h).data
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (data[(y * w + x) * 4 + 3] > 24) opaque.push(y * w + x)
      }
    }
  }

  if (opaque.length === 0) {
    const cx = (w - 1) / 2
    const cy = (h - 1) / 2
    const r = Math.max(1, Math.min(w, h) * 0.18)
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const dx = (x - cx) / r
        const dy = (y - cy) / r
        if (dx * dx + dy * dy <= 1) opaque.push(y * w + x)
      }
    }
  }

  const rowCounts = new Int32Array(h)
  let minX = w
  let minY = h
  let maxX = 0
  let maxY = 0
  for (let i = 0; i < opaque.length; i++) {
    const idx = opaque[i]
    const y = Math.floor(idx / w)
    const x = idx % w
    rowCounts[y]++
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }

  const bh = Math.max(1, maxY - minY)
  const top = minY + Math.floor(bh * 0.45)
  const bot = minY + Math.floor(bh * 0.9)
  let bestRun = 0
  let bestStart = -1
  let run = 0
  let runStart = 0
  for (let y = top; y <= bot; y++) {
    if (rowCounts[y] === 0) {
      if (run === 0) runStart = y
      run++
    } else {
      if (run > bestRun) {
        bestRun = run
        bestStart = runStart
      }
      run = 0
    }
  }
  if (run > bestRun) {
    bestRun = run
    bestStart = runStart
  }
  const splitY =
    bestRun > 0 && bestStart >= 0 && bestStart + bestRun / 2 > minY && bestStart + bestRun / 2 < maxY
      ? bestStart + bestRun / 2
      : minY + bh * 0.66

  let tX0 = w
  let tX1 = 0
  let tY0 = h
  let tY1 = 0
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (data && y > splitY && data[(y * w + x) * 4 + 3] > 24) {
        if (x < tX0) tX0 = x
        if (x > tX1) tX1 = x
        if (y < tY0) tY0 = y
        if (y > tY1) tY1 = y
      }
    }
  }
  if (tX1 < tX0) {
    const third = bh / 3
    tX0 = minX
    tX1 = maxX
    tY0 = maxY - third
    tY1 = maxY
  }

  const scaleToWorld = LOGO_WORLD_H / bh
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  const wx = (v: number) => (v - centerX) * scaleToWorld
  const wy = (v: number) => -(v - centerY) * scaleToWorld

  const symbol: number[] = []
  const text: number[] = []
  for (let i = 0; i < opaque.length; i++) {
    const px = opaque[i]
    if (Math.floor(px / w) >= splitY) text.push(px)
    else symbol.push(px)
  }

  return {
    opaque: Int32Array.from(opaque),
    symbol: Int32Array.from(symbol),
    text: Int32Array.from(text),
    count: opaque.length,
    w,
    h,
    minX,
    maxX,
    minY,
    maxY,
    splitY,
    centerX,
    centerY,
    scaleToWorld,
    textX0: wx(tX0),
    textX1: wx(tX1),
    textY0: wy(tY0),
    textY1: wy(tY1),
  }
}

/* --- Construcción del enjambre de partículas del logo --------------------- */
const FRAC_ORBIT = 0.1
const CCYAN = new THREE.Color('#22d3ee')
const CWHITE = new THREE.Color('#ffffff')
const CVIOL = new THREE.Color('#a78bfa')
const CBLUE = new THREE.Color('#7dd3fc')

interface SwarmData {
  count: number
  base: Float32Array
  to: Float32Array
  from: Float32Array
  pos: Float32Array
  vel: Float32Array
  col: Float32Array
  sz: Float32Array
  seed: Float32Array
  kind: Uint8Array
  delay: Float32Array
  arrive: Float32Array
  revealX: Float32Array
  amp: Float32Array
  drift: Float32Array
  phase: Float32Array
  orbR: Float32Array
  orbRate: Float32Array
  orbPhase: Float32Array
  energy: Float32Array
  fade: Float32Array
  started: Uint8Array
}

function buildSwarm(count: number, samples: LogoSampleData): SwarmData {
  const base = new Float32Array(count * 3)
  const to = new Float32Array(count * 3)
  const from = new Float32Array(count * 3)
  const pos = new Float32Array(count * 3)
  const vel = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)
  const sz = new Float32Array(count)
  const seed = new Float32Array(count)
  const kind = new Uint8Array(count)
  const delay = new Float32Array(count)
  const arrive = new Float32Array(count)
  const revealX = new Float32Array(count)
  const amp = new Float32Array(count)
  const drift = new Float32Array(count)
  const phase = new Float32Array(count)
  const orbR = new Float32Array(count)
  const orbRate = new Float32Array(count)
  const orbPhase = new Float32Array(count)
  const energy = new Float32Array(count)
  const fade = new Float32Array(count)
  const started = new Uint8Array(count)
  const tmp = new THREE.Color()

  fade.fill(1)

  const { scaleToWorld, centerX, centerY, minY, maxY, splitY } = samples
  const bh = Math.max(1, maxY - minY)

  for (let i = 0; i < count; i++) {
    const ix = i * 3
    seed[i] = Math.random()
    phase[i] = Math.random() * Math.PI * 2
    drift[i] = 0.18 + Math.random() * 0.45
    amp[i] = 0.02 + Math.random() * 0.055

    /* ---- Posición dispersa inicial (espacio 3D profundo) ---- */
    if (i % 9 === 0) {
      base[ix] = (Math.random() - 0.5) * 13
      base[ix + 1] = (Math.random() - 0.5) * 7.5
      base[ix + 2] = 3.1 + Math.random() * 3.4
    } else {
      const R = 2.6 + 9.2 * Math.cbrt(Math.random())
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      base[ix] = R * Math.sin(phi) * Math.cos(theta)
      base[ix + 1] = R * Math.sin(phi) * Math.sin(theta) * 0.74
      base[ix + 2] = R * Math.cos(phi) * 0.74
    }
    pos[ix] = base[ix]
    pos[ix + 1] = base[ix + 1]
    pos[ix + 2] = base[ix + 2]

    if (Math.random() < FRAC_ORBIT) {
      kind[i] = 3
      orbR[i] = 0.95 + Math.random() * 0.95
      orbRate[i] = 0.22 + Math.random() * 0.5
      orbPhase[i] = Math.random() * Math.PI * 2
      tmp.copy(CBLUE).multiplyScalar(0.55 + Math.random() * 0.3)
      col[ix] = tmp.r
      col[ix + 1] = tmp.g
      col[ix + 2] = tmp.b
      sz[i] = 0.015 + Math.random() * 0.013
      continue
    }

    /* ---- Objetivo muestreado de la silueta real del logo ---- */
    const wantText = samples.text.length > 0 && Math.random() < 0.34
    const pool = wantText ? samples.text : samples.symbol
    const idx = Math.floor(Math.random() * pool.length)
    const px = (pool[idx] % samples.w) + (Math.random() - 0.5) * (wantText ? 0.6 : 0.9)
    const py = Math.floor(pool[idx] / samples.w) + (Math.random() - 0.5) * 0.65
    to[ix] = (px - centerX) * scaleToWorld
    to[ix + 1] = -(py - centerY) * scaleToWorld
    to[ix + 2] = (Math.random() - 0.5) * 0.09

    const isText = wantText || py >= splitY
    if (isText) {
      kind[i] = 1
      revealX[i] = clamp01((to[ix] - samples.textX0) / (samples.textX1 - samples.textX0 || 1))
      const u = clamp01((py - minY) / bh)
      if (u < 0.5) tmp.copy(CCYAN).lerp(CWHITE, u * 2)
      else tmp.copy(CWHITE).lerp(CVIOL, (u - 0.5) * 2)
      tmp.copy(tmp).multiplyScalar(0.92 + Math.random() * 0.22)
      col[ix] = tmp.r
      col[ix + 1] = tmp.g
      col[ix + 2] = tmp.b
      sz[i] = 0.015 + Math.random() * 0.015
    } else {
      kind[i] = 0
      const rowU = (py - minY) / bh
      const quant = Math.floor(Math.random() * 5) / 5
      delay[i] = Math.min(0.9, 0.06 + rowU * 0.55 + quant * 0.07)
      const u = clamp01((py - minY) / bh)
      if (u < 0.5) tmp.copy(CCYAN).lerp(CWHITE, u * 2)
      else tmp.copy(CWHITE).lerp(CVIOL, (u - 0.5) * 2)
      tmp.copy(tmp).multiplyScalar(0.9 + Math.random() * 0.24)
      col[ix] = tmp.r
      col[ix + 1] = tmp.g
      col[ix + 2] = tmp.b
      sz[i] = 0.017 + Math.random() * 0.02
    }
  }

  return { count, base, to, from, pos, vel, col, sz, seed, kind, delay, arrive, revealX, amp, drift, phase, orbR, orbRate, orbPhase, energy, fade, started }
}

/* --- El enjambre que forma el logo --------------------------------------- */
function LogoParticles({ samples, count, reduce }: { samples: LogoSampleData; count: number; reduce: boolean }) {
  const ptsRef = useRef<THREE.Points>(null)
  const data = useMemo(() => buildSwarm(count, samples), [count, samples])
  const snapReady = useRef(false)
  const wasPulse = useRef(false)

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('position', new THREE.BufferAttribute(data.pos, 3))
    geom.setAttribute('aColor', new THREE.BufferAttribute(data.col, 3))
    geom.setAttribute('aSize', new THREE.BufferAttribute(data.sz, 1))
    geom.setAttribute('aSeed', new THREE.BufferAttribute(data.seed, 1))
    geom.setAttribute('aEnergy', new THREE.BufferAttribute(data.energy, 1))
    geom.setAttribute('aFade', new THREE.BufferAttribute(data.fade, 1))
    return geom
  }, [data])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: SWARM_VERT,
        fragmentShader: SWARM_FRAG,
        uniforms: { uTime: { value: 0 }, uPixelScale: { value: 1 }, uFade: { value: 1 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  )

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime
    const points = ptsRef.current
    if (!points) return
    material.uniforms.uTime.value = t
    material.uniforms.uPixelScale.value = state.size.height * 0.5 * state.gl.getPixelRatio()
    material.uniforms.uFade.value = 1 - smoothstep(CLEAN_START, CLEAN_END, t)

    const geom = points.geometry as THREE.BufferGeometry
    const posAttr = geom.getAttribute('position') as THREE.BufferAttribute
    const enAttr = geom.getAttribute('aEnergy') as THREE.BufferAttribute
    const fadeAttr = geom.getAttribute('aFade') as THREE.BufferAttribute
    const enArr = enAttr.array as Float32Array
    const fadeArr = fadeAttr.array as Float32Array

    const d = data
    const { base, to, from, vel } = d

    if (!snapReady.current && t >= ASM_START) {
      for (let i = 0; i < d.count; i++) {
        const ix = i * 3
        from[ix] = d.pos[ix]
        from[ix + 1] = d.pos[ix + 1]
        from[ix + 2] = d.pos[ix + 2]
        d.arrive[i] =
          d.kind[i] === 1
            ? LOGO_REVEAL_START + d.revealX[i] * (LOGO_REVEAL_END - LOGO_REVEAL_START)
            : ASM_START + d.delay[i] * ASM_WINDOW
        d.started[i] = 0
      }
      snapReady.current = true
    }

    const idle = t < ATTRACT_START
    const asm = t >= ASM_START && t < PULSE_START
    const pulse = t >= PULSE_START && t < PULSE_END
    const after = t >= PULSE_END
    const attractG = smoothstep(ATTRACT_START, ATTRACT_END, t)
    const pulsePr = pulse ? smoothstep(PULSE_START, PULSE_END, t) : after ? 1 : 0
    const ringR = pulsePr * 2.7
    const disperse = smoothstep(DISPERSE_START, SPLASH_MS / 1000 + 0.4, t)
    const textSweep = smoothstep(LOGO_REVEAL_START, LOGO_REVEAL_END, t)

    for (let i = 0; i < d.count; i++) {
      const ix = i * 3

      if (d.kind[i] === 3) {
        const ph = t * d.orbRate[i] + d.orbPhase[i]
        let rr = d.orbR[i]
        let fadeMult = 1
        if (pulse || after) {
          rr *= 1 + disperse * 1.9
          fadeMult = 1 - smoothstep(DISPERSE_START, SPLASH_MS / 1000 + 0.5, t)
        }
        d.pos[ix] = Math.cos(ph) * rr
        d.pos[ix + 1] = Math.sin(ph) * rr * 0.86
        d.pos[ix + 2] = Math.sin(ph * 0.7 + 1.3) * 0.55
        fadeArr[i] = Math.max(0, fadeMult)
        fadeAttr.needsUpdate = true
        enArr[i] = 0
        enAttr.needsUpdate = true
        continue
      }

      if (idle) {
        d.pos[ix] = base[ix] + Math.sin(t * d.drift[i] + d.phase[i]) * d.amp[i]
        d.pos[ix + 1] = base[ix + 1] + Math.sin(t * d.drift[i] * 1.3 + d.phase[i] + 1.7) * d.amp[i]
        d.pos[ix + 2] = base[ix + 2] + Math.sin(t * d.drift[i] * 0.9 + d.phase[i] + 4.2) * d.amp[i]
        continue
      }

      /* Texto del logo: espera su turno y se revela de izquierda a derecha */
      if (d.kind[i] === 1 && t >= ASM_START) {
        const ar = d.arrive[i]
        if (d.started[i] === 0 && t >= ar) {
          from[ix] = d.pos[ix]
          from[ix + 1] = d.pos[ix + 1]
          from[ix + 2] = d.pos[ix + 2]
          d.started[i] = 1
        }
        if (d.started[i] >= 1) {
          const local = clamp01((t - ar) / SNAP_WINDOW)
          const e = easeInOutCubic(local)
          const cmx = to[ix] - from[ix]
          const cmy = to[ix + 1] - from[ix + 1]
          const cmz = to[ix + 2] - from[ix + 2]
          d.pos[ix] = from[ix] + cmx * e
          d.pos[ix + 1] = from[ix + 1] + cmy * e + Math.sin(local * Math.PI) * 0.05
          d.pos[ix + 2] = from[ix + 2] + cmz * e
          if (local >= 1) d.started[i] = 2
          if (reduce) {
            enArr[i] = 0
          } else {
            const dd = Math.hypot(to[ix], to[ix + 1])
            const ringEn = pulse ? Math.exp(-((dd - ringR) * (dd - ringR)) / (2 * 0.16 * 0.16)) * 1.35 : 0
            const sweepEn =
              t >= LOGO_REVEAL_START && t <= LOGO_REVEAL_END + 0.15
                ? (1 - clamp01(Math.abs(textSweep - d.revealX[i]) / 0.14)) * 0.9
                : 0
            enArr[i] = Math.max(ringEn, sweepEn) + 0.08 + 0.08 * Math.sin(t * 3.1 + d.phase[i] * 2.4)
          }
        } else {
          const dx = -d.pos[ix]
          const dy = -d.pos[ix + 1]
          const dz = -d.pos[ix + 2] * 0.3
          const dist = Math.hypot(dx, dy, dz) || 1e-6
          const nx = dx / dist
          const ny = dy / dist
          const turX = Math.sin(t * 2.1 + d.phase[i]) * 0.08
          vel[ix] += (nx * 2.2 - ny * 1.3 + turX) * dt
          vel[ix + 1] += (ny * 2.2 + nx * 1.3 + turX * 0.6) * dt
          vel[ix + 2] += dz * 0.5 * dt
          const decay = Math.exp(-2.3 * dt)
          vel[ix] *= decay
          vel[ix + 1] *= decay
          vel[ix + 2] *= decay
          d.pos[ix] += vel[ix] * dt
          d.pos[ix + 1] += vel[ix + 1] * dt
          d.pos[ix + 2] += vel[ix + 2] * dt
          enArr[i] = 0
        }
        continue
      }

      if (t < ASM_START) {
        if (reduce) {
          const e = easeInOutCubic(attractG)
          d.pos[ix] = base[ix] + (to[ix] - base[ix]) * e
          d.pos[ix + 1] = base[ix + 1] + (to[ix + 1] - base[ix + 1]) * e
          d.pos[ix + 2] = base[ix + 2] + (to[ix + 2] - base[ix + 2]) * e
        } else {
          const dx = -d.pos[ix]
          const dy = -d.pos[ix + 1]
          const dz = -d.pos[ix + 2] * 0.32
          const dist = Math.hypot(dx, dy, dz) || 1e-6
          const strength = 1.5 + 7.4 * easeOutQuad(attractG)
          const nx = dx / dist
          const ny = dy / dist
          const nz = dz / dist
          const turX = Math.sin(t * 2.1 + d.phase[i]) * 0.12
          const turZ = Math.sin(t * 1.6 + d.phase[i] * 1.3) * 0.1
          vel[ix] += (nx * strength - ny * 2.4 * attractG + turX) * dt
          vel[ix + 1] += (ny * strength + nx * 2.4 * attractG + turX * 0.6) * dt
          vel[ix + 2] += (nz * strength * 0.42 + turZ) * dt
          const decay = Math.exp(-2.0 * dt)
          vel[ix] *= decay
          vel[ix + 1] *= decay
          vel[ix + 2] *= decay
          const vLen = Math.hypot(vel[ix], vel[ix + 1], vel[ix + 2])
          if (vLen > 12) {
            const k = 12 / vLen
            vel[ix] *= k
            vel[ix + 1] *= k
            vel[ix + 2] *= k
          }
          d.pos[ix] += vel[ix] * dt
          d.pos[ix + 1] += vel[ix + 1] * dt
          d.pos[ix + 2] += vel[ix + 2] * dt
        }
        continue
      }

      if (asm) {
        const ar = d.arrive[i]
        if (d.started[i] === 0) {
          if (t >= ar) {
            from[ix] = d.pos[ix]
            from[ix + 1] = d.pos[ix + 1]
            from[ix + 2] = d.pos[ix + 2]
            d.started[i] = 1
          } else {
            const dx = -d.pos[ix]
            const dy = -d.pos[ix + 1]
            const dz = -d.pos[ix + 2] * 0.3
            const dist = Math.hypot(dx, dy, dz) || 1e-6
            const nx = dx / dist
            const ny = dy / dist
            const turX = Math.sin(t * 2.1 + d.phase[i]) * 0.08
            vel[ix] += (nx * 2.4 - ny * 1.5 + turX) * dt
            vel[ix + 1] += (ny * 2.4 + nx * 1.5 + turX * 0.6) * dt
            vel[ix + 2] += dz * 0.5 * dt
            const decay = Math.exp(-2.3 * dt)
            vel[ix] *= decay
            vel[ix + 1] *= decay
            vel[ix + 2] *= decay
            d.pos[ix] += vel[ix] * dt
            d.pos[ix + 1] += vel[ix + 1] * dt
            d.pos[ix + 2] += vel[ix + 2] * dt
            continue
          }
        }

        const local = clamp01((t - ar) / SNAP_WINDOW)
        const e = reduce ? easeInOutCubic(local) : easeOutBack(local)
        const cmx = to[ix] - from[ix]
        const cmy = to[ix + 1] - from[ix + 1]
        const cmz = to[ix + 2] - from[ix + 2]
        const len = Math.hypot(cmx, cmy) || 1e-6
        const curve = Math.sin(local * Math.PI) * (0.14 + Math.min(0.34, len * 0.05))
        const pxv = -cmy / len
        const pyv = cmx / len
        d.pos[ix] = from[ix] + cmx * e + pxv * curve
        d.pos[ix + 1] = from[ix + 1] + cmy * e + pyv * curve
        d.pos[ix + 2] =
          from[ix + 2] + cmz * e + Math.sin(local * Math.PI * 1.4 + d.phase[i]) * 0.09 * Math.sin(local * Math.PI)

        if (local >= 1) d.started[i] = 2
        if (reduce) {
          enArr[i] = 0
        } else if (d.started[i] === 2) {
          enArr[i] = Math.max(0, 0.7 - (t - (ar + SNAP_WINDOW)) * 2.2)
        } else {
          enArr[i] = 0
        }
        continue
      }

      /* Después del ensamblaje: estable con micro-vida (y pulso de energía) */
      d.pos[ix] = to[ix] + Math.sin(t * 2.6 + d.phase[i]) * 0.0055
      d.pos[ix + 1] = to[ix + 1] + Math.cos(t * 2.2 + d.phase[i] * 1.3) * 0.0055
      d.pos[ix + 2] = to[ix + 2] + Math.sin(t * 2.0 + d.phase[i] + 1.0) * 0.007

      if (reduce) {
        enArr[i] = 0
      } else if (pulse) {
        const dd = Math.hypot(to[ix], to[ix + 1])
        const diff = dd - ringR
        enArr[i] = Math.exp(-(diff * diff) / (2 * 0.15 * 0.15)) * 1.35
      } else {
        enArr[i] = 0.08 + 0.08 * Math.sin(t * 3.1 + d.phase[i] * 2.4)
      }
      fadeArr[i] = 1
      fadeAttr.needsUpdate = true
    }

    posAttr.needsUpdate = true
    enAttr.needsUpdate = true
    wasPulse.current = pulse

    if (!reduce) {
      const grown = smoothstep(ASM_START, ASM_START + 0.6, t)
      points.rotation.y = Math.sin(t * 0.22) * 0.045 * grown
      points.rotation.z = Math.sin(t * 0.16 + 0.6) * 0.02 * grown
    }
  })

  return (
    <points ref={ptsRef} frustumCulled={false} renderOrder={6}>
      <primitive object={geometry} attach="geometry" />
      <primitive object={material} attach="material" />
    </points>
  )
}

/* --- Cielo profundo (partículas lejanas y de primer plano) --------------- */
function AmbientSky({ count }: { count: number }) {
  const geometry = useMemo(() => {
    const base = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const sz = new Float32Array(count)
    const seed = new Float32Array(count)
    const tmp = new THREE.Color()
    const dim = new THREE.Color('#31415c')
    const bright = new THREE.Color('#7fb2e8')
    for (let i = 0; i < count; i++) {
      const ix = i * 3
      const R = 3.5 + 9 * Math.cbrt(Math.random())
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      base[ix] = R * Math.sin(phi) * Math.cos(theta)
      base[ix + 1] = R * Math.sin(phi) * Math.sin(theta) * 0.8
      base[ix + 2] = R * Math.cos(phi) * 0.9
      tmp.copy(Math.random() < 0.5 ? dim : bright)
      tmp.multiplyScalar(0.5 + Math.random() * 0.4)
      col[ix] = tmp.r
      col[ix + 1] = tmp.g
      col[ix + 2] = tmp.b
      sz[i] = 0.02 + clamp01((base[ix + 2] + 8) / 14) * 0.055 + (i % 11 === 0 ? 0.02 : 0)
      seed[i] = Math.random()
    }
    const geom = new THREE.BufferGeometry()
    geom.setAttribute('aBase', new THREE.BufferAttribute(base, 3))
    geom.setAttribute('aColor', new THREE.BufferAttribute(col, 3))
    geom.setAttribute('aSize', new THREE.BufferAttribute(sz, 1))
    geom.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1))
    return geom
  }, [count])

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: AMBIENT_VERT,
        fragmentShader: AMBIENT_FRAG,
        uniforms: { uTime: { value: 0 }, uPixelScale: { value: 1 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  )

  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime
    material.uniforms.uPixelScale.value = state.size.height * 0.5 * state.gl.getPixelRatio()
  })

  return (
    <points frustumCulled={false} renderOrder={1}>
      <primitive object={geometry} attach="geometry" />
      <primitive object={material} attach="material" />
    </points>
  )
}

/* --- Fragmentos geométricos lejanos -------------------------------------- */
function DeepFragments({ count, reduce }: { count: number; reduce: boolean }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const cfg = useMemo(() => {
    const base = new Float32Array(count * 3)
    const spin = new Float32Array(count * 3)
    const scale = new Float32Array(count)
    const phase = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const ix = i * 3
      base[ix] = (Math.random() - 0.5) * 12
      base[ix + 1] = (Math.random() - 0.5) * 7
      base[ix + 2] = -2.4 - Math.random() * 3.2
      spin[ix] = (Math.random() - 0.5) * 0.35
      spin[ix + 1] = (Math.random() - 0.5) * 0.35
      spin[ix + 2] = (Math.random() - 0.5) * 0.3
      scale[i] = 0.07 + Math.random() * 0.14
      phase[i] = Math.random() * Math.PI * 2
    }
    return { base, spin, scale, phase }
  }, [count])

  useFrame((state) => {
    const mesh = meshRef.current
    if (!mesh) return
    const t = state.clock.elapsedTime
    const { base, spin, scale, phase } = cfg
    for (let i = 0; i < count; i++) {
      const ix = i * 3
      dummy.position.set(
        base[ix] + Math.sin(t * 0.2 + phase[i]) * 0.3,
        base[ix + 1] + Math.cos(t * 0.16 + phase[i]) * 0.25,
        base[ix + 2],
      )
      dummy.rotation.x = t * spin[ix] + phase[i]
      dummy.rotation.y = t * spin[ix + 1] * 1.6 + phase[i]
      dummy.rotation.z = t * spin[ix + 2] + phase[i]
      const s = scale[i] * (reduce ? 0.8 : 0.55 + 0.45 * Math.sin(t * 0.5 + phase[i]))
      dummy.scale.setScalar(Math.max(0.001, s))
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, count] as [never, never, number]}
      frustumCulled={false}
      renderOrder={2}
    >
      <octahedronGeometry args={[0.1, 0]} />
      <meshBasicMaterial color="#6c84bd" transparent opacity={reduce ? 0.25 : 0.4} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
    </instancedMesh>
  )
}

/* --- Bokeh desenfocado en primer plano ----------------------------------- */
function ForegroundHaze({ reduce }: { reduce: boolean }) {
  const group = useRef<THREE.Group>(null)
  const sprites = useRef<(THREE.Sprite | null)[]>([])
  const positions = useMemo(
    () =>
      Array.from({ length: 4 }, () => ({
        x: (Math.random() - 0.5) * 13,
        y: (Math.random() - 0.5) * 7.5,
        z: 3.4 + Math.random() * 2.4,
        s: 2.6 + Math.random() * 2.4,
      })),
    [],
  )
  const texture = useMemo(
    () => Array.from({ length: positions.length }, () => makeAuraTexture()),
    [positions],
  )

  useFrame((state) => {
    const g = group.current
    if (!g) return
    const t = state.clock.elapsedTime
    g.rotation.z = Math.sin(t * 0.05) * 0.06
    const clean = 1 - smoothstep(CLEAN_START, CLEAN_END, t)
    positions.forEach((_, i) => {
      const sprite = sprites.current[i]
      if (!sprite) return
      const mat = sprite.material as THREE.SpriteMaterial
      mat.opacity = (reduce ? 0.035 : 0.06) * (0.6 + 0.4 * Math.sin(t * 0.4 + i * 1.7)) * clean
    })
  })

  return (
    <group ref={group}>
      {positions.map((p, i) => (
        <sprite
          key={i}
          ref={(el) => {
            sprites.current[i] = el
          }}
          position={[p.x, p.y, p.z]}
          scale={[p.s, p.s, 1]}
          renderOrder={3}
        >
          <spriteMaterial
            map={texture[i]}
            transparent
            opacity={0.06}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </sprite>
      ))}
    </group>
  )
}

/* --- Campo invisible del centro ------------------------------------------ */
function FieldGlow({ reduce }: { reduce: boolean }) {
  const spriteRef = useRef<THREE.Sprite>(null)
  const texture = useMemo(() => makeAuraTexture(), [])

  useFrame((state) => {
    const s = spriteRef.current
    if (!s) return
    const t = state.clock.elapsedTime
    const mat = s.material as THREE.SpriteMaterial
    if (reduce) {
      mat.opacity = 0
      return
    }
    const grow = smoothstep(ATTRACT_START - 0.2, ATTRACT_END, t)
    const fade = 1 - smoothstep(ATTRACT_END, ATTRACT_END + 0.5, t)
    mat.opacity = grow * fade * 0.22
    s.scale.setScalar(0.6 + grow * (5.6 + Math.sin(t * 2) * 0.6))
  })

  return (
    <sprite ref={spriteRef} scale={[1, 1, 1]} renderOrder={2}>
      <spriteMaterial map={texture} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
    </sprite>
  )
}

/* --- Pulso de energía (anillo fino en el plano del logo) ------------------ */
function PulseRing({
  reduce,
  delay,
  color,
  width,
  maxScale,
  maxOpacity,
  z = 0.04,
}: {
  reduce: boolean
  delay: number
  color: string
  width: number
  maxScale: number
  maxOpacity: number
  z?: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (reduce) return
    const m = meshRef.current
    if (!m) return
    const t = state.clock.elapsedTime
    const pr = smoothstep(PULSE_START + delay, PULSE_END + delay, t)
    const mat = m.material as THREE.MeshBasicMaterial
    m.visible = pr > 0
    if (pr <= 0) return
    m.scale.setScalar(0.25 + pr * (maxScale - 0.25))
    mat.opacity = (1 - pr) * maxOpacity
    m.rotation.x = Math.sin(t * 1.2) * 0.05
    m.rotation.y = Math.cos(t * 0.9) * 0.05
  })

  if (reduce) return null

  return (
    <mesh ref={meshRef} position={[0, 0, z]} renderOrder={5} visible={false}>
      <ringGeometry args={[1 - width, 1]} />
      <meshBasicMaterial color={color} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

/* --- Línea de luz que revela el texto del logo ---------------------------- */
function TextRevealLine({ samples, reduce }: { samples: LogoSampleData; reduce: boolean }) {
  const lineRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const x0 = samples.textX0
  const x1 = samples.textX1
  const spanX = Math.max(0.05, x1 - x0)
  const y0 = samples.textY0
  const y1 = samples.textY1
  const height = Math.max(0.06, y1 - y0 + 0.16)
  const lineWidth = 0.07
  const glowWidth = 0.32
  const cy = (y0 + y1) / 2

  useFrame((state) => {
    if (reduce) return
    const line = lineRef.current
    const glow = glowRef.current
    if (!line || !glow) return
    const t = state.clock.elapsedTime
    const u = smoothstep(LOGO_REVEAL_START, LOGO_REVEAL_END, t)
    const lm = line.material as THREE.MeshBasicMaterial
    const gm = glow.material as THREE.MeshBasicMaterial
    line.visible = glow.visible = u > 0 && u < 1
    if (!line.visible) return
    const cx = x0 + spanX * u
    line.position.x = cx
    line.position.y = cy
    glow.position.x = cx
    glow.position.y = cy
    const strength = Math.sin(u * Math.PI)
    lm.opacity = 0.8 * strength + 0.15
    gm.opacity = 0.16 * strength
  })

  return (
    <group>
      <mesh ref={lineRef} position={[x0, cy, 0.05]} visible={false} renderOrder={8}>
        <planeGeometry args={[lineWidth, height]} />
        <meshBasicMaterial color="#e8fdff" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
      <mesh ref={glowRef} position={[x0, cy, 0.04]} visible={false} renderOrder={7}>
        <planeGeometry args={[glowWidth, height]} />
        <meshBasicMaterial color="#7de8fb" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  )
}

/* --- El logo real, nítido, anclado a las coordenadas de las partículas --- */
function LogoTexture({ samples, reduce }: { samples: LogoSampleData; reduce: boolean }) {
  const tex = useLoader(THREE.TextureLoader, logoUrl)
  const matRef = useRef<THREE.MeshBasicMaterial>(null)

  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace
    tex.needsUpdate = true
  }, [tex])

  const sc = samples.scaleToWorld
  const planeW = samples.w * sc
  const planeH = samples.h * sc
  const planeX = (samples.w / 2 - samples.centerX) * sc
  const planeY = (samples.centerY - samples.h / 2) * sc

  useFrame((state) => {
    const m = matRef.current
    if (!m) return
    if (reduce) {
      m.opacity = 1
    } else {
      const t = state.clock.elapsedTime
      m.opacity = smoothstep(ASM_START + ASM_WINDOW - 0.5, ASM_START + ASM_WINDOW + 0.35, t) * 0.98
    }
  })

  return (
    <mesh position={[planeX, planeY, -0.03]} renderOrder={3} frustumCulled={false}>
      <planeGeometry args={[planeW, planeH]} />
      <meshBasicMaterial ref={matRef} map={tex} transparent opacity={0} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

/* --- Cámara: dolly sutil al final ---------------------------------------- */
function IntroCamera({ reduce }: { reduce: boolean }) {
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const targetZ = reduce ? 8.0 : 8.5 - smoothstep(DOLLY_START, DOLLY_END, t) * 1.9
    state.camera.position.z = THREE.MathUtils.damp(state.camera.position.z, targetZ, 2.4, Math.min(delta, 0.05))
    state.camera.position.x += (Math.sin(t * 0.11) * 0.04 - state.camera.position.x) * 0.05
    state.camera.position.y += (Math.cos(t * 0.09) * 0.035 - state.camera.position.y) * 0.05
    state.camera.lookAt(0, -0.05, 0)
  })
  return null
}

/* --- Configuración por dispositivo y movimiento reducido ------------------ */
function useIntroConfig() {
  const tier = useSpaceTier()
  const reduce = Boolean(useReducedMotion())
  const baseSwarm = tier === 'desktop' ? 4000 : tier === 'tablet' ? 2200 : 1150
  const baseAmbient = tier === 'desktop' ? 700 : tier === 'tablet' ? 380 : 190
  const swarmCount = reduce ? Math.round(baseSwarm * 0.38) : baseSwarm
  const ambientCount = reduce ? Math.round(baseAmbient * 0.4) : baseAmbient
  const fragCount = reduce ? 5 : tier === 'mobile' ? 5 : tier === 'tablet' ? 9 : 14
  const dpr = SPACE_CONFIG[tier].dpr
  return { swarmCount, ambientCount, fragCount, reduce, dpr }
}

function SplashScene({
  swarmCount,
  ambientCount,
  fragCount,
  reduce,
}: {
  swarmCount: number
  ambientCount: number
  fragCount: number
  reduce: boolean
}) {
  const logoTexture = useLoader(THREE.TextureLoader, logoUrl)

  useEffect(() => {
    logoTexture.colorSpace = THREE.SRGBColorSpace
    logoTexture.needsUpdate = true
  }, [logoTexture])

  const samples = useMemo(() => {
    const img = logoTexture.image as HTMLImageElement
    return sampleLogo(img)
  }, [logoTexture])

  return (
    <>
      <IntroCamera reduce={reduce} />
      <AmbientSky count={ambientCount} />
      <DeepFragments count={fragCount} reduce={reduce} />
      <ForegroundHaze reduce={reduce} />
      <FieldGlow reduce={reduce} />
      <LogoTexture samples={samples} reduce={reduce} />
      <LogoParticles samples={samples} count={swarmCount} reduce={reduce} />
      <PulseRing reduce={reduce} delay={0} color="#ffffff" width={0.012} maxScale={2.6} maxOpacity={0.5} z={0.06} />
      <PulseRing reduce={reduce} delay={0.07} color="#a78bfa" width={0.014} maxScale={2.4} maxOpacity={0.55} z={0.05} />
      <TextRevealLine samples={samples} reduce={reduce} />
    </>
  )
}

export function SplashScreen() {
  const { done, finish } = useIntro()
  const [hide, setHide] = useState(false)
  const [bootGone, setBootGone] = useState(false)
  const cfg = useIntroConfig()

  useEffect(() => {
    const fade = window.setTimeout(() => setHide(true), SPLASH_MS)
    const close = window.setTimeout(() => finish(), SPLASH_MS + FADE_MS)
    return () => {
      window.clearTimeout(fade)
      window.clearTimeout(close)
    }
  }, [finish])

  useEffect(() => {
    const boot = window.setTimeout(() => {
      document.getElementById('boot-splash')?.remove()
      setBootGone(true)
    }, 600)
    document.body.style.overflow = 'hidden'
    return () => {
      window.clearTimeout(boot)
      document.body.style.overflow = ''
    }
  }, [])

  if (done) return null

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black"
      style={{ pointerEvents: hide || !bootGone ? 'none' : 'auto' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: bootGone ? (hide ? 0 : 1) : 0 }}
      transition={{ duration: hide ? FADE_MS / 1000 : 0.45, ease: hide ? 'easeInOut' : 'easeOut' }}
    >
      <div aria-hidden="true" className="absolute inset-0">
        <Canvas
          dpr={[1, cfg.dpr]}
          camera={{ position: [0, 0, 8.5], fov: 55, near: 0.1, far: 160 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ pointerEvents: 'none' }}
        >
          <Suspense fallback={null}>
            <SplashScene
              swarmCount={cfg.swarmCount}
              ambientCount={cfg.ambientCount}
              fragCount={cfg.fragCount}
              reduce={cfg.reduce}
            />
          </Suspense>
        </Canvas>
      </div>
    </motion.div>
  )
}