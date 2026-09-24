/* oxlint-disable react/purity, react/only-export-components -- ajustes de efectos: lectura persistida (localStorage) y estado global mutado por el panel/configuradores */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

export interface EffectsSettings {
  background3D: boolean
  trailThickness: number
  trailLife: number
}

export interface EffectsValue extends EffectsSettings {
  setBackground3D: (value: boolean) => void
  setTrailThickness: (value: number) => void
  setTrailLife: (value: number) => void
  reset: () => void
}

export const DEFAULT_FX: EffectsSettings = {
  background3D: true,
  trailThickness: 1,
  trailLife: 0.95,
}

const STORAGE_KEY = 'portfolio-fx-settings'

function loadSettings(): EffectsSettings {
  if (typeof window === 'undefined') return DEFAULT_FX
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT_FX, ...(JSON.parse(raw) as Partial<EffectsSettings>) }
  } catch {
    /* noop */
  }
  return DEFAULT_FX
}

const EffectsContext = createContext<EffectsValue | null>(null)

export function EffectsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<EffectsSettings>(loadSettings)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      /* noop */
    }
  }, [settings])

  const setBackground3D = useCallback(
    (value: boolean) => setSettings((s) => ({ ...s, background3D: value })),
    [],
  )
  const setTrailThickness = useCallback(
    (value: number) => setSettings((s) => ({ ...s, trailThickness: value })),
    [],
  )
  const setTrailLife = useCallback(
    (value: number) => setSettings((s) => ({ ...s, trailLife: value })),
    [],
  )
  const reset = useCallback(() => setSettings({ ...DEFAULT_FX }), [])

  const value = useMemo(
    () => ({ ...settings, setBackground3D, setTrailThickness, setTrailLife, reset }),
    [settings, setBackground3D, setTrailThickness, setTrailLife, reset],
  )

  return <EffectsContext value={value}>{children}</EffectsContext>
}

export function useEffects() {
  const ctx = useContext(EffectsContext)
  if (!ctx) throw new Error('useEffects debe usarse dentro de <EffectsProvider>')
  return ctx
}