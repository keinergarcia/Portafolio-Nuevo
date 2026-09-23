/* oxlint-disable react/set-state-in-effect, react/refs -- carga asíncrona y lectura de ref en handlers de registro */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Pencil, Plus, Sparkles, Trash2 } from 'lucide-react'
import {
  createCategory,
  createService,
  deleteCategory,
  deleteService,
  fetchCategories,
  fetchServices,
  updateCategory,
  updateService,
} from '@/services/supabase/admin'
import type { Service, ServiceCategory } from '@/types'
import { AdminHeader } from '../parts/AdminHeader'
import { Modal } from '@/components/ui/Modal'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'

const categorySchema = z.object({
  name: z.string().trim().min(3, 'El nombre es obligatorio'),
  slug: z
    .string()
    .trim()
    .min(3, 'El slug es obligatorio')
    .regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  description: z.string(),
  icon: z.string(),
  sort_order: z.coerce.number().int().min(0),
  is_active: z.boolean(),
})

type CategoryValues = z.infer<typeof categorySchema>

const serviceSchema = z.object({
  title: z.string().trim().min(3, 'El título es obligatorio'),
  slug: z
    .string()
    .trim()
    .min(3, 'El slug es obligatorio')
    .regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  description: z.string(),
  is_featured: z.boolean(),
  sort_order: z.coerce.number().int().min(0),
  is_active: z.boolean(),
})

type ServiceValues = z.infer<typeof serviceSchema>

function toSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function Services() {
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [categoryModal, setCategoryModal] = useState<{ open: boolean; editing?: ServiceCategory | null }>({ open: false, editing: null })
  const [serviceModal, setServiceModal] = useState<{ open: boolean; editing?: Service | null; categoryId: string }>({ open: false, editing: null, categoryId: '' })

  const load = useCallback(async () => {
    try {
      const [nextCategories, nextServices] = await Promise.all([fetchCategories(), fetchServices()])
      setCategories(nextCategories)
      setServices(nextServices)
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los servicios')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const removeCategory = async (category: ServiceCategory) => {
    if (!window.confirm(`¿Eliminar la categoría «${category.name}» y todos sus servicios?`)) return
    try {
      await deleteCategory(category.id)
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo eliminar la categoría')
    }
  }

  const removeService = async (service: Service) => {
    if (!window.confirm(`¿Eliminar el servicio «${service.title}»?`)) return
    try {
      await deleteService(service.id)
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo eliminar el servicio')
    }
  }

  return (
    <div className="shell section-pad">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <AdminHeader
          eyebrow="Servicios"
          title="Gestionar servicios"
          description="Organiza las categorías y los servicios que ofreces."
        />
        <Button onClick={() => setCategoryModal({ open: true, editing: null })}>
          <Plus className="h-4 w-4" /> Nueva categoría
        </Button>
      </div>

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-16 flex justify-center text-primary">
          <Spinner className="h-8 w-8" label="Cargando servicios" />
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-4">
          {categories.map((category) => {
            const categoryServices = services.filter((service) => service.category_id === category.id)
            return (
              <section key={category.id} className="glass rounded-2xl">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] p-5">
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-tertiary/20 text-primary">
                      <Sparkles className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h2 className="flex flex-wrap items-center gap-2 font-display text-lg font-bold tracking-tight">
                        {category.name}
                        {!category.is_active && <span className="text-xs font-normal text-muted">(oculta)</span>}
                      </h2>
                      {category.description && (
                        <p className="mt-0.5 truncate text-sm text-muted">{category.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-mono text-xs text-muted">#{category.sort_order} · {categoryServices.length} servicios</span>
                    <button
                      type="button"
                      onClick={() => setCategoryModal({ open: true, editing: category })}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-muted transition hover:border-white/25 hover:text-foreground"
                      aria-label={`Editar ${category.name}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void removeCategory(category)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-red-400/20 text-red-400 transition hover:bg-red-400/10"
                      aria-label={`Eliminar ${category.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    {categoryServices.length === 0 && (
                      <p className="w-full text-sm text-muted">Sin servicios todavía.</p>
                    )}
                    {categoryServices.map((service) => (
                      <span
                        key={service.id}
                        className={cn(
                          'inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm',
                          !service.is_active ? 'border-white/10 text-muted/60' : 'border-white/[0.08] bg-white/[0.03] text-foreground',
                        )}
                      >
                        {service.title}
                        {service.is_featured && <span className="text-primary">★</span>}
                        <button
                          type="button"
                          onClick={() => setServiceModal({ open: true, editing: service, categoryId: category.id })}
                          className="rounded-md p-0.5 text-muted transition hover:text-foreground"
                          aria-label={`Editar ${service.title}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void removeService(service)}
                          className="rounded-md p-0.5 text-muted transition hover:text-red-400"
                          aria-label={`Eliminar ${service.title}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setServiceModal({ open: true, editing: null, categoryId: category.id })}
                    >
                      <Plus className="h-3.5 w-3.5" /> Servicio
                    </Button>
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      )}

      <CategoryModal
        open={categoryModal.open}
        editing={categoryModal.editing}
        onClose={() => setCategoryModal({ open: false, editing: null })}
        onSaved={() => {
          setCategoryModal({ open: false, editing: null })
          void load()
        }}
      />

      <ServiceModal
        open={serviceModal.open}
        editing={serviceModal.editing}
        categoryId={serviceModal.categoryId}
        onClose={() => setServiceModal({ open: false, editing: null, categoryId: '' })}
        onSaved={() => {
          setServiceModal({ open: false, editing: null, categoryId: '' })
          void load()
        }}
      />
    </div>
  )
}

function CategoryModal({
  open,
  editing,
  onClose,
  onSaved,
}: {
  open: boolean
  editing?: ServiceCategory | null
  onClose: () => void
  onSaved: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CategoryValues>({
    mode: 'onBlur',
    defaultValues: { name: '', slug: '', description: '', icon: '', sort_order: 0, is_active: true },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: editing?.name ?? '',
        slug: editing?.slug ?? '',
        description: editing?.description ?? '',
        icon: editing?.icon ?? '',
        sort_order: editing?.sort_order ?? 0,
        is_active: editing?.is_active ?? true,
      })
      setError(null)
    }
  }, [open, editing, reset])

  const slugTouched = useRef(false)

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        name: values.name,
        slug: values.slug,
        description: values.description || null,
        icon: values.icon || null,
        sort_order: values.sort_order,
        is_active: values.is_active,
      }
      if (editing) await updateCategory(editing.id, payload)
      else await createCategory(payload)
      onSaved()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar la categoría')
    } finally {
      setSaving(false)
    }
  })

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar categoría' : 'Nueva categoría'}>
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Field label="Nombre" required error={errors.name?.message}>
          <Input
            placeholder="Desarrollo Web"
            {...register('name', {
              onChange: (event) => {
                if (!slugTouched.current) setValue('slug', toSlug(event.target.value))
              },
            })}
          />
        </Field>
        <Field label="Slug" required error={errors.slug?.message}>
          <Input
            placeholder="desarrollo-web"
            {...register('slug', {
              onChange: () => {
                slugTouched.current = true
              },
            })}
          />
        </Field>
        <Field label="Descripción" error={errors.description?.message}>
          <Textarea rows={3} {...register('description')} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Ícono" hint="globe, monitor, bot, wrench" error={errors.icon?.message}>
            <Input placeholder="globe" {...register('icon')} />
          </Field>
          <Field label="Orden" error={errors.sort_order?.message}>
            <Input type="number" placeholder="0" {...register('sort_order')} />
          </Field>
        </div>
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

function ServiceModal({
  open,
  editing,
  categoryId,
  onClose,
  onSaved,
}: {
  open: boolean
  editing?: Service | null
  categoryId: string
  onClose: () => void
  onSaved: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ServiceValues>({
    mode: 'onBlur',
    defaultValues: { title: '', slug: '', description: '', is_featured: false, sort_order: 0, is_active: true },
  })

  useEffect(() => {
    if (open) {
      reset({
        title: editing?.title ?? '',
        slug: editing?.slug ?? '',
        description: editing?.description ?? '',
        is_featured: editing?.is_featured ?? false,
        sort_order: editing?.sort_order ?? 0,
        is_active: editing?.is_active ?? true,
      })
      setError(null)
    }
  }, [open, editing, reset])

  const slugTouched = useRef(false)

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        category_id: editing?.category_id ?? categoryId,
        title: values.title,
        slug: values.slug,
        description: values.description || null,
        icon: null,
        is_featured: values.is_featured,
        sort_order: values.sort_order,
        is_active: values.is_active,
      }
      if (editing) await updateService(editing.id, payload)
      else await createService(payload)
      onSaved()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar el servicio')
    } finally {
      setSaving(false)
    }
  })

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar servicio' : 'Nuevo servicio'}>
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Field label="Título" required error={errors.title?.message}>
          <Input
            placeholder="Landing pages"
            {...register('title', {
              onChange: (event) => {
                if (!slugTouched.current) setValue('slug', toSlug(event.target.value))
              },
            })}
          />
        </Field>
        <Field label="Slug" required error={errors.slug?.message}>
          <Input
            placeholder="landing-pages"
            {...register('slug', {
              onChange: () => {
                slugTouched.current = true
              },
            })}
          />
        </Field>
        <Field label="Descripción" error={errors.description?.message}>
          <Textarea rows={3} {...register('description')} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Orden" error={errors.sort_order?.message}>
            <Input type="number" placeholder="0" {...register('sort_order')} />
          </Field>
          <div className="flex items-end pb-1">
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-[#22d3ee]" {...register('is_featured')} />
              Destacado
            </label>
          </div>
        </div>
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