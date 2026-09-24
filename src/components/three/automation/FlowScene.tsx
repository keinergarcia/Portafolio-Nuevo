/* oxlint-disable react/purity, react/immutability, react/refs -- sistema de partículas imperativo que muta buffers y refs desde el loop de frames (sistema externo al render) */
import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { ClipboardList, Database, FileText, Mail, MessageCircle, MessageSquare, Share2, ShoppingBag, User, Zap } from 'lucide-react'
import {
  DEST_X,
  FLOW_SPAN,
  FORCE_K,
  HALF_VIEW,
  INFLUENCE_R,
  IN_X,
  RESTORE,
  ROUTES,
  SPINE_SAMPLES,
  SWIRL_K,
  TIER_CONFIG,
  buildExtControls,
  clamp,
  evalCatmullExt,
  flowProfile,
  makeGlowTexture,
  smoothstep,
  type FlowPointer,
  type FlowTier,
  type RouteDef,
} from './config'

const ROUTE_COLORS = ROUTES.map((r) => new THREE.Color(r.color))
const BASE_PARTICLE = new THREE.Color('#eaf1fc')
const DUST_COLOR = new THREE.Color('#8aa4d1')
const NEUTRAL_LINE = new THREE.Color('#4d6f9e')

const ICONS: Record<RouteDef['icon'], typeof MessageCircle> = {
  chat: MessageCircle,
  database: Database,
  mail: Mail,
  api: Share2,
  zap: Zap,
}

const ENTRY_X = -4.5

const ENTRY_ITEMS = [
  { label: 'Mensajes', x: ENTRY_X, y: 0.85, Icon: MessageSquare },
  { label: 'Formularios', x: ENTRY_X, y: 0.18, Icon: ClipboardList },
  { label: 'Pedidos', x: ENTRY_X, y: -0.5, Icon: ShoppingBag },
  { label: 'Solicitudes', x: ENTRY_X, y: -1.18, Icon: FileText },
] as const

const CLIENT_X = -5.4
const CLIENT_Y = -0.15

const SERVICE_OFFSET = {
  whatsapp: { dx: 0.65, dy: -0.02 },
  database: { dx: 0.9, dy: -0.02 },
  mail: { dx: 0.65, dy: -0.02 },
  api: { dx: 0.65, dy: -0.02 },
  response: { dx: 1.15, dy: 0 },
} as const

interface EngineRefs {
  frags?: THREE.InstancedMesh
  pulses?: THREE.InstancedMesh
  nodeGroup?: THREE.Group
  nodeCore?: THREE.Sprite
  nodeGlow?: THREE.Sprite
  cursorGlow?: THREE.Sprite
  anchors: (THREE.Sprite | null)[]
  anchorMat: (THREE.SpriteMaterial | null)[]
  labels: (HTMLDivElement | null)[]
  centerLabel?: HTMLDivElement | null
  clientLabel?: HTMLDivElement | null
  entries: (HTMLDivElement | null)[]
}

interface FlowEngine {
  fitX: number
  reduce: boolean
  pointer: FlowPointer
  refs: EngineRefs
  dataGeo: THREE.BufferGeometry
  dustGeo: THREE.BufferGeometry
  runnerGeo: THREE.BufferGeometry
  runnerPosAttr: THREE.BufferAttribute
  runnerColorAttr: THREE.BufferAttribute
  spineGeos: THREE.BufferGeometry[]
  spineLines: THREE.Line[]
  spineMats: THREE.LineBasicMaterial[]
  ringLine: THREE.Line
  fragCount: number
  pulsePool: number
  ghosts: number
  dataN: number
  dustN: number
  speedBase: number
  initNow: number
  cpExt: Float32Array
  route: Uint8Array
  tArr: Float32Array
  sleep: Float32Array
  speed: Float32Array
  phase: Float32Array
  baseColor: Float32Array
  disp: Float32Array
  posAttr: THREE.BufferAttribute
  colAttr: THREE.BufferAttribute
  dustBase: Float32Array
  dustPhase: Float32Array
  dustAmp: Float32Array
  dustW: Float32Array
  dustPosAttr: THREE.BufferAttribute
  dustColorAttr: THREE.BufferAttribute
  fragBase: Float32Array
  fragScale: Float32Array
  fragEuler: Float32Array
  fragPhase: Float32Array
  pulseActive: Uint8Array
  pulseRoute: Uint8Array
  pulsePos: Float32Array
  pulseAge: Float32Array
  pulseLife: Float32Array
  pulseCursor: number
  pulseColorAttr: THREE.InstancedBufferAttribute
  runnerT: Float32Array
  routeActive: Uint8Array
  arrivals: Uint8Array
  labelFade: Float32Array
  spineGlow: Float32Array
  nodeBusy: number
  glowOpacity: number
  glowPos: THREE.Vector3
  cursorWorld: THREE.Vector3
  ringGeo: THREE.BufferGeometry
  ringLineGeo: THREE.BufferGeometry
  cpClean: Float32Array
  dest: Float32Array
  labelPos: Float32Array
  routeLatch: Float32Array
  centerFade: number
  clientFade: number
  entryFade: Float32Array
}

function capLen(arr: Float32Array, ix: number, cap: number) {
  const x = arr[ix]
  const y = arr[ix + 1]
  const z = arr[ix + 2]
  const l2 = x * x + y * y + z * z
  if (l2 > cap * cap) {
    const s = cap / Math.sqrt(l2)
    arr[ix] = x * s
    arr[ix + 1] = y * s
    arr[ix + 2] = z * s
  }
}

function buildLineGeometry(samples: number) {
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(samples * 3), 3))
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 40)
  return geo
}

function buildEngine(tier: FlowTier, fitX: number, pointer: FlowPointer, reduce: boolean, refs: EngineRefs): FlowEngine {
  const cfg = TIER_CONFIG[tier]
  const n = cfg.data
  const d = cfg.dust
  const f = cfg.fragments
  const ghost = cfg.ghosts
  const pool = cfg.pulsePool

  const dataGeo = new THREE.BufferGeometry()
  const posAttr = new THREE.BufferAttribute(new Float32Array(n * 3), 3)
  const colAttr = new THREE.BufferAttribute(new Float32Array(n * 3), 3)
  dataGeo.setAttribute('position', posAttr)
  dataGeo.setAttribute('color', colAttr)
  dataGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 40)

  const cpExt = new Float32Array(n * 21)
  const route = new Uint8Array(n)
  const tArr = new Float32Array(n)
  const sleep = new Float32Array(n)
  const speed = new Float32Array(n)
  const phase = new Float32Array(n)
  const baseColor = new Float32Array(n * 3)
  const disp = new Float32Array(n * 3)

  const tint = new THREE.Color()
  for (let i = 0; i < n; i++) {
    const r = Math.floor(Math.random() * ROUTES.length)
    route[i] = r
    const R = ROUTES[r]
    tArr[i] = Math.random() * 0.92
    speed[i] = 0.94 + Math.random() * 0.12
    phase[i] = Math.random() * Math.PI * 2
    const jy = (Math.random() * 2 - 1) * 0.8
    const jz = (Math.random() * 2 - 1) * 1.05
    const p = buildExtControls([
      [IN_X + (Math.random() * 2 - 1) * 0.35, R.inputY + jy * 0.45, R.inputZ * 0.8 + jz * 0.3],
      [-2.2, R.inputY * 0.45 + jy * 0.28, R.inputZ * 0.4 + jz * 0.2],
      [-0.9, jy * 0.1, jz * 0.15],
      [0, 0, 0],
      [1.05, R.outputY * 0.55, R.outputZ * 0.6],
      [DEST_X, R.outputY, R.outputZ],
    ])
    cpExt.set(p, i * 21)
    tint.set(R.color)
    const k = Math.random() < 0.55 ? 0.45 : 0
    const ix = i * 3
    baseColor[ix] = BASE_PARTICLE.r + (tint.r - BASE_PARTICLE.r) * k
    baseColor[ix + 1] = BASE_PARTICLE.g + (tint.g - BASE_PARTICLE.g) * k
    baseColor[ix + 2] = BASE_PARTICLE.b + (tint.b - BASE_PARTICLE.b) * k
  }

  const cpClean = new Float32Array(ROUTES.length * 21)
  for (let r = 0; r < ROUTES.length; r++) {
    const R = ROUTES[r]
    cpClean.set(
      buildExtControls([
        [IN_X * 0.86, R.inputY, R.inputZ * 0.8],
        [-2.2, R.inputY * 0.45, R.inputZ * 0.4],
        [-0.9, 0, 0],
        [0, 0, 0],
        [1.05, R.outputY * 0.55, R.outputZ * 0.6],
        [DEST_X, R.outputY, R.outputZ],
      ]),
      r * 21,
    )
  }

  const dest = new Float32Array(ROUTES.length * 3)
  const labelPos = new Float32Array(ROUTES.length * 3)
  for (let r = 0; r < ROUTES.length; r++) {
    const R = ROUTES[r]
    const off = SERVICE_OFFSET[R.id as keyof typeof SERVICE_OFFSET] ?? { dx: 0.4, dy: -0.12 }
    dest[r * 3] = DEST_X * fitX
    dest[r * 3 + 1] = R.outputY
    dest[r * 3 + 2] = R.outputZ
    labelPos[r * 3] = (DEST_X + off.dx) * fitX
    labelPos[r * 3 + 1] = R.outputY + off.dy
    labelPos[r * 3 + 2] = R.outputZ + 0.3
  }

  const dustGeo = new THREE.BufferGeometry()
  const dustPosAttr = new THREE.BufferAttribute(new Float32Array(d * 3), 3)
  const dustColorAttr = new THREE.BufferAttribute(new Float32Array(d * 3), 3)
  dustGeo.setAttribute('position', dustPosAttr)
  dustGeo.setAttribute('color', dustColorAttr)
  dustGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 40)

  const dustBase = new Float32Array(d * 3)
  const dustPhase = new Float32Array(d)
  const dustAmp = new Float32Array(d * 3)
  const dustW = new Float32Array(d * 3)
  for (let i = 0; i < d; i++) {
    const ix = i * 3
    dustBase[ix] = (Math.random() * 2 - 1) * 7.6
    dustBase[ix + 1] = (Math.random() * 2 - 1) * 3.1
    dustBase[ix + 2] = -3.8 + Math.random() * 6.4
    dustPhase[i] = Math.random() * Math.PI * 2
    dustAmp[ix] = 0.1 + Math.random() * 0.4
    dustAmp[ix + 1] = 0.08 + Math.random() * 0.3
    dustAmp[ix + 2] = 0.05 + Math.random() * 0.18
    dustW[ix] = 0.25 + Math.random() * 0.5
    dustW[ix + 1] = 0.3 + Math.random() * 0.55
    dustW[ix + 2] = 0.2 + Math.random() * 0.4
    const br = 0.35 + Math.random() * 0.65
    dustColorAttr.setXYZ(i, DUST_COLOR.r * br, DUST_COLOR.g * br, DUST_COLOR.b * br)
  }

  const fragBase = new Float32Array(f * 3)
  const fragScale = new Float32Array(f)
  const fragEuler = new Float32Array(f * 3)
  const fragPhase = new Float32Array(f)
  for (let i = 0; i < f; i++) {
    const ix = i * 3
    fragBase[ix] = (Math.random() * 2 - 1) * 8.2
    fragBase[ix + 1] = (Math.random() * 2 - 1) * 3.2
    fragBase[ix + 2] = -3.2 + Math.random() * 5.2
    fragScale[i] = 0.35 + Math.random() * 0.85
    fragEuler[ix] = (Math.random() - 0.5) * 0.5
    fragEuler[ix + 1] = (Math.random() - 0.5) * 0.5
    fragEuler[ix + 2] = (Math.random() - 0.5) * 0.5
    fragPhase[i] = Math.random() * Math.PI * 2
  }

  const runnerCount = ROUTES.length * (ghost + 1)
  const runnerPosAttr = new THREE.BufferAttribute(new Float32Array(runnerCount * 3), 3)
  const runnerColorAttr = new THREE.BufferAttribute(new Float32Array(runnerCount * 3), 3)
  const runnerGeo = new THREE.BufferGeometry()
  runnerGeo.setAttribute('position', runnerPosAttr)
  runnerGeo.setAttribute('color', runnerColorAttr)
  runnerGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 40)

  const spineGeos = ROUTES.map(() => buildLineGeometry(SPINE_SAMPLES))
  const spineMats = ROUTES.map(
    () =>
      new THREE.LineBasicMaterial({
        color: NEUTRAL_LINE,
        transparent: true,
        opacity: 0.05,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        fog: false,
      }),
  )
  const spineLines = spineGeos.map((geo, r) => new THREE.Line(geo, spineMats[r]))

  const ringGeo = new THREE.BufferGeometry()
  const ringN = 30
  const ringPos = new Float32Array(ringN * 3)
  for (let i = 0; i < ringN; i++) {
    const a = (i / ringN) * Math.PI * 2
    ringPos[i * 3] = Math.cos(a) * 0.33
    ringPos[i * 3 + 1] = Math.sin(a) * 0.33
    ringPos[i * 3 + 2] = 0
  }
  ringGeo.setAttribute('position', new THREE.BufferAttribute(ringPos, 3))
  ringGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1)

  const ringLineGeo = new THREE.BufferGeometry()
  const lineN = 48
  const linePos = new Float32Array(lineN * 3)
  for (let i = 0; i < lineN; i++) {
    const a = (i / lineN) * Math.PI * 2
    linePos[i * 3] = Math.cos(a) * 0.47
    linePos[i * 3 + 1] = Math.sin(a) * 0.47
    linePos[i * 3 + 2] = 0
  }
  ringLineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3))
  ringLineGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1)

  const ringLine = new THREE.Line(
    ringLineGeo,
    new THREE.LineBasicMaterial({
      color: '#5fd6ff',
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false,
      fog: false,
    }),
  )

  return {
    fitX,
    reduce,
    pointer,
    refs,
    dataGeo,
    dustGeo,
    runnerGeo,
    runnerPosAttr,
    runnerColorAttr,
    spineGeos,
    spineLines,
    spineMats,
    ringLine,
    fragCount: f,
    pulsePool: pool,
    ghosts: ghost,
    dataN: n,
    dustN: d,
    speedBase: 0.17 * (0.8 + 0.5 * fitX),
    initNow: 2.0,
    cpExt,
    route,
    tArr,
    sleep,
    speed,
    phase,
    baseColor,
    disp,
    posAttr,
    colAttr,
    dustBase,
    dustPhase,
    dustAmp,
    dustW,
    dustPosAttr,
    dustColorAttr,
    fragBase,
    fragScale,
    fragEuler,
    fragPhase,
    pulseActive: new Uint8Array(pool),
    pulseRoute: new Uint8Array(pool),
    pulsePos: new Float32Array(pool * 3),
    pulseAge: new Float32Array(pool),
    pulseLife: new Float32Array(pool),
    pulseCursor: 0,
    pulseColorAttr: new THREE.InstancedBufferAttribute(new Float32Array(pool * 3), 3),
    runnerT: new Float32Array(ROUTES.length),
    routeActive: new Uint8Array(ROUTES.length),
    arrivals: new Uint8Array(ROUTES.length),
    labelFade: new Float32Array(ROUTES.length),
    spineGlow: new Float32Array(ROUTES.length),
    nodeBusy: 0,
    glowOpacity: 0,
    glowPos: new THREE.Vector3(0, 0, 2),
    cursorWorld: new THREE.Vector3(0, 0, 2),
    ringGeo,
    ringLineGeo,
    cpClean,
    dest,
    labelPos,
    routeLatch: new Float32Array(ROUTES.length),
    centerFade: 0,
    clientFade: 0,
    entryFade: new Float32Array(ENTRY_ITEMS.length),
  }
}

const tmpV = new THREE.Vector3()
const ndc = new THREE.Vector2()
const ray = new THREE.Raycaster()
const dummy = new THREE.Object3D()

function step(engine: FlowEngine, camera: THREE.Camera, now: number, dt: number) {
  const { refs, pointer, reduce } = engine
  if (!refs.frags) return
  const fitX = engine.fitX
  const t = now

  const fresh = performance.now() - pointer.lastMove.current < 900

  if (fresh && !reduce) {
    ndc.set(pointer.box.current.x, pointer.box.current.y)
    ray.setFromCamera(ndc, camera)
    const tHit = (0 - camera.position.z) / ray.ray.direction.z
    engine.cursorWorld.copy(camera.position).addScaledVector(ray.ray.direction, tHit)
  }

  engine.routeActive.fill(0)
  engine.arrivals.fill(0)

  const { posAttr, colAttr, route, tArr, sleep, speed, phase, baseColor, disp, cpExt } = engine
  const dataArr = posAttr.array as Float32Array
  const colArr = colAttr.array as Float32Array
  let totalArrivals = 0

  for (let i = 0; i < engine.dataN; i++) {
    const ix = i * 3
    if (sleep[i] > now) {
      colArr[ix] = 0
      colArr[ix + 1] = 0
      colArr[ix + 2] = 0
      continue
    }

    let tt = tArr[i]
    tt += dt * speed[i] * engine.speedBase * flowProfile(tt)

    if (tt >= 1) {
      const r = route[i]
      engine.arrivals[r]++
      totalArrivals++
      const pois = engine.pulseCursor % engine.pulsePool
      engine.pulseCursor++
      engine.pulseActive[pois] = 1
      engine.pulseAge[pois] = 0
      engine.pulseLife[pois] = 0.72
      engine.pulseRoute[pois] = r
      const dr = r * 3
      engine.pulsePos[pois * 3] = engine.dest[dr] + (Math.random() - 0.5) * 0.16
      engine.pulsePos[pois * 3 + 1] = engine.dest[dr + 1] + (Math.random() - 0.5) * 0.16
      engine.pulsePos[pois * 3 + 2] = engine.dest[dr + 2]
      sleep[i] = now + 0.8 + Math.random() * 2.0
      tArr[i] = 0
      colArr[ix] = 0
      colArr[ix + 1] = 0
      colArr[ix + 2] = 0
      continue
    }

    tArr[i] = tt
    evalCatmullExt(tmpV, cpExt, i * 21, tt)
    let x = tmpV.x * fitX
    let y = tmpV.y
    let z = tmpV.z

    const dc = Math.abs(tt - 0.6)
    if (dc < 0.085) {
      const w = 1 - dc / 0.085
      const ang = phase[i] + tt * 34
      x += Math.cos(ang) * w * 0.09 * fitX
      y += Math.sin(ang) * w * 0.13
      z += Math.cos(ang * 1.4) * w * 0.08
    }

    const r = route[i]
    if (tt > 0.63) engine.routeActive[r] = 1

    let nearFall = 0
    if (fresh || reduce) {
      const cx = engine.cursorWorld.x - x
      const cy = engine.cursorWorld.y - y
      const cz = engine.cursorWorld.z - z
      const d2 = cx * cx + cy * cy + cz * cz
      if (!reduce && d2 < INFLUENCE_R * INFLUENCE_R) {
        const d = Math.sqrt(d2)
        const fall = 1 - d / INFLUENCE_R
        const f2 = fall * fall
        nearFall = f2
        const nx = cx / d
        const ny = cy / d
        const nz = cz / d
        disp[ix] += nx * FORCE_K * f2 * dt
        disp[ix + 1] += ny * FORCE_K * f2 * dt
        disp[ix + 2] += nz * FORCE_K * f2 * dt
        disp[ix] += -ny * SWIRL_K * f2 * dt
        disp[ix + 1] += nx * SWIRL_K * f2 * dt * 0.7
        disp[ix + 2] += Math.sin(t * 2.2 + phase[i]) * f2 * dt * 0.75
      }
    }

    const damp = Math.exp(-RESTORE * dt)
    disp[ix] *= damp
    disp[ix + 1] *= damp
    disp[ix + 2] *= damp
    capLen(disp, ix, 1.6)

    dataArr[ix] = x + disp[ix]
    dataArr[ix + 1] = y + disp[ix + 1]
    dataArr[ix + 2] = z + disp[ix + 2]

    const fade = smoothstep(0, 0.08, tt) * (1 - smoothstep(0.9, 1, tt))
    const bright = 1 + nearFall * 0.8
    colArr[ix] = baseColor[ix] * fade * bright
    colArr[ix + 1] = baseColor[ix + 1] * fade * bright
    colArr[ix + 2] = baseColor[ix + 2] * fade * bright
  }

  if (totalArrivals > 0) {
    engine.nodeBusy = Math.min(2, engine.nodeBusy + totalArrivals * 0.35)
  }
  engine.nodeBusy = Math.max(0, engine.nodeBusy - dt * 0.9)

  for (let r = 0; r < ROUTES.length; r++) {
    if (engine.arrivals[r] > 0) engine.routeLatch[r] = Math.max(engine.routeLatch[r], 1.15)
    else engine.routeLatch[r] = Math.max(0, engine.routeLatch[r] - dt)
    if (engine.routeLatch[r] > 0) engine.routeActive[r] = 1
  }

  posAttr.needsUpdate = true
  colAttr.needsUpdate = true

  const { dustBase, dustPhase, dustAmp, dustW, dustPosAttr } = engine
  const dustArr = dustPosAttr.array as Float32Array
  for (let i = 0; i < engine.dustN; i++) {
    const ix = i * 3
    let x = dustBase[ix]
    let y = dustBase[ix + 1]
    let z = dustBase[ix + 2]
    x += Math.sin(t * dustW[ix] + dustPhase[i]) * dustAmp[ix]
    y += Math.cos(t * dustW[ix + 1] + dustPhase[i]) * dustAmp[ix + 1]
    z += Math.sin(t * dustW[ix + 2] + dustPhase[i] * 1.3) * dustAmp[ix + 2]
    if (fresh && !reduce) {
      const cx = engine.cursorWorld.x - x
      const cy = engine.cursorWorld.y - y
      const d2 = cx * cx + cy * cy
      if (d2 < 5.76) {
        const d = Math.sqrt(d2)
        if (d > 0.0001) {
          const f2 = (1 - d / 2.4) * (1 - d / 2.4)
          const k = FORCE_K * 0.32 * f2 * dt
          x += (cx / d) * k
          y += (cy / d) * k
          z += Math.sin(t * 3 + dustPhase[i]) * f2 * dt * 0.5
        }
      }
    }
    dustArr[ix] = x * fitX
    dustArr[ix + 1] = y
    dustArr[ix + 2] = z
  }
  dustPosAttr.needsUpdate = true

  const frags = refs.frags
  if (frags) {
    frags.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
    for (let i = 0; i < engine.fragCount; i++) {
      const ix = i * 3
      let x = engine.fragBase[ix]
      let y = engine.fragBase[ix + 1]
      let z = engine.fragBase[ix + 2]
      dummy.rotation.x += dt * engine.fragEuler[ix]
      dummy.rotation.y += dt * engine.fragEuler[ix + 1]
      dummy.rotation.z += dt * engine.fragEuler[ix + 2]
      const bob = Math.sin(t * 0.5 + engine.fragPhase[i]) * 0.05
      let s = engine.fragScale[i]
      if (fresh && !reduce) {
        const cx = engine.cursorWorld.x - x
        const cy = engine.cursorWorld.y - y
        const d2 = cx * cx + cy * cy
        if (d2 < 3.24) {
          const d = Math.sqrt(d2)
          const f2 = (1 - d / 1.8) * (1 - d / 1.8)
          const k = 1.5 * f2 * dt
          x += (cx / Math.max(0.001, d)) * k * 0.8
          y += (cy / Math.max(0.001, d)) * k * 0.8
          s *= 1 + f2 * 0.35
        }
      }
      dummy.position.set(x * fitX, y + bob, z)
      dummy.scale.setScalar(Math.max(0.0001, s * 0.05))
      dummy.updateMatrix()
      frags.setMatrixAt(i, dummy.matrix)
    }
    frags.instanceMatrix.needsUpdate = true
  }

  const pulses = refs.pulses
  if (pulses) {
    if (!pulses.instanceColor) pulses.instanceColor = engine.pulseColorAttr
    const col = pulses.instanceColor.array as Float32Array
    for (let j = 0; j < engine.pulsePool; j++) {
      const jx = j * 3
      if (!engine.pulseActive[j]) {
        dummy.position.set(999, 999, 999)
        dummy.scale.setScalar(0.0001)
        dummy.updateMatrix()
        pulses.setMatrixAt(j, dummy.matrix)
        col[jx] = 0
        col[jx + 1] = 0
        col[jx + 2] = 0
        continue
      }
      engine.pulseAge[j] += dt
      const k = engine.pulseAge[j] / engine.pulseLife[j]
      if (k >= 1) {
        engine.pulseActive[j] = 0
        dummy.position.set(999, 999, 999)
        dummy.scale.setScalar(0.0001)
        dummy.updateMatrix()
        pulses.setMatrixAt(j, dummy.matrix)
        col[jx] = 0
        col[jx + 1] = 0
        col[jx + 2] = 0
        continue
      }
      const s = 0.08 + k * 0.85
      dummy.position.set(engine.pulsePos[jx], engine.pulsePos[jx + 1], engine.pulsePos[jx + 2])
      dummy.rotation.z = k * 2 + j
      dummy.scale.setScalar(s)
      dummy.updateMatrix()
      pulses.setMatrixAt(j, dummy.matrix)
      const rc = ROUTE_COLORS[engine.pulseRoute[j]]
      const alpha = 0.55 * (1 - k)
      col[jx] = rc.r * alpha
      col[jx + 1] = rc.g * alpha
      col[jx + 2] = rc.b * alpha
    }
    pulses.instanceMatrix.needsUpdate = true
    pulses.instanceColor.needsUpdate = true
  }

  for (let r = 0; r < ROUTES.length; r++) {
    const geo = engine.spineGeos[r]
    const mat = engine.spineMats[r]
    const arr = geo.attributes.position.array as Float32Array
    const targetGlow = engine.routeActive[r] ? 1 : 0
    engine.spineGlow[r] += (targetGlow - engine.spineGlow[r]) * Math.min(1, dt * 3)
    const off = r * 21
    for (let s = 0; s < SPINE_SAMPLES; s++) {
      const tc = s / (SPINE_SAMPLES - 1)
      evalCatmullExt(tmpV, engine.cpClean, off, tc)
      let x = tmpV.x * fitX
      let y = tmpV.y
      let z = tmpV.z
      if (fresh && !reduce) {
        const dx = engine.cursorWorld.x - x
        const dy = engine.cursorWorld.y - y
        const dd2 = dx * dx + dy * dy
        if (dd2 < 2.9) {
          const dd = Math.sqrt(dd2)
          const f = 1 - dd / 1.7
          if (f > 0) {
            const f2 = f * f
            const kk = 0.16 * f2
            x += (dx / dd) * kk
            y += (dy / dd) * kk
            z += Math.sin(t * 3 + s * 0.4 + r) * f2 * 0.05
          }
        }
      }
      const si = s * 3
      arr[si] = x
      arr[si + 1] = y
      arr[si + 2] = z
    }
    geo.attributes.position.needsUpdate = true
    if (mat) {
      const glow = engine.spineGlow[r]
      mat.color.copy(NEUTRAL_LINE).lerp(ROUTE_COLORS[r], glow * 0.8)
      mat.opacity = 0.045 + glow * 0.11 * (1 + Math.sin(t * 0.9 + r) * 0.18)
    }
  }
  const { runnerPosAttr, runnerColorAttr } = engine
  const runnerPosArr = runnerPosAttr.array as Float32Array
  const runnerColArr = runnerColorAttr.array as Float32Array
  for (let r = 0; r < ROUTES.length; r++) {
    const activ = engine.routeActive[r]
    if (activ && !reduce) engine.runnerT[r] += dt * 0.34
    const run = 0.6 + (engine.runnerT[r] % 0.4)
    const rc = ROUTE_COLORS[r]
    const off = r * 21
    for (let g = 0; g <= engine.ghosts; g++) {
      const idx = r * (engine.ghosts + 1) + g
      const jx = idx * 3
      let tg = run - 0.048 * g
      if (tg < 0.6) tg = 0.6
      evalCatmullExt(tmpV, engine.cpClean, off, tg)
      runnerPosArr[jx] = tmpV.x * fitX
      runnerPosArr[jx + 1] = tmpV.y
      runnerPosArr[jx + 2] = tmpV.z
      const br = activ ? 1 - g * 0.3 : 0
      runnerColArr[jx] = rc.r * br
      runnerColArr[jx + 1] = rc.g * br
      runnerColArr[jx + 2] = rc.b * br
    }
  }
  runnerPosAttr.needsUpdate = true
  runnerColorAttr.needsUpdate = true

  const nodeGroup = refs.nodeGroup
  if (nodeGroup) {
    nodeGroup.rotation.y += dt * 0.22
    nodeGroup.rotation.x = Math.sin(t * 0.3) * 0.12
    nodeGroup.rotation.z = Math.sin(t * 0.22) * 0.05
  }
  const ringLine = engine.ringLine
  if (ringLine) ringLine.rotation.z -= dt * 0.28

  const nodeCore = refs.nodeCore
  if (nodeCore && nodeCore.material instanceof THREE.SpriteMaterial) {
    nodeCore.material.opacity = clamp(0.6 + Math.sin(t * 2.4) * 0.15 + engine.nodeBusy * 0.34, 0.15, 1)
    const sc = 0.4 * (1 + engine.nodeBusy * 0.22)
    nodeCore.scale.set(sc, sc, 1)
  }
  const nodeGlow = refs.nodeGlow
  if (nodeGlow && nodeGlow.material instanceof THREE.SpriteMaterial) {
    nodeGlow.material.opacity = clamp(0.3 + engine.nodeBusy * 0.4 + Math.sin(t * 1.6) * 0.08, 0.08, 1)
  }

  for (let r = 0; r < ROUTES.length; r++) {
    const am = refs.anchorMat[r]
    if (am) am.opacity = 0.12 + 0.5 * engine.routeActive[r]
    const el = refs.labels[r]
    if (el) {
      const target = reduce ? 0.55 : engine.routeActive[r] ? 1 : 0
      engine.labelFade[r] += (target - engine.labelFade[r]) * Math.min(1, dt * (target > engine.labelFade[r] ? 7 : 2.6))
      el.style.opacity = engine.labelFade[r].toFixed(3)
    }
  }

  const cl = refs.centerLabel
  if (cl) {
    const target = reduce ? 0.5 : Math.min(0.95, 0.55 + engine.nodeBusy * 0.32)
    engine.centerFade += (target - engine.centerFade) * Math.min(1, dt * 3)
    cl.style.opacity = engine.centerFade.toFixed(3)
  }

  const ccl = refs.clientLabel
  if (ccl) {
    const target = reduce ? 0.95 : 0.94
    engine.clientFade = target
    ccl.style.opacity = target.toFixed(3)
  }

  for (let i = 0; i < ENTRY_ITEMS.length; i++) {
    let target: number
    if (reduce) target = 0.5
    else {
      const ph = ((t * 0.2) % 1 + i * 0.38) % 1
      target = smoothstep(0, 0.12, ph) * (1 - smoothstep(0.42, 0.72, ph))
    }
    engine.entryFade[i] += (target - engine.entryFade[i]) * Math.min(1, dt * 5)
    const elm = refs.entries[i]
    if (elm) {
      const f = engine.entryFade[i]
      elm.style.opacity = f.toFixed(3)
      elm.style.transform = `scale(${(0.5 + 0.85 * f).toFixed(3)})`
    }
  }

  if (!reduce) {
    engine.glowPos.lerp(engine.cursorWorld, Math.min(1, dt * 6))
    const tg = fresh ? 0.5 : 0
    engine.glowOpacity += (tg - engine.glowOpacity) * Math.min(1, dt * 4)
    const gs = refs.cursorGlow
    if (gs) {
      gs.position.copy(engine.glowPos)
      const so = engine.glowOpacity * (0.75 + 0.25 * Math.sin(t * 5))
      if (gs.material instanceof THREE.SpriteMaterial) gs.material.opacity = Math.max(0, so)
    }
  }
}

export function FlowScene({ pointer, tier, reduce }: { pointer: FlowPointer; tier: FlowTier; reduce: boolean }) {
  const size = useThree((state) => state.size)
  const camera = useThree((state) => state.camera)
  const aspect = size.width / Math.max(1, size.height)
  const fitX = useMemo(() => clamp((HALF_VIEW * aspect * 0.94) / FLOW_SPAN, 0.32, 1), [aspect])

  const refs = useRef<EngineRefs>({
    anchors: [],
    anchorMat: [],
    labels: [],
    entries: [],
  } as EngineRefs).current

  const glow = useMemo(() => makeGlowTexture(), [])

  const engine = useMemo(() => buildEngine(tier, fitX, pointer, reduce, refs), [tier, fitX, pointer, reduce, refs])

  useLayoutEffect(() => {
    step(engine, camera, engine.initNow, 0.016)
  }, [engine, camera])

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05)
    if (!reduce) {
      const p = pointer.win.current
      const tt = state.clock.elapsedTime
      state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, p.x * 0.22 + Math.sin(tt * 0.16) * 0.05, 1.6, dt)
      state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, -p.y * 0.14 - 0.04, 1.6, dt)
      state.camera.lookAt(0, -0.05, 0)
    }
    step(engine, state.camera, state.clock.elapsedTime, dt)
  })

  return (
    <>
      <fogExp2 attach="fog" args={['#030509', 0.034]} />

      <points geometry={engine.dataGeo} frustumCulled={false}>
        <pointsMaterial
          size={0.05}
          sizeAttenuation
          transparent
          opacity={0.95}
          vertexColors
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          fog={false}
        />
      </points>

      <points geometry={engine.dustGeo} frustumCulled={false}>
        <pointsMaterial
          size={0.026}
          sizeAttenuation
          transparent
          opacity={0.5}
          vertexColors
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </points>

      <instancedMesh
        ref={(el) => (refs.frags = el ?? undefined)}
        args={[undefined, undefined, engine.fragCount] as [never, never, number]}
        frustumCulled={false}
      >
        <octahedronGeometry args={[0.05, 0]} />
        <meshBasicMaterial color="#9db8e6" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false} />
      </instancedMesh>

      <instancedMesh
        ref={(el) => (refs.pulses = el ?? undefined)}
        args={[undefined, undefined, engine.pulsePool] as [never, never, number]}
        frustumCulled={false}
      >
        <circleGeometry args={[1, 20]} />
        <meshBasicMaterial color="#8fd8ff" transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} side={THREE.DoubleSide} fog={false} />
      </instancedMesh>

      {ROUTES.map((route, r) => (
        <primitive key={route.id} object={engine.spineLines[r]} frustumCulled={false} />
      ))}

      <points geometry={engine.runnerGeo} frustumCulled={false}>
        <pointsMaterial
          size={0.075}
          sizeAttenuation
          transparent
          vertexColors
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          fog={false}
        />
      </points>

      <group ref={(el) => (refs.nodeGroup = el ?? undefined)}>
        <points geometry={engine.ringGeo} frustumCulled={false}>
          <pointsMaterial size={0.045} color="#7ce9ff" sizeAttenuation transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} fog={false} />
        </points>
        <primitive object={engine.ringLine} frustumCulled={false} />
        <sprite ref={(el) => (refs.nodeCore = el ?? undefined)} scale={[0.4, 0.4, 1]}>
          <spriteMaterial map={glow} color="#8ff0ff" transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} fog={false} opacity={0.6} />
        </sprite>
        <sprite ref={(el) => (refs.nodeGlow = el ?? undefined)} scale={[1.15, 1.15, 1]}>
          <spriteMaterial map={glow} color="#3f76d9" transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} fog={false} opacity={0.3} />
        </sprite>
      </group>

      {ROUTES.map((route, r) => (
        <sprite
          key={`anchor-${route.id}`}
          position={[engine.dest[r * 3], engine.dest[r * 3 + 1], engine.dest[r * 3 + 2]]}
          ref={(el) => (refs.anchors[r] = el ?? null)}
          scale={[0.16, 0.16, 1]}
        >
          <spriteMaterial
            ref={(el) => (refs.anchorMat[r] = el)}
            map={glow}
            color={route.color}
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            fog={false}
            opacity={0.12}
          />
        </sprite>
      ))}

      <sprite ref={(el) => (refs.cursorGlow = el ?? undefined)} scale={[0.55, 0.55, 1]}>
        <spriteMaterial map={glow} color="#a8d8ff" transparent depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} fog={false} opacity={0} />
      </sprite>

      <Html
        position={[CLIENT_X * engine.fitX, CLIENT_Y, 0.4]}
        center
        zIndexRange={[44, 0]}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div
          ref={(el) => {
            refs.clientLabel = el
          }}
          className="flex items-center gap-3 whitespace-nowrap rounded-full border-2 px-5 py-2.5 backdrop-blur-md"
          style={{
            opacity: reduce ? 0.95 : 0.94,
            borderColor: 'rgba(190,215,255,0.5)',
            background: 'rgba(10,16,32,0.8)',
            boxShadow: '0 0 34px -6px rgba(150,190,255,0.65)',
          }}
        >
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full sm:h-10 sm:w-10"
            style={{
              background: 'rgba(150,190,255,0.16)',
              boxShadow: 'inset 0 0 0 1px rgba(200,225,255,0.35), 0 0 16px -4px rgba(160,200,255,0.7)',
            }}
          >
            <User size={18} style={{ color: '#dceeff' }} aria-hidden="true" />
          </span>
          <span className="font-mono text-sm font-semibold tracking-[0.2em] text-white/95 uppercase sm:text-base">Cliente</span>
        </div>
      </Html>

      {ENTRY_ITEMS.map((item, i) => (
        <Html
          key={`entry-${item.label}`}
          position={[item.x * engine.fitX, item.y, 0.25]}
          center
          zIndexRange={[43, 0]}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div
            ref={(el) => {
              refs.entries[i] = el
            }}
            className="grid h-8 w-8 place-items-center rounded-lg border backdrop-blur-sm"
            style={{
              opacity: 0,
              borderColor: 'rgba(140,190,255,0.32)',
              background: 'rgba(8,12,24,0.55)',
              boxShadow: '0 0 18px -6px rgba(150,190,255,0.5)',
            }}
          >
            <item.Icon size={15} className="text-cyan-100/90" aria-hidden="true" />
          </div>
        </Html>
      ))}

      <Html
        position={[0, -1.1, 0]}
        center
        zIndexRange={[35, 0]}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div
          ref={(el) => {
            refs.centerLabel = el
          }}
          className="whitespace-nowrap text-center font-mono text-[11px] uppercase tracking-[0.38em] text-white/70 sm:text-sm"
          style={{
            opacity: 0,
            transition: 'opacity 600ms ease',
            textShadow: '0 0 22px rgba(130,180,255,0.55)',
          }}
        >
          <span className="text-cyan-200/80">IA</span>
          <span className="mx-2 text-white/25">/</span>
          <span>Automatización</span>
        </div>
      </Html>

      {ROUTES.map((route, r) => {
        const Icon = ICONS[route.icon]
        return (
          <Html
            key={`label-${route.id}`}
            position={[engine.labelPos[r * 3], engine.labelPos[r * 3 + 1], engine.labelPos[r * 3 + 2]]}
            center
            zIndexRange={[40, 0]}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            <div
              ref={(el) => {
                refs.labels[r] = el
              }}
              className="flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 backdrop-blur-md"
              style={{
                opacity: reduce ? 0.55 : 0,
                transition: 'opacity 420ms ease',
                borderColor: `${route.color}38`,
                background: 'rgba(3,6,13,0.55)',
                boxShadow: `0 0 22px -8px ${route.color}66`,
              }}
            >
              <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: route.color }} />
              <Icon size={13} style={{ color: route.color }} aria-hidden="true" />
              <span className="font-mono text-[10px] font-medium tracking-[0.14em] text-white/90 sm:text-xs">{route.label}</span>
            </div>
          </Html>
        )
      })}
    </>
  )
}