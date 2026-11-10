import apisLogo from '@/assets/technologies/apis.svg'
import automatizacionLogo from '@/assets/technologies/automatizacion.svg'
import cssLogo from '@/assets/technologies/css3.svg'
import dotnetLogo from '@/assets/technologies/dotnet.svg'
import htmlLogo from '@/assets/technologies/html5.svg'
import iaGenerativaLogo from '@/assets/technologies/ia-generativa.svg'
import javaLogo from '@/assets/technologies/java.svg'
import javascriptLogo from '@/assets/technologies/javascript.svg'
import laravelLogo from '@/assets/technologies/laravel.svg'
import mysqlLogo from '@/assets/technologies/mysql.svg'
import n8nLogo from '@/assets/technologies/n8n.svg'
import nodeLogo from '@/assets/technologies/nodejs.svg'
import postgresqlLogo from '@/assets/technologies/postgresql.svg'
import pythonLogo from '@/assets/technologies/python.svg'
import reactLogo from '@/assets/technologies/react.svg'
import sqliteLogo from '@/assets/technologies/sqlite.svg'
import supabaseLogo from '@/assets/technologies/supabase.svg'
import tailwindLogo from '@/assets/technologies/tailwindcss.svg'
import typescriptLogo from '@/assets/technologies/typescript.svg'

export interface TechnologyLogo {
  src: string
  /** Color de marca, usado para el resplandor y el borde 3D */
  color: string
}

const LOGOS = {
  react: { src: reactLogo, color: '#61dafb' },
  javascript: { src: javascriptLogo, color: '#f7df1e' },
  typescript: { src: typescriptLogo, color: '#3178c6' },
  html: { src: htmlLogo, color: '#e34f26' },
  css: { src: cssLogo, color: '#1572b6' },
  tailwind: { src: tailwindLogo, color: '#38bdf8' },
  laravel: { src: laravelLogo, color: '#ff2d20' },
  nodejs: { src: nodeLogo, color: '#5fa04e' },
  dotnet: { src: dotnetLogo, color: '#8b5cf6' },
  java: { src: javaLogo, color: '#f89820' },
  python: { src: pythonLogo, color: '#3776ab' },
  postgresql: { src: postgresqlLogo, color: '#4f8ef7' },
  mysql: { src: mysqlLogo, color: '#4479a1' },
  sqlite: { src: sqliteLogo, color: '#4ea8d8' },
  supabase: { src: supabaseLogo, color: '#3ecf8e' },
  n8n: { src: n8nLogo, color: '#ea4b71' },
  ia: { src: iaGenerativaLogo, color: '#a78bfa' },
  apis: { src: apisLogo, color: '#22d3ee' },
  automatizacion: { src: automatizacionLogo, color: '#6366f1' },
} satisfies Record<string, TechnologyLogo>

type LogoKey = keyof typeof LOGOS

const ALIASES: Record<string, LogoKey> = {
  react: 'react',
  reactjs: 'react',
  javascript: 'javascript',
  js: 'javascript',
  typescript: 'typescript',
  ts: 'typescript',
  html: 'html',
  html5: 'html',
  css: 'css',
  css3: 'css',
  tailwind: 'tailwind',
  tailwindcss: 'tailwind',
  laravel: 'laravel',
  node: 'nodejs',
  nodejs: 'nodejs',
  net: 'dotnet',
  dotnet: 'dotnet',
  dotnetcore: 'dotnet',
  java: 'java',
  openjdk: 'java',
  python: 'python',
  postgres: 'postgresql',
  postgresql: 'postgresql',
  mysql: 'mysql',
  sqlite: 'sqlite',
  supabase: 'supabase',
  n8n: 'n8n',
  ia: 'ia',
  iagenerativa: 'ia',
  inteligenciaartificial: 'ia',
  ai: 'ia',
  openai: 'ia',
  api: 'apis',
  apis: 'apis',
  restapi: 'apis',
  webhook: 'apis',
  webhooks: 'apis',
  automatizacion: 'automatizacion',
  automatizaciones: 'automatizacion',
  automation: 'automatizacion',
  workflow: 'automatizacion',
}

/** Reduce un nombre a un slug sin acentos ni símbolos: "Node.js" -> "nodejs". */
function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

/**
 * Resuelve el logo oficial a partir del icono configurado en el panel
 * (`icon`) o, si no existe, del nombre de la tecnología.
 */
export function resolveTechnologyLogo({
  name,
  icon,
}: {
  name: string
  icon?: string | null
}): TechnologyLogo | null {
  for (const candidate of [icon, name]) {
    if (!candidate) continue
    const key = ALIASES[slugify(candidate)]
    if (key) return LOGOS[key]
  }
  return null
}
