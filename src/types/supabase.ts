export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

type ProfileRow = {
  id: string
  full_name: string | null
  photo_url: string | null
  professional_title: string | null
  bio: string | null
  formation: Json[] | null
  experience: Json[] | null
  location: string | null
  email: string | null
  phone: string | null
  resume_url: string | null
  role: string | null
  created_at: string
  updated_at: string
}

type ProfileInsert = {
  id?: string
  full_name?: string | null
  photo_url?: string | null
  professional_title?: string | null
  bio?: string | null
  formation?: Json[] | null
  experience?: Json[] | null
  location?: string | null
  email?: string | null
  phone?: string | null
  resume_url?: string | null
  role?: string | null
  created_at?: string
  updated_at?: string
}

type ProfileUpdate = Partial<ProfileInsert>

type ServiceCategoryRow = {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

type ServiceCategoryInsert = {
  id?: string
  name: string
  slug: string
  description?: string | null
  icon?: string | null
  sort_order?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

type ServiceCategoryUpdate = Partial<ServiceCategoryInsert>

type ServiceRow = {
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

type ServiceInsert = {
  id?: string
  category_id: string
  title: string
  slug: string
  description?: string | null
  icon?: string | null
  is_featured?: boolean
  sort_order?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

type ServiceUpdate = Partial<ServiceInsert>

type ProjectRow = {
  id: string
  title: string
  slug: string
  short_description: string | null
  description: string | null
  problem: string | null
  solution: string | null
  features: Json[] | null
  results: Json[] | null
  category: string | null
  status: string
  featured: boolean
  cover_image: string | null
  github_url: string | null
  demo_url: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

type ProjectInsert = {
  id?: string
  title: string
  slug: string
  short_description?: string | null
  description?: string | null
  problem?: string | null
  solution?: string | null
  features?: Json[] | null
  results?: Json[] | null
  category?: string | null
  status?: string
  featured?: boolean
  cover_image?: string | null
  github_url?: string | null
  demo_url?: string | null
  sort_order?: number
  created_at?: string
  updated_at?: string
}

type ProjectUpdate = Partial<ProjectInsert>

type ProjectImageRow = {
  id: string
  project_id: string
  url: string
  alt: string | null
  sort_order: number
  created_at: string
}

type ProjectImageInsert = {
  id?: string
  project_id: string
  url: string
  alt?: string | null
  sort_order?: number
  created_at?: string
}

type ProjectImageUpdate = Partial<ProjectImageInsert>

type TechnologyRow = {
  id: string
  name: string
  category: string
  icon: string | null
  description: string | null
  level: number | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

type TechnologyInsert = {
  id?: string
  name: string
  category: string
  icon?: string | null
  description?: string | null
  level?: number | null
  sort_order?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

type TechnologyUpdate = Partial<TechnologyInsert>

type ProjectTechnologyRow = {
  project_id: string
  technology_id: string
}

type ProjectTechnologyInsert = {
  project_id: string
  technology_id: string
}

type ProjectTechnologyUpdate = Partial<ProjectTechnologyInsert>

type ContactMessageRow = {
  id: string
  name: string
  email: string
  phone: string | null
  service_type: string | null
  message: string
  status: string
  created_at: string
}

type ContactMessageInsert = {
  id?: string
  name: string
  email: string
  phone?: string | null
  service_type?: string | null
  message: string
  status?: string
  created_at?: string
}

type ContactMessageUpdate = Partial<ContactMessageInsert>

type SiteSettingRow = {
  id: string
  page: string
  key: string
  value: Json | null
  updated_at: string
}

type SiteSettingInsert = {
  id?: string
  page: string
  key: string
  value?: Json | null
  updated_at?: string
}

type SiteSettingUpdate = Partial<SiteSettingInsert>

type SocialLinkRow = {
  id: string
  platform: string
  url: string
  icon: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

type SocialLinkInsert = {
  id?: string
  platform: string
  url: string
  icon?: string | null
  sort_order?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

type SocialLinkUpdate = Partial<SocialLinkInsert>

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow
        Insert: ProfileInsert
        Update: ProfileUpdate
      Relationships: []
      }
      service_categories: {
        Row: ServiceCategoryRow
        Insert: ServiceCategoryInsert
        Update: ServiceCategoryUpdate
      Relationships: []
      }
      services: {
        Row: ServiceRow
        Insert: ServiceInsert
        Update: ServiceUpdate
      Relationships: []
      }
      projects: {
        Row: ProjectRow
        Insert: ProjectInsert
        Update: ProjectUpdate
      Relationships: []
      }
      project_images: {
        Row: ProjectImageRow
        Insert: ProjectImageInsert
        Update: ProjectImageUpdate
      Relationships: []
      }
      technologies: {
        Row: TechnologyRow
        Insert: TechnologyInsert
        Update: TechnologyUpdate
      Relationships: []
      }
      project_technologies: {
        Row: ProjectTechnologyRow
        Insert: ProjectTechnologyInsert
        Update: ProjectTechnologyUpdate
      Relationships: []
      }
      contact_messages: {
        Row: ContactMessageRow
        Insert: ContactMessageInsert
        Update: ContactMessageUpdate
      Relationships: []
      }
      site_settings: {
        Row: SiteSettingRow
        Insert: SiteSettingInsert
        Update: SiteSettingUpdate
      Relationships: []
      }
      social_links: {
        Row: SocialLinkRow
        Insert: SocialLinkInsert
        Update: SocialLinkUpdate
      Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}