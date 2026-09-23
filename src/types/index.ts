export type ProjectStatus = 'draft' | 'published' | 'archived'

export interface Profile {
  id: string
  full_name: string | null
  photo_url: string | null
  professional_title: string | null
  bio: string | null
  formation: string[] | null
  experience: string[] | null
  location: string | null
  email: string | null
  phone: string | null
  resume_url: string | null
  role: 'admin' | 'user' | null
  created_at: string
  updated_at: string
}

export interface ServiceCategory {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
  services?: Service[]
}

export interface Service {
  id: string
  category_id: string
  title: string
  slug: string
  description: string | null
  icon: string | null
  is_featured: boolean
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  title: string
  slug: string
  short_description: string | null
  description: string | null
  problem: string | null
  solution: string | null
  features: string[] | null
  results: string[] | null
  category: string | null
  status: ProjectStatus
  featured: boolean
  cover_image: string | null
  github_url: string | null
  demo_url: string | null
  sort_order: number
  created_at: string
  updated_at: string
  images?: ProjectImage[]
  technologies?: Technology[]
}

export interface ProjectImage {
  id: string
  project_id: string
  url: string
  alt: string | null
  sort_order: number
}

export type TechnologyCategory =
  | 'frontend'
  | 'backend'
  | 'database'
  | 'ia-automatizacion'
  | string

export interface Technology {
  id: string
  name: string
  category: TechnologyCategory
  icon: string | null
  description: string | null
  level: number | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ContactMessage {
  id: string
  name: string
  email: string
  phone: string | null
  service_type: string | null
  message: string
  status: string
  created_at: string
}

export type SocialPlatform =
  | 'whatsapp'
  | 'github'
  | 'linkedin'
  | 'instagram'
  | 'twitter'
  | 'tiktok'
  | 'youtube'
  | 'facebook'
  | string

export interface SocialLink {
  id: string
  platform: SocialPlatform
  url: string
  icon: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SiteSetting {
  id: string
  page: 'general' | 'home' | 'seo' | string
  key: string
  value: Record<string, unknown> | string | number | boolean | null
  updated_at: string
}