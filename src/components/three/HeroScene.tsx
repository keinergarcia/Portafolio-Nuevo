import { Suspense, lazy, useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import { useInViewport } from '@/hooks/useInViewport'
import { FallbackVisual } from './FallbackVisual'

const CoreScene = lazy(() => import('./CoreScene'))

type Frameloop = 'always' | 'never' | 'demand'

export function HeroScene() {
  const [ref, inView] = useInViewport<HTMLDivElement>(0.15)
  const [ready, setReady] = useState(false)
  const restrictedMotion = useReducedMotion()

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 500)
    return () => window.clearTimeout(timer)
  }, [])

  const frameloop: Frameloop = restrictedMotion ? 'never' : 'always'

  return (
    <div ref={ref} className="relative aspect-square w-full max-w-md" aria-hidden="true">
      {ready && inView && !restrictedMotion ? (
        <Suspense fallback={<FallbackVisual active />}>
          <CoreScene frameloop={frameloop} />
        </Suspense>
      ) : (
        <FallbackVisual active={!restrictedMotion} />
      )}
    </div>
  )
}