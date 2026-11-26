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
    role: 'Practicante de Desarrollo de Software',
    company: 'WPOSS – World POS Solutions',
    companyUrl: 'https://www.wposs.com',
    logo: wpossLogo,
    current: true,
    period: 'Oct. 2026 – Actualidad',
    summary: [
      'Desarrollo y ajuste de código fuente en Java para aplicaciones Android en terminales POS bancarios. Depuración con Android Studio y ADB, pruebas funcionales y de conectividad, y análisis de tramas ISO8583 para el diagnóstico de fallos en transacciones.',
      'Elaboro documentación técnica de cambios y pruebas, y gestiono versiones y colaboración con Git, Bitbucket y Sourcetree.',
    ],
    technologies: [
      'Java',
      'Android Studio',
      'ADB',
      'ISO8583',
      'POS bancarios',
      'Git',
      'Bitbucket',
      'Sourcetree',
    ],
  },
]

/** Fortalezas y áreas de experiencia cargadas desde el panel, sin duplicar el puesto actual. */
export function experienceHighlights(items: string[] | null | undefined): string[] {
  return (items ?? [])
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item !== 'TODO' && !/wposs|world\s*pos/i.test(item))
}
