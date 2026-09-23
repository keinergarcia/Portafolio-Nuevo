/* oxlint-disable react/set-state-in-effect -- carga asíncrona de mensajes al montar */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Check, ChevronLeft, Inbox, Mail, Trash2 } from 'lucide-react'
import { deleteMessage, fetchMessages, updateMessageStatus } from '@/services/supabase/admin'
import type { ContactMessage } from '@/types'
import { AdminHeader } from '../parts/AdminHeader'
import { MessageRow } from '../parts/MessageRow'
import { formatDateTime } from '../parts/date'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'

const STATUS_TABS = [
  { value: '', label: 'Todas' },
  { value: 'new', label: 'Nuevas' },
  { value: 'read', label: 'Leídas' },
  { value: 'replied', label: 'Respondidas' },
  { value: 'archived', label: 'Archivadas' },
] as const

export function Messages() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeStatus = searchParams.get('status') ?? ''
  const selectedId = searchParams.get('id')
  const [messages, setMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (status = activeStatus) => {
    setLoading(true)
    try {
      setMessages(await fetchMessages(status || undefined))
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los mensajes')
    } finally {
      setLoading(false)
    }
  }, [activeStatus])

  useEffect(() => {
    void load()
  }, [load])

  const selected = useMemo(
    () => messages.find((message) => message.id === selectedId) ?? null,
    [messages, selectedId],
  )

  const changeStatus = async (status: string) => {
    if (!selected) return
    try {
      await updateMessageStatus(selected.id, status)
      setMessages((current) =>
        current.map((message) =>
          message.id === selected.id ? { ...message, status } : message,
        ),
      )
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo actualizar el estado')
    }
  }

  const remove = async () => {
    if (!selected) return
    if (!window.confirm('¿Eliminar este mensaje de forma permanente?')) return
    try {
      await deleteMessage(selected.id)
      setMessages((current) => current.filter((message) => message.id !== selected.id))
      setSearchParams({ status: activeStatus }, { replace: true })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo eliminar el mensaje')
    }
  }

  const setTab = (status: string) => {
    const params: Record<string, string> = {}
    if (status) params.status = status
    setSearchParams(params, { replace: true })
  }

  return (
    <div className="shell section-pad">
      <AdminHeader
        eyebrow="Mensajes"
        title="Bandeja de contacto"
        description="Mensajes enviados desde el formulario de contacto del sitio."
      />

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        {STATUS_TABS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={cn(
              'rounded-xl border px-4 py-2 text-sm font-medium transition',
              activeStatus === value
                ? 'border-primary/40 bg-primary/15 text-primary'
                : 'border-white/10 text-muted hover:border-white/20 hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-16 flex justify-center text-primary">
          <Spinner className="h-8 w-8" label="Cargando mensajes" />
        </div>
      ) : selectedId && selected ? (
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setSearchParams({ status: activeStatus }, { replace: true })}
            className="mb-5 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" /> Volver a la bandeja
          </button>

          <article className="glass rounded-2xl p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight">{selected.name}</h2>
                <p className="mt-1 font-mono text-sm text-muted">{selected.email}</p>
                {selected.phone && (
                  <p className="mt-0.5 font-mono text-sm text-muted">{selected.phone}</p>
                )}
                {selected.service_type && (
                  <p className="mt-2 text-sm text-primary">{selected.service_type}</p>
                )}
                <p className="mt-2 font-mono text-xs text-muted">{formatDateTime(selected.created_at)}</p>
              </div>
            </div>

            <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
              {selected.message}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/[0.06] pt-6">
              {selected.status !== 'new' && (
                <Button size="sm" onClick={() => void changeStatus('new')}>
                  <Mail className="h-4 w-4" /> Marcar como nueva
                </Button>
              )}
              {selected.status !== 'read' && (
                <Button size="sm" variant="secondary" onClick={() => void changeStatus('read')}>
                  <Check className="h-4 w-4" /> Marcar como leída
                </Button>
              )}
              {selected.status !== 'replied' && (
                <Button size="sm" variant="secondary" onClick={() => void changeStatus('replied')}>
                  Respondida
                </Button>
              )}
              {selected.status !== 'archived' && (
                <Button size="sm" variant="secondary" onClick={() => void changeStatus('archived')}>
                  Archivar
                </Button>
              )}
              <Button size="sm" variant="outline" className="ml-auto text-red-400" onClick={() => void remove()}>
                <Trash2 className="h-4 w-4" /> Eliminar
              </Button>
            </div>
          </article>
        </div>
      ) : (
        <div className="mt-8">
          {messages.length === 0 ? (
            <div className="glass mt-6 flex items-center gap-3 rounded-2xl p-6 text-sm text-muted">
              <Inbox className="h-5 w-5" />
              No hay mensajes con este filtro.
            </div>
          ) : (
            <ul className="space-y-3">
              {messages.map((message) => (
                <MessageRow key={message.id} message={message} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}