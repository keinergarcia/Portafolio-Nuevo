export type PricingIcon = 'globe' | 'monitor' | 'bot' | 'wrench'

export type PricingUnit = 'mes' | 'hora'

export interface PricingItem {
  title: string
  amount: number
  unit?: PricingUnit
}

export interface PricingCategory {
  id: string
  slug: string
  name: string
  tagline: string
  icon: PricingIcon
  items: PricingItem[]
}

export interface PricingFrom {
  amount: number
  unit?: PricingUnit
}

/**
 * Tarifas de referencia en COP. Edita este archivo para actualizar los precios
 * sin tocar la interfaz: las tarjetas de la web se generan desde aquí.
 */
export const PRICING_CATEGORIES: PricingCategory[] = [
  {
    id: 'web',
    slug: 'desarrollo-web',
    name: 'Desarrollo web',
    tagline:
      'Sitios rápidos, responsivos y pensados para convertir visitas en clientes.',
    icon: 'globe',
    items: [
      { title: 'Landing Page', amount: 350000 },
      { title: 'Página web empresarial', amount: 600000 },
      { title: 'Tienda virtual', amount: 1200000 },
      { title: 'Catálogo digital de productos', amount: 250000 },
      { title: 'Mantenimiento web', amount: 100000, unit: 'mes' },
    ],
  },
  {
    id: 'software',
    slug: 'desarrollo-de-software',
    name: 'Desarrollo de software',
    tagline:
      'Herramientas a medida para ordenar, automatizar y hacer crecer tu operación.',
    icon: 'monitor',
    items: [
      { title: 'Aplicaciones de escritorio', amount: 600000 },
      { title: 'Sistemas de inventario', amount: 800000 },
      { title: 'Sistemas de gestión empresarial', amount: 1200000 },
      { title: 'Desarrollo de funcionalidades', amount: 150000 },
    ],
  },
  {
    id: 'automation',
    slug: 'automatizacion-e-integraciones',
    name: 'Automatización e integraciones',
    tagline:
      'Conecto tus herramientas y elimino tareas repetitivas con flujos confiables.',
    icon: 'bot',
    items: [
      { title: 'Automatización de procesos', amount: 250000 },
      { title: 'Integración de APIs', amount: 200000 },
      { title: 'Integración de WhatsApp Business', amount: 300000 },
      { title: 'Automatización con n8n', amount: 250000 },
    ],
  },
  {
    id: 'tech-services',
    slug: 'servicios-tecnologicos',
    name: 'Servicios tecnológicos',
    tagline:
      'Soporte puntual y acompañamiento técnico para mantener todo funcionando.',
    icon: 'wrench',
    items: [
      { title: 'Asesoría y soporte de software', amount: 50000, unit: 'hora' },
      { title: 'Corrección de errores', amount: 80000 },
      { title: 'Configuración y puesta en marcha', amount: 100000 },
    ],
  },
]

/**
 * Precio mínimo que se muestra en las tarjetas de la portada, asociado al slug
 * de la categoría que llega desde Supabase.
 */
export const PRICING_FROM_BY_CATEGORY: Record<string, PricingFrom> = {
  'desarrollo-web': { amount: 250000 },
  'aplicaciones-de-escritorio': { amount: 600000 },
  'automatizacion-e-ia': { amount: 200000 },
  'soporte-informatico': { amount: 50000, unit: 'hora' },
}

const copNumberFormat = new Intl.NumberFormat('es-CO', {
  maximumFractionDigits: 0,
})

export function formatCOP(amount: number): string {
  return `$${copNumberFormat.format(amount)}`
}

export function priceUnitLabel(unit?: PricingUnit): string {
  if (unit === 'mes') return '/mes'
  if (unit === 'hora') return '/hora'
  return ''
}

export function formatItemPrice(item: PricingItem): string {
  return item.unit
    ? `${formatCOP(item.amount)} COP/${item.unit}`
    : `${formatCOP(item.amount)} COP`
}
