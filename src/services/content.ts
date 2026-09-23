import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type {
  Profile,
  Project,
  ProjectImage,
  Service,
  ServiceCategory,
  SiteSetting,
  SocialLink,
  Technology,
} from '@/types'

export interface PortfolioData {
  profile: Profile | null
  serviceCategories: ServiceCategory[]
  projects: Project[]
  technologies: Technology[]
  socialLinks: SocialLink[]
  settings: Record<string, string>
}

const EMPTY: PortfolioData = {
  profile: null,
  serviceCategories: [],
  projects: [],
  technologies: [],
  socialLinks: [],
  settings: {},
}

type ProjectRow = Project
type TechnologyRow = Technology

export async function fetchPortfolioData(): Promise<PortfolioData> {
  if (!isSupabaseConfigured()) return EMPTY

  const [profileRes, categoriesRes, servicesRes, projectsRes, imagesRes, projectTechRes, techsRes, socialRes, settingsRes] =
    await Promise.all([
      supabase.from('profiles').select('*').limit(1).maybeSingle(),
      supabase.from('service_categories').select('*').order('sort_order', { ascending: true }),
      supabase.from('services').select('*').order('sort_order', { ascending: true }),
      supabase.from('projects').select('*').eq('status', 'published').order('sort_order', { ascending: true }),
      supabase.from('project_images').select('*').order('sort_order', { ascending: true }),
      supabase.from('project_technologies').select('*'),
      supabase.from('technologies').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
      supabase.from('social_links').select('*').eq('is_active', true).order('sort_order', { ascending: true }),
      supabase.from('site_settings').select('*'),
    ])

  const profile = profileRes.error ? null : (profileRes.data as unknown as Profile | null) ?? null
  const categories = categoriesRes.error
    ? []
    : ((categoriesRes.data ?? []) as unknown as ServiceCategory[])
  const services = servicesRes.error ? [] : ((servicesRes.data ?? []) as unknown as Service[])
  const projects = projectsRes.error
    ? []
    : ((projectsRes.data ?? []) as unknown as ProjectRow[])
  const images = imagesRes.error
    ? []
    : ((imagesRes.data ?? []) as unknown as ProjectImage[])
  const projectTechLinks = projectTechRes.error ? [] : (projectTechRes.data ?? [])
  const technologies = techsRes.error
    ? []
    : ((techsRes.data ?? []) as unknown as TechnologyRow[])
  const socialLinks = socialRes.error
    ? []
    : ((socialRes.data ?? []) as unknown as SocialLink[])
  const settingsRows = settingsRes.error ? [] : ((settingsRes.data ?? []) as unknown as SiteSetting[])

  const technologyById = new Map(technologies.map((tech) => [tech.id, tech]))

  const projectsWithRelations = projects.map((project) => ({
    ...project,
    images: images
      .filter((image) => image.project_id === project.id)
      .sort((a, b) => a.sort_order - b.sort_order),
    technologies: projectTechLinks
      .filter((link) => link.project_id === project.id)
      .map((link) => technologyById.get(link.technology_id))
      .filter((tech): tech is Technology => Boolean(tech)),
  }))

  const categoriesWithServices = categories.map((category) => ({
    ...category,
    services: services
      .filter((service) => service.category_id === category.id)
      .sort((a, b) => a.sort_order - b.sort_order),
  }))

  const settings: Record<string, string> = {}
  for (const row of settingsRows) {
    if (typeof row.value === 'string') settings[`${row.page}.${row.key}`] = row.value
    else settings[`${row.page}.${row.key}`] = JSON.stringify(row.value ?? '')
  }

  return {
    profile,
    serviceCategories: categoriesWithServices,
    projects: projectsWithRelations,
    technologies,
    socialLinks,
    settings,
  }
}