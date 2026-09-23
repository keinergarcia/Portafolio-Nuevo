import type {
  Profile,
  Project,
  ServiceCategory,
  SocialLink,
  Technology,
} from '@/types'

export const fallbackProfile: Partial<Profile> = {
  full_name: 'Keiner García',
  professional_title: 'Desarrollador y Analista de Software',
  bio: 'Creo soluciones digitales modernas mediante desarrollo web, aplicaciones de escritorio, automatización e inteligencia artificial.',
  formation: ['TODO'],
  experience: ['TODO'],
  location: 'TODO',
  role: 'admin',
}

export const fallbackServiceCategories: ServiceCategory[] = [
  {
    id: 'cat-web',
    name: 'Desarrollo Web',
    slug: 'desarrollo-web',
    description:
      'Sitios y sistemas web modernos, rápidos y adaptados a cualquier dispositivo.',
    icon: 'globe',
    sort_order: 0,
    is_active: true,
    created_at: '',
    updated_at: '',
    services: [
      { id: 's1', title: 'Landing pages', slug: 'landing-pages', description: null, icon: null, is_featured: true, is_active: true, sort_order: 0, category_id: 'cat-web', created_at: '', updated_at: '' },
      { id: 's2', title: 'Sitios empresariales', slug: 'sitios-empresariales', description: null, icon: null, is_featured: false, is_active: true, sort_order: 1, category_id: 'cat-web', created_at: '', updated_at: '' },
      { id: 's3', title: 'Portafolios', slug: 'portafolios', description: null, icon: null, is_featured: false, is_active: true, sort_order: 2, category_id: 'cat-web', created_at: '', updated_at: '' },
      { id: 's4', title: 'Tiendas online', slug: 'tiendas-online', description: null, icon: null, is_featured: false, is_active: true, sort_order: 3, category_id: 'cat-web', created_at: '', updated_at: '' },
      { id: 's5', title: 'Sistemas web', slug: 'sistemas-web', description: null, icon: null, is_featured: false, is_active: true, sort_order: 4, category_id: 'cat-web', created_at: '', updated_at: '' },
      { id: 's6', title: 'Dashboards', slug: 'dashboards', description: null, icon: null, is_featured: false, is_active: true, sort_order: 5, category_id: 'cat-web', created_at: '', updated_at: '' },
      { id: 's7', title: 'Integración de APIs', slug: 'integracion-de-apis', description: null, icon: null, is_featured: false, is_active: true, sort_order: 6, category_id: 'cat-web', created_at: '', updated_at: '' },
      { id: 's8', title: 'Sistemas personalizados', slug: 'sistemas-personalizados', description: null, icon: null, is_featured: false, is_active: true, sort_order: 7, category_id: 'cat-web', created_at: '', updated_at: '' },
    ],
  },
  {
    id: 'cat-desktop',
    name: 'Aplicaciones de Escritorio',
    slug: 'aplicaciones-de-escritorio',
    description:
      'Software de escritorio para administrar, automatizar y optimizar la operación de tu negocio.',
    icon: 'monitor',
    sort_order: 1,
    is_active: true,
    created_at: '',
    updated_at: '',
    services: [
      { id: 's9', title: 'Aplicaciones administrativas', slug: 'aplicaciones-administrativas', description: null, icon: null, is_featured: true, is_active: true, sort_order: 0, category_id: 'cat-desktop', created_at: '', updated_at: '' },
      { id: 's10', title: 'Sistemas de inventario', slug: 'sistemas-de-inventario', description: null, icon: null, is_featured: false, is_active: true, sort_order: 1, category_id: 'cat-desktop', created_at: '', updated_at: '' },
      { id: 's11', title: 'Gestión empresarial', slug: 'gestion-empresarial', description: null, icon: null, is_featured: false, is_active: true, sort_order: 2, category_id: 'cat-desktop', created_at: '', updated_at: '' },
      { id: 's12', title: 'Sistemas de ventas', slug: 'sistemas-de-ventas', description: null, icon: null, is_featured: false, is_active: true, sort_order: 3, category_id: 'cat-desktop', created_at: '', updated_at: '' },
      { id: 's13', title: 'Herramientas internas', slug: 'herramientas-internas', description: null, icon: null, is_featured: false, is_active: true, sort_order: 4, category_id: 'cat-desktop', created_at: '', updated_at: '' },
      { id: 's14', title: 'Software personalizado', slug: 'software-personalizado', description: null, icon: null, is_featured: false, is_active: true, sort_order: 5, category_id: 'cat-desktop', created_at: '', updated_at: '' },
    ],
  },
  {
    id: 'cat-ai',
    name: 'Automatización e IA',
    slug: 'automatizacion-e-ia',
    description:
      'Procesos automatizados e inteligencia artificial para ahorrar tiempo y reducir errores.',
    icon: 'bot',
    sort_order: 2,
    is_active: true,
    created_at: '',
    updated_at: '',
    services: [
      { id: 's15', title: 'Automatización de procesos', slug: 'automatizacion-de-procesos', description: null, icon: null, is_featured: true, is_active: true, sort_order: 0, category_id: 'cat-ai', created_at: '', updated_at: '' },
      { id: 's16', title: 'Integración de APIs', slug: 'integracion-de-apis', description: null, icon: null, is_featured: false, is_active: true, sort_order: 1, category_id: 'cat-ai', created_at: '', updated_at: '' },
      { id: 's17', title: 'Automatización mediante n8n', slug: 'automatizacion-n8n', description: null, icon: null, is_featured: false, is_active: true, sort_order: 2, category_id: 'cat-ai', created_at: '', updated_at: '' },
      { id: 's18', title: 'Integraciones con WhatsApp', slug: 'integraciones-whatsapp', description: null, icon: null, is_featured: false, is_active: true, sort_order: 3, category_id: 'cat-ai', created_at: '', updated_at: '' },
      { id: 's19', title: 'Bots y asistentes inteligentes', slug: 'bots-y-asistentes', description: null, icon: null, is_featured: false, is_active: true, sort_order: 4, category_id: 'cat-ai', created_at: '', updated_at: '' },
      { id: 's20', title: 'IA generativa', slug: 'ia-generativa', description: null, icon: null, is_featured: false, is_active: true, sort_order: 5, category_id: 'cat-ai', created_at: '', updated_at: '' },
      { id: 's21', title: 'Procesamiento de documentos', slug: 'procesamiento-documentos', description: null, icon: null, is_featured: false, is_active: true, sort_order: 6, category_id: 'cat-ai', created_at: '', updated_at: '' },
      { id: 's22', title: 'Automatizaciones empresariales', slug: 'automatizaciones-empresariales', description: null, icon: null, is_featured: false, is_active: true, sort_order: 7, category_id: 'cat-ai', created_at: '', updated_at: '' },
    ],
  },
  {
    id: 'cat-support',
    name: 'Soporte y Servicios Informáticos',
    slug: 'soporte-informatico',
    description:
      'Instalación, configuración y mantenimiento de sistemas operativos y software.',
    icon: 'wrench',
    sort_order: 3,
    is_active: true,
    created_at: '',
    updated_at: '',
    services: [
      { id: 's23', title: 'Instalación de Windows 11', slug: 'instalacion-windows-11', description: null, icon: null, is_featured: false, is_active: true, sort_order: 0, category_id: 'cat-support', created_at: '', updated_at: '' },
      { id: 's24', title: 'Configuración del sistema', slug: 'configuracion-sistema', description: null, icon: null, is_featured: false, is_active: true, sort_order: 1, category_id: 'cat-support', created_at: '', updated_at: '' },
      { id: 's25', title: 'Instalación de drivers', slug: 'instalacion-drivers', description: null, icon: null, is_featured: false, is_active: true, sort_order: 2, category_id: 'cat-support', created_at: '', updated_at: '' },
      { id: 's26', title: 'Actualizaciones y optimización', slug: 'actualizaciones-optimizacion', description: null, icon: null, is_featured: false, is_active: true, sort_order: 3, category_id: 'cat-support', created_at: '', updated_at: '' },
      { id: 's27', title: 'Configuración de software', slug: 'configuracion-software', description: null, icon: null, is_featured: false, is_active: true, sort_order: 4, category_id: 'cat-support', created_at: '', updated_at: '' },
      { id: 's28', title: 'Mantenimiento de software', slug: 'mantenimiento-software', description: null, icon: null, is_featured: false, is_active: true, sort_order: 5, category_id: 'cat-support', created_at: '', updated_at: '' },
      { id: 's29', title: 'Herramientas de productividad', slug: 'herramientas-productividad', description: null, icon: null, is_featured: false, is_active: true, sort_order: 6, category_id: 'cat-support', created_at: '', updated_at: '' },
      { id: 's30', title: 'Software con licencia legítima', slug: 'software-licencia-legitima', description: null, icon: null, is_featured: false, is_active: true, sort_order: 7, category_id: 'cat-support', created_at: '', updated_at: '' },
      { id: 's31', title: 'Configuración de herramientas PDF', slug: 'configuracion-herramientas-pdf', description: null, icon: null, is_featured: false, is_active: true, sort_order: 8, category_id: 'cat-support', created_at: '', updated_at: '' },
    ],
  },
]

export const fallbackTechnologies: Technology[] = [
  { id: 't1', name: 'React', category: 'frontend', icon: null, description: null, level: null, sort_order: 0, is_active: true, created_at: '', updated_at: '' },
  { id: 't2', name: 'JavaScript', category: 'frontend', icon: null, description: null, level: null, sort_order: 1, is_active: true, created_at: '', updated_at: '' },
  { id: 't3', name: 'TypeScript', category: 'frontend', icon: null, description: null, level: null, sort_order: 2, is_active: true, created_at: '', updated_at: '' },
  { id: 't4', name: 'HTML', category: 'frontend', icon: null, description: null, level: null, sort_order: 3, is_active: true, created_at: '', updated_at: '' },
  { id: 't5', name: 'CSS', category: 'frontend', icon: null, description: null, level: null, sort_order: 4, is_active: true, created_at: '', updated_at: '' },
  { id: 't6', name: 'Tailwind', category: 'frontend', icon: null, description: null, level: null, sort_order: 5, is_active: true, created_at: '', updated_at: '' },
  { id: 't7', name: 'Laravel', category: 'backend', icon: null, description: null, level: null, sort_order: 0, is_active: true, created_at: '', updated_at: '' },
  { id: 't8', name: 'Node.js', category: 'backend', icon: null, description: null, level: null, sort_order: 1, is_active: true, created_at: '', updated_at: '' },
  { id: 't9', name: '.NET', category: 'backend', icon: null, description: null, level: null, sort_order: 2, is_active: true, created_at: '', updated_at: '' },
  { id: 't10', name: 'Java', category: 'backend', icon: null, description: null, level: null, sort_order: 3, is_active: true, created_at: '', updated_at: '' },
  { id: 't11', name: 'Python', category: 'backend', icon: null, description: null, level: null, sort_order: 4, is_active: true, created_at: '', updated_at: '' },
  { id: 't12', name: 'PostgreSQL', category: 'database', icon: null, description: null, level: null, sort_order: 0, is_active: true, created_at: '', updated_at: '' },
  { id: 't13', name: 'MySQL', category: 'database', icon: null, description: null, level: null, sort_order: 1, is_active: true, created_at: '', updated_at: '' },
  { id: 't14', name: 'SQLite', category: 'database', icon: null, description: null, level: null, sort_order: 2, is_active: true, created_at: '', updated_at: '' },
  { id: 't15', name: 'Supabase', category: 'database', icon: null, description: null, level: null, sort_order: 3, is_active: true, created_at: '', updated_at: '' },
  { id: 't16', name: 'IA generativa', category: 'ia-automatizacion', icon: null, description: null, level: null, sort_order: 0, is_active: true, created_at: '', updated_at: '' },
  { id: 't17', name: 'n8n', category: 'ia-automatizacion', icon: null, description: null, level: null, sort_order: 1, is_active: true, created_at: '', updated_at: '' },
  { id: 't18', name: 'APIs', category: 'ia-automatizacion', icon: null, description: null, level: null, sort_order: 2, is_active: true, created_at: '', updated_at: '' },
  { id: 't19', name: 'Automatización', category: 'ia-automatizacion', icon: null, description: null, level: null, sort_order: 3, is_active: true, created_at: '', updated_at: '' },
]

export const fallbackProjects: Project[] = [
  {
    id: 'p1',
    title: 'Portafolio ElChivalez',
    slug: 'portafolio-elchivalez',
    short_description:
      'Este sitio: un portafolio profesional administrable, con experiencia 3D, CMS propio y contenido dinámico vía Supabase.',
    description: '',
    problem: '',
    solution: '',
    features: null,
    results: null,
    category: 'Desarrollo Web',
    status: 'published',
    featured: true,
    cover_image: null,
    github_url: 'TODO',
    demo_url: 'https://elchivalez.com',
    sort_order: 0,
    created_at: '',
    updated_at: '',
    technologies: [],
  },
]

export const TECHNOLOGY_CATEGORY_LABELS: Record<string, string> = {
  frontend: 'Frontend',
  backend: 'Backend',
  database: 'Bases de datos',
  'ia-automatizacion': 'IA y automatización',
}

export const TECHNOLOGY_CATEGORY_ORDER = [
  'frontend',
  'backend',
  'database',
  'ia-automatizacion',
]

export const fallbackSocialLinks: SocialLink[] = [
  { id: 'sl1', platform: 'whatsapp', url: 'TODO', icon: null, sort_order: 0, is_active: true, created_at: '', updated_at: '' },
  { id: 'sl2', platform: 'github', url: 'TODO', icon: null, sort_order: 1, is_active: true, created_at: '', updated_at: '' },
  { id: 'sl3', platform: 'linkedin', url: 'TODO', icon: null, sort_order: 2, is_active: true, created_at: '', updated_at: '' },
]