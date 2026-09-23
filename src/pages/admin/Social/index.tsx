/* oxlint-disable react/set-state-in-effect -- carga asíncrona y sincronización del modal con datos */
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Link2, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  createSocialLink,
  deleteSocialLink,
  fetchSocialLinksAdmin,
  updateSocialLink,
} from '@/services/supabase/admin'
import type { SocialLink } from '@/types'
import { AdminHeader } from '../parts/AdminHeader'
import { Modal } from '@/components/ui/Modal'
import { Field, Input } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'

const PLATFORMS = [
  'whatsapp',
  'github',
  'linkedin',
  'instagram',
  'twitter',
  'tiktok',
  'youtube',
  'facebook',
]

const socialSchema = z.object({
  platform: z.string().min(1, 'Selecciona una plataforma'),
  url: z.string().trim().min(1, 'La URL es obligatoria'),
  sort_order: z.coerce.number().int().min(0),
  is_active: z.boolean(),
  icon: z.string(),
})

type SocialValues = z.infer<typeof socialSchema>

export function Social() {
  const [links, setLinks] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<{ open: boolean; editing?: SocialLink | null }>({ open: false, editing: null })

  const load = useCallback(async () => {
    try {
      setLinks(await fetchSocialLinksAdmin())
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los enlaces')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const remove = async (link: SocialLink) => {
    if (!window.confirm(`¿Eliminar el enlace de ${link.platform}?`)) return
    try {
      await deleteSocialLink(link.id)
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo eliminar el enlace')
    }
  }

  return (
    <div className="shell section-pad">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <AdminHeader
          eyebrow="Enlaces sociales"
          title="Redes y contacto"
          description="Reemplaza los enlaces «TODO» por tus URLs reales. Se muestran en el pie de página y en el formulario de contacto."
        />
        <Button onClick={() => setModal({ open: true, editing: null })}>
          <Plus className="h-4 w-4" /> Nuevo enlace
        </Button>
      </div>

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-16 flex justify-center text-primary">
          <Spinner className="h-8 w-8" label="Cargando enlaces" />
        </div>
      ) : links.length === 0 ? (
        <div className="glass mt-8 flex items-center gap-3 rounded-2xl p-6 text-sm text-muted">
          <Link2 className="h-5 w-5" />
          Aún no hay enlaces sociales.
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {links.map((link) => (
            <div key={link.id} className="glass flex items-center gap-4 rounded-2xl p-5">
              <span
                className={cn(
                  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
                  'bg-gradient-to-br from-primary/20 to-tertiary/20 text-primary',
                )}
              >
                <Link2 className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 font-medium capitalize text-foreground">
                  {link.platform}
                  {!link.is_active && <span className="text-xs font-normal text-muted">(oculto)</span>}
                </p>
                <p className="truncate font-mono text-xs text-muted">
                  {link.url === 'TODO' ? 'URL pendiente' : link.url}
                </p>
              </div>
              <span className="hidden font-mono text-xs text-muted sm:block">#{link.sort_order}</span>
              <div className="flex shrink-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModal({ open: true, editing: link })}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-muted transition hover:border-white/25 hover:text-foreground"
                  aria-label={`Editar enlace de ${link.platform}`}
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => void remove(link)}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-400/20 text-red-400 transition hover:bg-red-400/10"
                  aria-label={`Eliminar enlace de ${link.platform}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <SocialModal
        open={modal.open}
        editing={modal.editing}
        existing={links}
        onClose={() => setModal({ open: false, editing: null })}
        onSaved={() => {
          setModal({ open: false, editing: null })
          void load()
        }}
      />
    </div>
  )
}

function SocialModal({
  open,
  editing,
  existing,
  onClose,
  onSaved,
}: {
  open: boolean
  editing?: SocialLink | null
  existing: SocialLink[]
  onClose: () => void
  onSaved: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SocialValues>({
    mode: 'onBlur',
    defaultValues: { platform: 'whatsapp', url: '', sort_order: 0, is_active: true, icon: '' },
  })

  useEffect(() => {
    if (open) {
      reset({
        platform: editing?.platform ?? 'whatsapp',
        url: editing?.url ?? '',
        sort_order: editing?.sort_order ?? existing.length,
        is_active: editing?.is_active ?? true,
        icon: editing?.icon ?? '',
      })
      setError(null)
    }
  }, [open, editing, existing.length, reset])

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        platform: values.platform,
        url: values.url,
        sort_order: values.sort_order,
        is_active: values.is_active,
        icon: values.icon || null,
      }
      if (editing) await updateSocialLink(editing.id, payload)
      else await createSocialLink(payload)
      onSaved()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar el enlace')
    } finally {
      setSaving(false)
    }
  })

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar enlace' : 'Nuevo enlace'}>
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Plataforma" required error={errors.platform?.message}>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-foreground transition focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                {...register('platform')}
              >
                {PLATFORMS.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </div>
          </Field>
          <Field label="Orden" error={errors.sort_order?.message}>
            <Input type="number" placeholder="0" {...register('sort_order')} />
          </Field>
        </div>
        <Field label="URL" required error={errors.url?.message}>
          <Input placeholder="https://github.com/tuusuario" {...register('url')} />
        </Field>
        <Field label="Ícono" hint="Opcional" error={errors.icon?.message}>
          <Input placeholder="github" {...register('icon')} />
        </Field>
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-[#22d3ee]" {...register('is_active')} />
          Activo
        </label>
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Spinner /> : 'Guardar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}