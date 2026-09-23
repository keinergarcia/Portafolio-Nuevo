import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type {
  ContactMessage,
  Profile,
  Project,
  ProjectImage,
  Service,
  ServiceCategory,
  SiteSetting,
  SocialLink,
  Technology,
} from '@/types'

const NO_CONFIG =
  'Supabase no está configurado. Define VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env'

function requireConfig() {
  if (!isSupabaseConfigured()) throw new Error(NO_CONFIG)
  return supabase
}

export interface AdminStats {
  projectsTotal: number
  projectsPublished: number
  messagesNew: number
  categories: number
  technologies: number
}

// ---------------------------------------------------------------- stats
export async function getAdminStats(): Promise<AdminStats> {
  const db = requireConfig()
  const [projects, published, messagesNew, categories, technologies] = await Promise.all([
    db.from('projects').select('id', { count: 'exact', head: true }),
    db
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published'),
    db
      .from('contact_messages')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'new'),
    db.from('service_categories').select('id', { count: 'exact', head: true }),
    db.from('technologies').select('id', { count: 'exact', head: true }),
  ])
  return {
    projectsTotal: projects.count ?? 0,
    projectsPublished: published.count ?? 0,
    messagesNew: messagesNew.count ?? 0,
    categories: categories.count ?? 0,
    technologies: technologies.count ?? 0,
  }
}

// ------------------------------------------------------------- proyectos
export async function fetchProjects(): Promise<Project[]> {
  const db = requireConfig()
  const { data, error } = await db
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as Project[]
}

export async function fetchProjectImages(projectId: string): Promise<ProjectImage[]> {
  const db = requireConfig()
  const { data, error } = await db
    .from('project_images')
    .select('*')
    .eq('project_id', projectId)
    .order('sort_order', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as ProjectImage[]
}

export async function fetchProjectTechnologyIds(projectId: string): Promise<string[]> {
  const db = requireConfig()
  const { data, error } = await db
    .from('project_technologies')
    .select('technology_id')
    .eq('project_id', projectId)
  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => row.technology_id)
}

interface ProjectPayload {
  title: string
  slug: string
  short_description: string | null
  description: string | null
  problem: string | null
  solution: string | null
  features: string[] | null
  results: string[] | null
  category: string | null
  status: Project['status']
  featured: boolean
  cover_image: string | null
  github_url: string | null
  demo_url: string | null
  sort_order: number
}

export async function createProject(payload: ProjectPayload): Promise<Project> {
  const db = requireConfig()
  const { data, error } = await db
    .from('projects')
    .insert(payload)
    .select('*')
    .single()
  if (error) throw new Error(error.message)
  return data as unknown as Project
}

export async function updateProject(id: string, payload: Partial<ProjectPayload>) {
  const db = requireConfig()
  const { error } = await db.from('projects').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteProject(id: string) {
  const db = requireConfig()
  const { error } = await db.from('projects').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function setProjectTechnologies(projectId: string, technologyIds: string[]) {
  const db = requireConfig()
  const { error: deleteError } = await db
    .from('project_technologies')
    .delete()
    .eq('project_id', projectId)
  if (deleteError) throw new Error(deleteError.message)
  if (technologyIds.length === 0) return
  const rows = technologyIds.map((technologyId) => ({ project_id: projectId, technology_id: technologyId }))
  const { error: insertError } = await db.from('project_technologies').insert(rows)
  if (insertError) throw new Error(insertError.message)
}

export async function addProjectImage(projectId: string, url: string, alt?: string) {
  const db = requireConfig()
  const { error } = await db
    .from('project_images')
    .insert({ project_id: projectId, url, alt: alt ?? null, sort_order: 0 })
  if (error) throw new Error(error.message)
}

export async function deleteProjectImage(imageId: string) {
  const db = requireConfig()
  const { error } = await db.from('project_images').delete().eq('id', imageId)
  if (error) throw new Error(error.message)
}

// ------------------------------------------------------------ categorías
export async function fetchCategories(): Promise<ServiceCategory[]> {
  const db = requireConfig()
  const { data, error } = await db
    .from('service_categories')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as ServiceCategory[]
}

interface CategoryPayload {
  name: string
  slug: string
  description: string | null
  icon: string | null
  sort_order: number
  is_active: boolean
}

export async function createCategory(payload: CategoryPayload) {
  const db = requireConfig()
  const { error } = await db.from('service_categories').insert(payload)
  if (error) throw new Error(error.message)
}

export async function updateCategory(id: string, payload: Partial<CategoryPayload>) {
  const db = requireConfig()
  const { error } = await db.from('service_categories').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteCategory(id: string) {
  const db = requireConfig()
  const { error } = await db.from('service_categories').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ---------------------------------------------------------------- servicios
export async function fetchServices(): Promise<Service[]> {
  const db = requireConfig()
  const { data, error } = await db
    .from('services')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as Service[]
}

interface ServicePayload {
  category_id: string
  title: string
  slug: string
  description: string | null
  icon: string | null
  is_featured: boolean
  sort_order: number
  is_active: boolean
}

export async function createService(payload: ServicePayload) {
  const db = requireConfig()
  const { error } = await db.from('services').insert(payload)
  if (error) throw new Error(error.message)
}

export async function updateService(id: string, payload: Partial<ServicePayload>) {
  const db = requireConfig()
  const { error } = await db.from('services').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteService(id: string) {
  const db = requireConfig()
  const { error } = await db.from('services').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ------------------------------------------------------------ tecnologías
export async function fetchAllTechnologies(): Promise<Technology[]> {
  const db = requireConfig()
  const { data, error } = await db
    .from('technologies')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as Technology[]
}

interface TechnologyPayload {
  name: string
  category: string
  icon: string | null
  description: string | null
  level: number | null
  sort_order: number
  is_active: boolean
}

export async function createTechnology(payload: TechnologyPayload) {
  const db = requireConfig()
  const { error } = await db.from('technologies').insert(payload)
  if (error) throw new Error(error.message)
}

export async function updateTechnology(id: string, payload: Partial<TechnologyPayload>) {
  const db = requireConfig()
  const { error } = await db.from('technologies').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteTechnology(id: string) {
  const db = requireConfig()
  const { error } = await db.from('technologies').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ----------------------------------------------------------- enlaces
export async function fetchSocialLinksAdmin(): Promise<SocialLink[]> {
  const db = requireConfig()
  const { data, error } = await db
    .from('social_links')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as SocialLink[]
}

interface SocialLinkPayload {
  platform: string
  url: string
  icon: string | null
  sort_order: number
  is_active: boolean
}

export async function createSocialLink(payload: SocialLinkPayload) {
  const db = requireConfig()
  const { error } = await db.from('social_links').insert(payload)
  if (error) throw new Error(error.message)
}

export async function updateSocialLink(id: string, payload: Partial<SocialLinkPayload>) {
  const db = requireConfig()
  const { error } = await db.from('social_links').update(payload).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteSocialLink(id: string) {
  const db = requireConfig()
  const { error } = await db.from('social_links').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// ------------------------------------------------------------- mensajes
export async function fetchMessages(status?: string): Promise<ContactMessage[]> {
  const db = requireConfig()
  let query = db.from('contact_messages').select('*').order('created_at', { ascending: false })
  if (status) query = query.eq('status', status)
  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as ContactMessage[]
}

export async function updateMessageStatus(id: string, status: string) {
  const db = requireConfig()
  const { error } = await db.from('contact_messages').update({ status }).eq('id', id)
  if (error) throw new Error(error.message)
}

export async function deleteMessage(id: string) {
  const db = requireConfig()
  const { error } = await db.from('contact_messages').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

// --------------------------------------------------------- configuración
export async function fetchSettings(page: string): Promise<SiteSetting[]> {
  const db = requireConfig()
  const { data, error } = await db
    .from('site_settings')
    .select('*')
    .eq('page', page)
    .order('key', { ascending: true })
  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as SiteSetting[]
}

export async function upsertSetting(page: string, key: string, value: string) {
  const db = requireConfig()
  const { error } = await db
    .from('site_settings')
    .upsert({ page, key, value }, { onConflict: 'page,key' })
  if (error) throw new Error(error.message)
}

export async function updateMyProfile(id: string, payload: Partial<Profile>) {
  const db = requireConfig()
  const { error } = await db
    .from('profiles')
    .update({
      full_name: payload.full_name ?? null,
      professional_title: payload.professional_title ?? null,
      bio: payload.bio ?? null,
      photo_url: payload.photo_url ?? null,
      location: payload.location ?? null,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      resume_url: payload.resume_url ?? null,
    })
    .eq('id', id)
  if (error) throw new Error(error.message)
}

// --------------------------------------------------------------- storage
export async function uploadPublicFile(
  bucket: string,
  path: string,
  file: File,
): Promise<string> {
  const db = requireConfig()
  const { error } = await db.storage.from(bucket).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type,
  })
  if (error) throw new Error(error.message)
  const { data } = db.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export function buildStoragePath(prefix: string, fileName: string): string {
  const safeName = fileName.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/-+/g, '-')
  return `${prefix}/${Date.now()}-${safeName}`
}