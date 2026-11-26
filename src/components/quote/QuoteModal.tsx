import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  ArrowRight,
  Check,
  Clipboard,
  ClipboardCheck,
  Mail,
  MessageCircle,
  Phone,
  Send,
  type LucideIcon,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { usePortfolioData } from '@/contexts/PortfolioData'
import {
  formatCOP,
  formatItemPrice,
  PRICING_CATEGORIES,
  type PricingItem,
} from '@/lib/pricing'
import { cn } from '@/lib/utils'

interface QuoteItem extends PricingItem {
  key: string
  categoryId: string
  categoryName: string
}

const QUOTE_ITEMS: QuoteItem[] = PRICING_CATEGORIES.flatMap((category) =>
  category.items.map((item) => ({
    ...item,
    key: `${category.id}:${item.title}`,
    categoryId: category.id,
    categoryName: category.name,
  })),
)

function buildQuoteMessage(items: QuoteItem[]): string {
  const lines = items.map(
    (item) => `• ${item.title} — desde ${formatItemPrice(item)}`,
  )
  const projectTotal = items
    .filter((item) => !item.unit)
    .reduce((total, item) => total + item.amount, 0)
  const hasRecurring = items.some((item) => item.unit)

  const message = ['Hola, quiero cotizar los siguientes servicios:', '', ...lines]

  if (projectTotal > 0) {
    message.push(
      '',
      `Total de referencia (proyectos): desde ${formatCOP(projectTotal)} COP.`,
    )
  }

  if (hasRecurring) {
    message.push(
      '',
      'Los servicios recurrentes se cobran según la periodicidad indicada.',
    )
  }

  message.push(
    '',
    'Los precios son tarifas iniciales de referencia; la cotización final depende del alcance, funcionalidades, tecnologías y tiempos de desarrollo.',
    '',
    '¿Me puedes contar cómo seguimos?',
  )

  return message.join('\n')
}

function withWhatsAppText(url: string, text: string): string {
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}text=${encodeURIComponent(text)}`
}

const channelClass =
  'flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-3 text-left transition-colors duration-200 hover:border-primary/30 hover:bg-primary/[0.06]'

function ChannelContent({
  icon: Icon,
  label,
  hint,
  arrow = true,
}: {
  icon: LucideIcon
  label: string
  hint: string
  arrow?: boolean
}) {
  return (
    <>
      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon size={17} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        <span className="mt-0.5 block truncate text-[11px] text-muted">{hint}</span>
      </span>
      {arrow && <ArrowRight size={14} className="shrink-0 text-muted" aria-hidden="true" />}
    </>
  )
}

interface QuoteModalProps {
  open: boolean
  onClose: () => void
  initialCategoryId?: string
}

export function QuoteModal({ open, onClose, initialCategoryId }: QuoteModalProps) {
  const { profile, socialLinks } = usePortfolioData()
  const navigate = useNavigate()
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const copyTimer = useRef<number | null>(null)
  const initialGroupRef = useRef<HTMLFieldSetElement | null>(null)

  const selectedItems = useMemo(
    () => QUOTE_ITEMS.filter((item) => selectedKeys.includes(item.key)),
    [selectedKeys],
  )
  const hasSelection = selectedItems.length > 0
  const quoteMessage = hasSelection ? buildQuoteMessage(selectedItems) : ''

  const email =
    profile.email && profile.email !== 'TODO' ? profile.email : null
  const phone =
    profile.phone && profile.phone !== 'TODO' ? profile.phone : null
  const whatsapp =
    socialLinks.find(
      (link) =>
        link.is_active &&
        link.platform === 'whatsapp' &&
        link.url &&
        link.url !== 'TODO',
    )?.url ?? null

  const mailtoHref =
    email && hasSelection
      ? `mailto:${email}?subject=${encodeURIComponent(
          'Solicitud de cotización de servicios',
        )}&body=${encodeURIComponent(quoteMessage)}`
      : null
  const phoneHref = phone
    ? `tel:${phone.replace(/[^\d+]/g, '')}`
    : null
  const whatsappHref =
    whatsapp && hasSelection ? withWhatsAppText(whatsapp, quoteMessage) : null

  useEffect(() => {
    if (!open || !initialCategoryId) return
    const frame = window.requestAnimationFrame(() => {
      initialGroupRef.current?.scrollIntoView({ block: 'nearest' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [open, initialCategoryId])

  useEffect(() => {
    return () => {
      if (copyTimer.current) window.clearTimeout(copyTimer.current)
    }
  }, [])

  const toggleItem = (key: string) => {
    setSelectedKeys((current) =>
      current.includes(key)
        ? current.filter((itemKey) => itemKey !== key)
        : [...current, key],
    )
  }

  const copyQuote = async () => {
    if (!hasSelection) return
    try {
      await navigator.clipboard.writeText(quoteMessage)
      setCopyStatus('copied')
      if (copyTimer.current) window.clearTimeout(copyTimer.current)
      copyTimer.current = window.setTimeout(() => setCopyStatus('idle'), 2400)
    } catch {
      setCopyStatus('error')
    }
  }

  const sendToForm = () => {
    if (!hasSelection) return
    navigate('/contact', {
      state: {
        quoteMessage,
        serviceType: 'Cotización personalizada',
      },
    })
    onClose()
  }

  const selectedCountLabel = `${selectedItems.length} ${
    selectedItems.length === 1 ? 'servicio seleccionado' : 'servicios seleccionados'
  }`

  return (
    <Modal open={open} onClose={onClose} title="Solicitar cotización" size="lg">
      <p className="text-sm leading-relaxed text-muted">
        Elige los servicios que necesitas y prepararé el resumen. Después decides
        por cuál canal enviarlo.
      </p>

      <p className="mt-5 font-mono text-[10px] tracking-[0.16em] text-primary/80 uppercase">
        1 · Elige los servicios
      </p>

      <div className="mt-3 max-h-[38vh] space-y-3 overflow-y-auto overscroll-contain pr-1 sm:max-h-[40vh]">
        {PRICING_CATEGORIES.map((category) => (
          <fieldset
            key={category.id}
            ref={category.id === initialCategoryId ? initialGroupRef : undefined}
            className={cn(
              'rounded-xl border border-white/[0.07] p-3',
              category.id === initialCategoryId &&
                'border-primary/25 bg-primary/[0.03]',
            )}
          >
            <legend className="px-1 font-mono text-[10px] tracking-[0.14em] text-muted uppercase">
              {category.name}
            </legend>
            <div className="mt-2 grid gap-1 sm:grid-cols-2">
              {category.items.map((item) => {
                const key = `${category.id}:${item.title}`
                const checked = selectedKeys.includes(key)
                return (
                  <label
                    key={key}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors duration-200 hover:bg-white/[0.04]',
                      checked
                        ? 'bg-primary/[0.07] text-foreground'
                        : 'text-muted',
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleItem(key)}
                      className="h-4 w-4 shrink-0 accent-[#22d3ee]"
                    />
                    <span className="min-w-0 flex-1 leading-snug">{item.title}</span>
                    <span className="shrink-0 font-mono text-[10px] text-muted tabular-nums">
                      {formatCOP(item.amount)}
                      {item.unit ? `/${item.unit}` : ''}
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
        <p className="flex items-center gap-2 text-xs text-muted" aria-live="polite">
          {hasSelection ? (
            <>
              <Check size={14} className="text-primary" aria-hidden="true" />
              {selectedCountLabel}
            </>
          ) : (
            'Selecciona al menos un servicio para continuar.'
          )}
        </p>
        {hasSelection && (
          <button
            type="button"
            onClick={() => setSelectedKeys([])}
            className="font-mono text-[10px] tracking-[0.14em] text-muted uppercase transition-colors hover:text-foreground"
          >
            Limpiar
          </button>
        )}
      </div>

      <p className="mt-5 font-mono text-[10px] tracking-[0.16em] text-primary/80 uppercase">
        2 · Elige cómo contactarme
      </p>

      {hasSelection ? (
        <>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {whatsappHref && (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className={channelClass}
              >
                <ChannelContent
                  icon={MessageCircle}
                  label="WhatsApp"
                  hint="Mensaje listo para enviar"
                />
              </a>
            )}

            {mailtoHref && (
              <a href={mailtoHref} className={channelClass}>
                <ChannelContent icon={Mail} label="Email" hint={email ?? ''} />
              </a>
            )}

            {phoneHref && (
              <a href={phoneHref} className={channelClass}>
                <ChannelContent icon={Phone} label="Llamar" hint={phone ?? ''} />
              </a>
            )}

            <button type="button" onClick={sendToForm} className={channelClass}>
              <ChannelContent
                icon={Send}
                label="Formulario web"
                hint="Te respondo desde el sitio"
              />
            </button>

            <button type="button" onClick={copyQuote} className={channelClass}>
              <ChannelContent
                icon={copyStatus === 'copied' ? ClipboardCheck : Clipboard}
                label={
                  copyStatus === 'copied'
                    ? 'Resumen copiado'
                    : copyStatus === 'error'
                      ? 'No se pudo copiar'
                      : 'Copiar resumen'
                }
                hint={
                  copyStatus === 'copied'
                    ? 'Pégalo en el canal que prefieras'
                    : copyStatus === 'error'
                      ? 'Selecciona el texto y cópialo manualmente'
                      : 'Para pegarlo en cualquier otro canal'
                }
                arrow={false}
              />
            </button>
          </div>

          <details className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
            <summary className="cursor-pointer font-mono text-[10px] tracking-[0.14em] text-muted uppercase transition-colors hover:text-foreground">
              Ver resumen del mensaje
            </summary>
            <p className="mt-3 text-xs leading-relaxed whitespace-pre-line text-muted">
              {quoteMessage}
            </p>
          </details>

          <p className="mt-3 text-[11px] leading-relaxed text-muted">
            No se envía nada automáticamente: se abre la aplicación que elijas con
            el resumen listo para que lo revises y lo envíes.
          </p>
        </>
      ) : (
        <p className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-xs text-muted">
          Primero selecciona uno o más servicios y aquí aparecerán los medios de
          contacto disponibles.
        </p>
      )}

      <p className="mt-5 border-t border-white/[0.06] pt-4 text-[11px] leading-relaxed text-muted">
        Precios de referencia en COP. La cotización final se ajusta al alcance y a
        los tiempos del proyecto.
      </p>
    </Modal>
  )
}
