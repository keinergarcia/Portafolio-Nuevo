/* oxlint-disable react/set-state-in-effect -- carga asíncrona inicial de contenido (sistema externo) */
import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { fetchPortfolioData } from '@/services/content'
import {
  fallbackProfile,
  fallbackProjects,
  fallbackServiceCategories,
  fallbackSocialLinks,
  fallbackTechnologies,
} from '@/lib/content'
import type { Profile, Project, ServiceCategory, SocialLink, Technology } from '@/types'

function mergeProfile(remote: Profile | null): Profile {
  const fallback = fallbackProfile
  if (!remote) return fallback as Profile
  return {
    ...fallback,
    ...remote,
    full_name: remote.full_name ?? fallback.full_name ?? null,
    professional_title: remote.professional_title ?? fallback.professional_title ?? null,
    bio: remote.bio ?? fallback.bio ?? null,
    formation: remote.formation ?? fallback.formation ?? null,
    experience: remote.experience ?? fallback.experience ?? null,
    location: remote.location ?? fallback.location ?? null,
    email: remote.email ?? fallback.email ?? null,
    phone: remote.phone ?? fallback.phone ?? null,
    resume_url: remote.resume_url ?? fallback.resume_url ?? null,
    role: (remote.role as Profile['role']) ?? fallback.role ?? 'user',
  }
}

interface PortfolioDataValue {
  profile: Profile
  serviceCategories: ServiceCategory[]
  projects: Project[]
  technologies: Technology[]
  socialLinks: SocialLink[]
  settings: Record<string, string>
  loading: boolean
}

const EMPTY_VALUE: PortfolioDataValue = {
  profile: fallbackProfile as Profile,
  serviceCategories: fallbackServiceCategories,
  projects: fallbackProjects,
  technologies: fallbackTechnologies,
  socialLinks: fallbackSocialLinks,
  settings: {},
  loading: true,
}

const PortfolioDataContext = createContext<PortfolioDataValue>(EMPTY_VALUE)

export function PortfolioDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PortfolioDataValue>(EMPTY_VALUE)

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        const remote = await fetchPortfolioData()
        if (!active) return
        setData({
          profile: mergeProfile(remote.profile),
          serviceCategories:
            remote.serviceCategories.length > 0
              ? remote.serviceCategories
              : fallbackServiceCategories,
          projects:
            remote.projects.length > 0 ? remote.projects : fallbackProjects,
          technologies:
            remote.technologies.length > 0 ? remote.technologies : fallbackTechnologies,
          socialLinks:
            remote.socialLinks.length > 0 ? remote.socialLinks : fallbackSocialLinks,
          settings: remote.settings,
          loading: false,
        })
      } catch {
        if (!active) return
        setData({ ...EMPTY_VALUE, loading: false })
      }
    })()
    return () => {
      active = false
    }
  }, [])

  return <PortfolioDataContext value={data}>{children}</PortfolioDataContext>
}

export function usePortfolioData() {
  return useContext(PortfolioDataContext)
}