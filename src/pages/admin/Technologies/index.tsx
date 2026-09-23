/* oxlint-disable react/set-state-in-effect -- carga asíncrona y sincronización del modal con datos */
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react'
import {
  createTechnology,
  deleteTechnology,
  fetchAllTechnologies,
  updateTechnology,
} from '@/services/supabase/admin'
import type { Technology } from '@/types'
import { AdminHeader } from '../parts/AdminHeader'
import { Modal } from '@/components/ui/Modal'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'

const TECH_CATEGORIES = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'database', label: 'Bases de datos' },
  { value: 'ia-automatizacion', label: 'IA y automatización' },
] as const

const technologySchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  category: z.string().min(1, 'Selecciona una categoría'),
  level: z
    .preprocess((value) => (value === '' ? null : value), z.number().int().min(0).max(100).nullable()),
  sort_order: z.coerce.number().int().min(0),
  is_active: z.boolean(),
  icon: z.string(),
  description: z.string(),
})

type TechnologyValues = z.infer<typeof technologySchema>

export function Technologies() {
  const [technologies, setTechnologies] = useState<Technology[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<{ open: boolean; editing?: Technology | null }>({ open: false, editing: null })

  const load = useCallback(async () => {
    try {
      setTechnologies(await fetchAllTechnologies())
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar las tecnologías')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const remove = async (technology: Technology) => {
    if (!window.confirm(`¿Eliminar la tecnología «${technology.name}»?`)) return
    try {
      await deleteTechnology(technology.id)
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo eliminar la tecnología')
    }
  }

  const groups = TECH_CATEGORIES.map(({ value, label }) => ({
    value,
    label,
    items: technologies
      .filter((technology) => technology.category === value)
      .sort((a, b) => a.sort_order - b.sort_order),
  }))

  return (
    <div className="shell section-pad">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <AdminHeader
          eyebrow="Tecnologías"
          title="Stack tecnológico"
          description="El conjunto de tecnologías que se muestra en la sección de habilidades."
        />
        <Button onClick={() => setModal({ open: true, editing: null })}>
          <Plus className="h-4 w-4" /> Nueva tecnología
        </Button>
      </div>

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-16 flex justify-center text-primary">
          <Spinner className="h-8 w-8" label="Cargando tecnologías" />
        </div>
      ) : (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {groups.map((group) => (
            <section key={group.value} className="glass rounded-2xl p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
                <Tags className="h-4.5 w-4.5 text-primary" />
                {group.label}
                <span className="font-mono text-xs font-normal text-muted">{group.items.length}</span>
              </h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.items.length === 0 && (
                  <p className="text-sm text-muted">Sin tecnologías en esta categoría.</p>
                )}
                {group.items.map((technology) => (
                  <span
                    key={technology.id}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm',
                      !technology.is_active ? 'border-white/10 text-muted/60' : 'border-white/[0.08] bg-white/[0.03] text-foreground',
                    )}
                  >
                    {technology.name}
                    {technology.level !== null && (
                      <span className="font-mono text-xs text-muted">{technology.level}%</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setModal({ open: true, editing: technology })}
                      className="rounded-md p-0.5 text-muted transition hover:text-foreground"
                      aria-label={`Editar ${technology.name}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(technology)}
                      className="rounded-md p-0.5 text-muted transition hover:text-red-400"
                      aria-label={`Eliminar ${technology.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <TechnologyModal
        open={modal.open}
        editing={modal.editing}
        onClose={() => setModal({ open: false, editing: null })}
        onSaved={() => {
          setModal({ open: false, editing: null })
          void load()
        }}
      />
    </div>
  )
}

function TechnologyModal({
  open,
  editing,
  onClose,
  onSaved,
}: {
  open: boolean
  editing?: Technology | null
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
  } = useForm<TechnologyValues>({
    mode: 'onBlur',
    defaultValues: { name: '', category: 'frontend', level: null, sort_order: 0, is_active: true, icon: '', description: '' },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: editing?.name ?? '',
        category: editing?.category ?? 'frontend',
        level: editing?.level ?? null,
        sort_order: editing?.sort_order ?? 0,
        is_active: editing?.is_active ?? true,
        icon: editing?.icon ?? '',
        description: editing?.description ?? '',
      })
      setError(null)
    }
  }, [open, editing, reset])

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: values.name,
        category: values.category,
        level: values.level,
        sort_order: values.sort_order,
        is_active: values.is_active,
        icon: values.icon || null,
        description: values.description || null,
      }
      if (editing) await updateTechnology(editing.id, payload)
      else await createTechnology(payload)
      onSaved()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar la tecnología')
    } finally {
      setSaving(false)
    }
  })

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar tecnología' : 'Nueva tecnología'}>
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nombre" required error={errors.name?.message}>
            <Input placeholder="React" {...register('name')} />
          </Field>
          <Field label="Categoría" required error={errors.category?.message}>
            <Select {...register('category')}>
              {TECH_CATEGORIES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nivel (%)" hint="Opcional, 0–100" error={errors.level?.message}>
            <Input
              type="number"
              min={0}
              max={100}
              placeholder="—"
              {...register('level', { valueAsNumber: true })}
            />
          </Field>
          <Field label="Orden" error={errors.sort_order?.message}>
            <Input type="number" placeholder="0" {...register('sort_order')} />
          </Field>
        </div>
        <Field label="Ícono" hint="Opcional" error={errors.icon?.message}>
          <Input placeholder="react" {...register('icon')} />
        </Field>
        <Field label="Descripción" hint="Opcional" error={errors.description?.message}>
          <Textarea rows={3} {...register('description')} />
        </Field>
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-[#22d3ee]" {...register('is_active')} />
          Activa
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