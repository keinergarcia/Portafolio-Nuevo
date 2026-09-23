import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

interface IntroValue {
  done: boolean
  finish: () => void
}

const IntroContext = createContext<IntroValue | null>(null)

export function IntroProvider({ children }: { children: ReactNode }) {
  const [done, setDone] = useState(false)
  const finish = useCallback(() => setDone(true), [])
  const value = useMemo(() => ({ done, finish }), [done, finish])
  return <IntroContext value={value}>{children}</IntroContext>
}

export function useIntro() {
  const ctx = useContext(IntroContext)
  if (!ctx) throw new Error('useIntro debe usarse dentro de <IntroProvider>')
  return ctx
}