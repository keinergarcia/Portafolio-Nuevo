/* oxlint-disable react/incompatible-library, react/set-state-in-effect -- RHF watch para vista previa y carga asíncrona del proyecto */
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import { z } from 'zod'
import { ArrowLeft, ChevronLeft, ImagePlus, Save, Trash2 } from 'lucide-react'
import {
  addProjectImage,
  createProject,
  deleteProjectImage,
  fetchAllTechnologies,
  fetchProjectImages,
  fetchProjectTechnologyIds,
  fetchProjects,
  setProjectTechnologies,
  updateProject,
  uploadPublicFile,
  buildStoragePath,
} from '@/services/supabase/admin'
import type { Project, ProjectImage, Technology } from '@/types'
import { AdminHeader } from '../parts/AdminHeader'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'

const projectSchema = z.object({
  title: z.string().trim().min(3, 'El título es obligatorio'),
  slug: z
    .string()
    .trim()
    .min(3, 'El slug es obligatorio')
    .regex(/^[a-z0-9-]+$/, 'Solo minúsculas, números y guiones'),
  short_description: z.string().trim(),
  description: z.string(),
  problem: z.string(),
  solution: z.string(),
  features: z.string(),
  results: z.string(),
  category: z.string(),
  status: z.enum(['draft', 'published', 'archived']),
  featured: z.boolean(),
  cover_image: z.string(),
  github_url: z.string(),
  demo_url: z.string(),
  sort_order: z.coerce.number().int().min(0),
})

type ProjectFormValues = z.infer<typeof projectSchema>

function splitLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
}

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

export function ProjectForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)
  const [project, setProject] = useState<Project | null>(null)
  const [technologies, setTechnologies] = useState<Technology[]>([])
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>([])
  const [images, setImages] = useState<ProjectImage[]>([])
  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<'cover' | 'gallery' | null>(null)
  const [galleryUrl, setGalleryUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    mode: 'onBlur',
    defaultValues: {
      title: '',
      slug: '',
      short_description: '',
      description: '',
      problem: '',
      solution: '',
      features: '',
      results: '',
      category: '',
      status: 'draft',
      featured: false,
      cover_image: '',
      github_url: '',
      demo_url: '',
      sort_order: 0,
    },
  })

  useEffect(() => {
    let active = true
    void (async () => {
      try {
        if (!isEditing) {
          setTechnologies(await fetchAllTechnologies())
          return
        }
        const [found, techs, techIds, projectImages] = await Promise.all([
          fetchProjects().then((all) => all.find((item) => item.id === id) ?? null),
          fetchAllTechnologies(),
          fetchProjectTechnologyIds(id!),
          fetchProjectImages(id!),
        ])
        if (!active) return
        setTechnologies(techs)
        setSelectedTechIds(techIds)
        setImages(projectImages)
        setProject(found)
        if (found) {
          setValue('title', found.title)
          setValue('slug', found.slug)
          setValue('short_description', found.short_description ?? '')
          setValue('description', found.description ?? '')
          setValue('problem', found.problem ?? '')
          setValue('solution', found.solution ?? '')
          setValue('features', (found.features ?? []).join('\n'))
          setValue('results', (found.results ?? []).join('\n'))
          setValue('category', found.category ?? '')
          setValue('status', found.status)
          setValue('featured', found.featured)
          setValue('cover_image', found.cover_image ?? '')
          setValue('github_url', found.github_url ?? '')
          setValue('demo_url', found.demo_url ?? '')
          setValue('sort_order', found.sort_order)
        }
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'No se pudo cargar el proyecto')
      } finally {
        setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [id, isEditing, setValue])

  const slugTouched = useRef(false)

  const onTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value
    setValue('title', next)
    if (!slugTouched.current) {
      setValue('slug', toSlug(next))
    }
  }

  const toggleTechnology = (technologyId: string) => {
    setSelectedTechIds((current) =>
      current.includes(technologyId)
        ? current.filter((item) => item !== technologyId)
        : [...current, technologyId],
    )
  }

  const uploadCover = async (file: File | undefined) => {
    if (!file) return
    setUploading('cover')
    try {
      const url = await uploadPublicFile('portfolio', buildStoragePath('covers', file.name), file)
      setValue('cover_image', url, { shouldDirty: true })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo subir la imagen')
    } finally {
      setUploading(null)
    }
  }

  const uploadGallery = async (file: File | undefined) => {
    if (!file || !project) return
    setUploading('gallery')
    try {
      const url = await uploadPublicFile('portfolio', buildStoragePath('projects', file.name), file)
      await addProjectImage(project.id, url)
      setImages(await fetchProjectImages(project.id))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo subir la imagen')
    } finally {
      setUploading(null)
    }
  }

  const addGalleryByUrl = async () => {
    if (!project || !galleryUrl.trim()) return
    try {
      await addProjectImage(project.id, galleryUrl.trim())
      setImages(await fetchProjectImages(project.id))
      setGalleryUrl('')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo agregar la imagen')
    }
  }

  const removeImage = async (image: ProjectImage) => {
    try {
      await deleteProjectImage(image.id)
      setImages((current) => current.filter((item) => item.id !== image.id))
      if (project?.cover_image === image.url) setValue('cover_image', '')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo eliminar la imagen')
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true)
    setError(null)
    try {
      const payload = {
        title: values.title,
        slug: values.slug,
        short_description: values.short_description || null,
        description: values.description || null,
        problem: values.problem || null,
        solution: values.solution || null,
        features: splitLines(values.features),
        results: splitLines(values.results),
        category: values.category || null,
        status: values.status,
        featured: values.featured,
        cover_image: values.cover_image || null,
        github_url: values.github_url || null,
        demo_url: values.demo_url || null,
        sort_order: values.sort_order,
      }
      let projectId = id
      if (isEditing && id) {
        await updateProject(id, payload)
      } else {
        const created = await createProject(payload)
        projectId = created.id
      }
      if (projectId) await setProjectTechnologies(projectId, selectedTechIds)
      if (!isEditing && galleryUrl.trim()) {
        await addProjectImage(projectId!, galleryUrl.trim())
      }
      navigate('/admin/projects', { replace: true })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar el proyecto')
      setSaving(false)
    }
  })

  if (loading) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center text-primary">
        <Spinner className="h-8 w-8" label="Cargando proyecto" />
      </div>
    )
  }

  return (
    <div className="shell section-pad">
      <Link
        to="/admin/projects"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Volver a proyectos
      </Link>

      <AdminHeader
        eyebrow="Proyectos"
        title={isEditing ? 'Editar proyecto' : 'Nuevo proyecto'}
        description="Completa la información del proyecto. Todo se guarda en Supabase."
      />

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-8 space-y-6" noValidate>
        <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <section className="glass space-y-5 rounded-2xl p-6 sm:p-8">
            <h2 className="font-display text-lg font-bold tracking-tight">Información</h2>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Título" required error={errors.title?.message}>
                <Input placeholder="Nombre del proyecto" {...register('title')} onChange={onTitleChange} />
              </Field>
              <Field label="Slug" required error={errors.slug?.message}>
                <Input
                  placeholder="mi-proyecto"
                  {...register('slug', {
                    onChange: () => {
                      slugTouched.current = true
                    },
                  })}
                />
              </Field>
            </div>

            <Field label="Descripción corta" error={errors.short_description?.message}>
              <Textarea
                rows={3}
                placeholder="Resumen que aparece en las tarjetas del portafolio"
                {...register('short_description')}
              />
            </Field>

            <Field label="Descripción completa" error={errors.description?.message}>
              <Textarea rows={5} placeholder="Detalle del proyecto, alcance y contexto" {...register('description')} />
            </Field>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Problema" error={errors.problem?.message}>
                <Textarea rows={4} placeholder="¿Qué problema resolvía?" {...register('problem')} />
              </Field>
              <Field label="Solución" error={errors.solution?.message}>
                <Textarea rows={4} placeholder="¿Cómo se resolvió?" {...register('solution')} />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Funcionalidades (una por línea)" hint="Cada línea será un punto de la lista">
                <Textarea rows={5} placeholder={'Registro de usuarios\nPanel de métricas\n…'} {...register('features')} />
              </Field>
              <Field label="Resultados (uno por línea)" hint="Cada línea será un punto de la lista">
                <Textarea rows={5} placeholder={'30% menos de errores\nProceso 2x más rápido\n…'} {...register('results')} />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
              <Field label="Categoría" error={errors.category?.message}>
                <Input placeholder="Desarrollo Web" {...register('category')} />
              </Field>
              <Field label="Enlace GitHub" error={errors.github_url?.message}>
                <Input placeholder="https://github.com/…" {...register('github_url')} />
              </Field>
              <Field label="Demo en vivo" error={errors.demo_url?.message}>
                <Input placeholder="https://…" {...register('demo_url')} />
              </Field>
            </div>
          </section>

          <div className="space-y-6">
            <section className="glass space-y-5 rounded-2xl p-6 sm:p-8">
              <h2 className="font-display text-lg font-bold tracking-tight">Publicación</h2>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Estado" error={errors.status?.message}>
                  <Select {...register('status')}>
                    <option value="draft">Borrador</option>
                    <option value="published">Publicado</option>
                    <option value="archived">Archivado</option>
                  </Select>
                </Field>
                <Field label="Orden" hint="Menor = primero" error={errors.sort_order?.message}>
                  <Input type="number" placeholder="0" {...register('sort_order')} />
                </Field>
              </div>

              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-[#22d3ee]"
                  {...register('featured')}
                />
                <span>
                  Destacado
                  <span className="block text-xs text-muted">Se muestra con prioridad en la portada</span>
                </span>
              </label>
            </section>

            <section className="glass space-y-5 rounded-2xl p-6 sm:p-8">
              <h2 className="font-display text-lg font-bold tracking-tight">Imagen principal</h2>

              {watch('cover_image') && (
                <img
                  src={watch('cover_image')}
                  alt="Vista previa de la portada"
                  className="aspect-video w-full rounded-xl border border-white/10 object-cover"
                />
              )}

              <Field label="URL de la portada" hint="Sube un archivo o pega una URL" error={errors.cover_image?.message}>
                <div className="flex gap-2">
                  <Input placeholder="https://…" {...register('cover_image')} />
                  <label className="inline-flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-3 text-sm text-muted transition hover:border-white/25 hover:text-foreground">
                    {uploading === 'cover' ? <Spinner className="h-4 w-4" /> : <ImagePlus className="h-4 w-4" />}
                    Subir
                    <input type="file" accept="image/*" className="sr-only" onChange={(event) => void uploadCover(event.target.files?.[0])} />
                  </label>
                </div>
              </Field>
            </section>

            <section className="glass space-y-5 rounded-2xl p-6 sm:p-8">
              <h2 className="font-display text-lg font-bold tracking-tight">Tecnologías</h2>
              {technologies.length === 0 ? (
                <p className="text-sm text-muted">Aún no hay tecnologías registradas.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {technologies.map((technology) => {
                    const checked = selectedTechIds.includes(technology.id)
                    return (
                      <button
                        type="button"
                        key={technology.id}
                        onClick={() => toggleTechnology(technology.id)}
                        className={cn(
                          'rounded-xl border px-3 py-1.5 text-sm font-medium transition',
                          checked
                            ? 'border-primary/40 bg-primary/15 text-primary'
                            : 'border-white/10 text-muted hover:border-white/25 hover:text-foreground',
                        )}
                      >
                        {technology.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </section>
          </div>
        </div>

        {isEditing && (
          <section className="glass space-y-5 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold tracking-tight">Galería</h2>
              <span className="text-xs text-muted">{images.length} imagen(es)</span>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((image) => (
                  <div key={image.id} className="group relative aspect-video overflow-hidden rounded-xl border border-white/10">
                    <img src={image.url} alt={image.alt ?? ''} className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => void removeImage(image)}
                      className="absolute right-2 top-2 rounded-lg bg-black/70 p-1.5 text-red-400 opacity-0 transition group-hover:opacity-100"
                      aria-label="Eliminar imagen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Pegar URL de imagen"
                  value={galleryUrl}
                  onChange={(event) => setGalleryUrl(event.target.value)}
                />
                <Button type="button" variant="secondary" onClick={() => void addGalleryByUrl()}>
                  Agregar
                </Button>
              </div>
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-2.5 text-sm text-muted transition hover:border-primary/50 hover:text-foreground">
                {uploading === 'gallery' ? <Spinner className="h-4 w-4" /> : <ImagePlus className="h-4 w-4" />}
                Subir desde dispositivo
                <input type="file" accept="image/*" className="sr-only" onChange={(event) => void uploadGallery(event.target.files?.[0])} />
              </label>
            </div>
          </section>
        )}

        <div className="flex flex-wrap items-center gap-3 pb-10">
          <Button type="submit" size="lg" disabled={saving}>
            {saving ? (
              <>
                <Spinner /> Guardando…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Guardar proyecto
              </>
            )}
          </Button>
          <Button to="/admin/projects" size="lg" variant="ghost">
            <ArrowLeft className="h-4 w-4" /> Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}