import { useEffect, useState } from 'react'

export type SpaceTier = 'mobile' | 'tablet' | 'desktop'

export interface SpaceConfig {
  starCount: number
  particleCount: number
  accentCount: number
  orbitRingCount: number
  orbitDotCount: number
  clusterCount: number
  clusterSize: number
  dpr: number
}

export const SPACE_CONFIG: Record<SpaceTier, SpaceConfig> = {
  desktop: {
    starCount: 430,
    particleCount: 190,
    accentCount: 28,
    orbitRingCount: 2,
    orbitDotCount: 14,
    clusterCount: 2,
    clusterSize: 2,
    dpr: 1.6,
  },
  tablet: {
    starCount: 250,
    particleCount: 96,
    accentCount: 16,
    orbitRingCount: 2,
    orbitDotCount: 8,
    clusterCount: 2,
    clusterSize: 2,
    dpr: 1.5,
  },
  mobile: {
    starCount: 140,
    particleCount: 44,
    accentCount: 8,
    orbitRingCount: 1,
    orbitDotCount: 4,
    clusterCount: 1,
    clusterSize: 1,
    dpr: 1.3,
  },
}

function resolveTier(): SpaceTier {
  if (typeof window === 'undefined') return 'desktop'
  if (window.matchMedia('(max-width: 639px)').matches) return 'mobile'
  if (window.matchMedia('(min-width: 640px) and (max-width: 1023px)').matches) {
    return 'tablet'
  }
  return 'desktop'
}

export function useSpaceTier(): SpaceTier {
  const [tier, setTier] = useState<SpaceTier>(resolveTier)

  useEffect(() => {
    const queries = [
      {
        mql: window.matchMedia('(max-width: 639px)'),
        tier: 'mobile' as const,
      },
      {
        mql: window.matchMedia('(min-width: 640px) and (max-width: 1023px)'),
        tier: 'tablet' as const,
      },
    ]
    const update = () => setTier(resolveTier())
    update()
    queries.forEach(({ mql }) => mql.addEventListener('change', update))
    return () => {
      queries.forEach(({ mql }) => mql.removeEventListener('change', update))
    }
  }, [])

  return tier
}