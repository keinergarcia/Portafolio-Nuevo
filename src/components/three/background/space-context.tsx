/* oxlint-disable react/only-export-components -- contexto 3D: patrón provider+hook */
import { createContext, useContext } from 'react'
import type { ReactNode, MutableRefObject } from 'react'
import * as THREE from 'three'
import type { SpaceTier } from './useSpaceTier'

export interface SpaceStateValue {
  pointerTarget: MutableRefObject<THREE.Vector2>
  pointer: MutableRefObject<THREE.Vector2>
  scroll: MutableRefObject<number>
  lastMove: MutableRefObject<number>
  lastClick: MutableRefObject<number>
  tier: SpaceTier
  reduce: boolean
}

const SpaceStateContext = createContext<SpaceStateValue | null>(null)

export function SpaceStateProvider({
  value,
  children,
}: {
  value: SpaceStateValue
  children: ReactNode
}) {
  return <SpaceStateContext value={value}>{children}</SpaceStateContext>
}

export function useSpaceState() {
  const ctx = useContext(SpaceStateContext)
  if (!ctx) throw new Error('useSpaceState debe usarse dentro de <SpaceStateProvider>')
  return ctx
}