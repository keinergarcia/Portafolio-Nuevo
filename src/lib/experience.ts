import wpossLogo from '@/assets/wposs.png'

export interface WorkExperience {
  id: string
  role: string
  company: string
  companyUrl: string
  logo: string
  current: boolean
  /** Texto del distintivo temporal, por ejemplo «Actualmente». */
  period: string
  summary: string[]
  technologies: string[]
}

export const WORK_EXPERIENCE: WorkExperience[] = [
  {
    id: 'wposs',
    role: 'Desarrollador de Software Junior',
    company: 'WPOSS – World POS Solutions',
    companyUrl: 'https://www.wposs.com',
    logo: wpossLogo,
    current: true,
    period: 'Actualmente',
    summary: [
      'Participo en el desarrollo, mantenimiento y mejora de soluciones de software, trabajando con aplicaciones Android, gestión de código mediante Git y Bitbucket, y automatización de procesos CI/CD.',
      'También realizo análisis técnico, pruebas de software, revisión de código y documentación, contribuyendo a la calidad, estabilidad y evolución de las soluciones tecnológicas de la empresa.',
    ],
    technologies: ['Java', 'Android Studio', 'Git', 'Bitbucket', 'Gradle', 'Docker', 'CI/CD'],
  },
]

/** Fortalezas y áreas de experiencia cargadas desde el panel, sin duplicar el puesto actual. */
export function experienceHighlights(items: string[] | null | undefined): string[] {
  return (items ?? [])
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item !== 'TODO' && !/wposs|world\s*pos/i.test(item))
}
