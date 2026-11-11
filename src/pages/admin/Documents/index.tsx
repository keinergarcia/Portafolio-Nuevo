/* oxlint-disable react/set-state-in-effect -- carga asíncrona y sincronización del modal con datos */
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Award,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileText,
  GraduationCap,
  Pencil,
  Plus,
  ScrollText,
  Trash2,
  Upload,
} from 'lucide-react'
import {
  buildStoragePath,
  createDocument,
  deleteDocument,
  fetchDocuments,
  updateDocument,
  uploadPublicFile,
} from '@/services/supabase/admin'
import type { Document, DocumentKind } from '@/types'
import { AdminHeader } from '../parts/AdminHeader'
import { Modal } from '@/components/ui/Modal'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'

const MAX_FILE_BYTES = 15 * 1024 * 1024 // 15 MB

const KINDS: { value: DocumentKind; label: string }[] = [
  { value: 'cv', label: 'Hoja de vida (CV)' },
  { value: 'title', label: 'Título' },
  { value: 'certificate', label: 'Certificado' },
  { value: 'other', label: 'Otro documento' },
]

const KIND_META: Record<string, { label: string; icon: typeof FileText }> = {
  cv: { label: 'Hoja de vida', icon: ScrollText },
  title: { label: 'Título', icon: GraduationCap },
  certificate: { label: 'Certificado', icon: Award },
  other: { label: 'Documento', icon: FileText },
}

const ACCEPTED =
  '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.zip'

function formatBytes(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DocumentsAdmin() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [modal, setModal] = useState<{ open: boolean; editing?: Document | null }>({
    open: false,
    editing: null,
  })

  const load = useCallback(async () => {
    try {
      setDocuments(await fetchDocuments())
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los documentos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const toggleActive = async (document: Document) => {
    try {
      await updateDocument(document.id, { is_active: !document.is_active })
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo actualizar el documento')
    }
  }

  const remove = async (document: Document) => {
    if (!window.confirm(`¿Eliminar «${document.title}»? También se borra el archivo subido.`)) return
    try {
      await deleteDocument(document)
      await load()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo eliminar el documento')
    }
  }

  const copyLink = async (document: Document) => {
    try {
      await navigator.clipboard.writeText(document.file_url)
      setNotice('Enlace copiado al portapapeles.')
      setTimeout(() => setNotice(null), 2500)
    } catch {
      setError('No se pudo copiar el enlace.')
    }
  }

  return (
    <div className="shell section-pad">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <AdminHeader
          eyebrow="Documentos"
          title="Documentos y descargas"
          description="Sube tu hoja de vida, títulos y certificados. Lo que actives aquí aparecerá en la sección pública de descargas."
        />
        <Button onClick={() => setModal({ open: true, editing: null })}>
          <Plus className="h-4 w-4" /> Subir documento
        </Button>
      </div>

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {notice && (
        <div role="status" className="mt-6 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary">
          {notice}
        </div>
      )}

      {loading ? (
        <div className="mt-16 flex justify-center text-primary">
          <Spinner className="h-8 w-8" label="Cargando documentos" />
        </div>
      ) : documents.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6 py-10 text-center">
          <Upload className="mx-auto h-8 w-8 text-muted" aria-hidden="true" />
          <p className="mt-4 text-sm text-muted">
            Aún no hay documentos. Sube tu hoja de vida, títulos o certificados con el botón
            «Subir documento».
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {documents.map((document) => {
            const meta = KIND_META[document.kind] ?? KIND_META.other
            const Icon = meta.icon
            return (
              <div
                key={document.id}
                className={cn(
                  'glass flex flex-wrap items-center gap-4 rounded-2xl p-4 sm:p-5',
                  !document.is_active && 'opacity-60',
                )}
              >
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-br from-primary/15 to-tertiary/15 text-primary">
                  <Icon size={20} aria-hidden="true" />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{document.title}</p>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 font-mono text-xs text-muted">
                    <span>{meta.label}</span>
                    <span>{formatBytes(document.file_size)}</span>
                    <span className="inline-flex items-center gap-1">
                      <Download size={12} aria-hidden="true" />
                      {document.downloads} descargas
                    </span>
                    {!document.is_active && <span className="text-yellow-400">oculto</span>}
                  </p>
                  {document.description && (
                    <p className="mt-1 truncate text-sm text-muted">{document.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => void copyLink(document)}
                    className="rounded-lg p-2 text-muted transition hover:bg-white/[0.06] hover:text-foreground"
                    aria-label={`Copiar enlace de ${document.title}`}
                    title="Copiar enlace"
                  >
                    <Copy size={16} />
                  </button>
                  <a
                    href={document.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg p-2 text-muted transition hover:bg-white/[0.06] hover:text-foreground"
                    aria-label={`Ver ${document.title}`}
                    title="Ver archivo"
                  >
                    <Eye size={16} />
                  </a>
                  <button
                    type="button"
                    onClick={() => void toggleActive(document)}
                    className="rounded-lg p-2 text-muted transition hover:bg-white/[0.06] hover:text-foreground"
                    aria-label={document.is_active ? `Ocultar ${document.title}` : `Publicar ${document.title}`}
                    title={document.is_active ? 'Ocultar del sitio' : 'Publicar en el sitio'}
                  >
                    {document.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModal({ open: true, editing: document })}
                    className="rounded-lg p-2 text-muted transition hover:bg-white/[0.06] hover:text-foreground"
                    aria-label={`Editar ${document.title}`}
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(document)}
                    className="rounded-lg p-2 text-muted transition hover:bg-white/[0.06] hover:text-red-400"
                    aria-label={`Eliminar ${document.title}`}
                    title="Eliminar"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <DocumentModal
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

function DocumentModal({
  open,
  editing,
  onClose,
  onSaved,
}: {
  open: boolean
  editing?: Document | null
  onClose: () => void
  onSaved: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<{
    title: string
    kind: DocumentKind
    description: string
    sort_order: number
    is_active: boolean
  }>()

  useEffect(() => {
    if (open) {
      reset({
        title: editing?.title ?? '',
        kind: editing?.kind ?? 'cv',
        description: editing?.description ?? '',
        sort_order: editing?.sort_order ?? 0,
        is_active: editing?.is_active ?? true,
      })
      setFile(null)
      setError(null)
    }
  }, [open, editing, reset])

  const pickFile = (selected: File | null) => {
    setError(null)
    if (!selected) return setFile(null)
    if (selected.size > MAX_FILE_BYTES) {
      setError('El archivo supera el límite de 15 MB.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }
    setFile(selected)
    // Título sugerido: nombre del archivo sin extensión
    setValue('title', selected.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '), {
      shouldValidate: true,
    })
  }

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true)
    setError(null)
    try {
      if (editing) {
        // Edición de metadatos (reemplazar archivo: crear uno nuevo y borrar el viejo)
        await updateDocument(editing.id, {
          title: values.title,
          kind: values.kind,
          description: values.description || null,
          sort_order: values.sort_order,
          is_active: values.is_active,
        })
        onSaved()
        return
      }

      if (!file) {
        setError('Selecciona el archivo a subir (PDF recomendado).')
        setSaving(false)
        return
      }

      const path = buildStoragePath('documents', file.name)
      const url = await uploadPublicFile('portfolio', path, file)
      await createDocument({
        title: values.title,
        kind: values.kind,
        description: values.description || null,
        file_url: url,
        file_path: path,
        file_size: file.size,
        mime_type: file.type || null,
        sort_order: values.sort_order,
        is_active: values.is_active,
      })
      onSaved()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar el documento')
    } finally {
      setSaving(false)
    }
  })

  return (
    <Modal open={open} onClose={onClose} title={editing ? 'Editar documento' : 'Subir documento'}>
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        {!editing && (
          <Field
            label="Archivo"
            required
            hint="PDF recomendado · máx. 15 MB"
            error={error && !file ? error : undefined}
          >
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED}
                onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
                className="w-full cursor-pointer rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary/15 file:px-3 file:py-1.5 file:text-sm file:text-primary hover:border-white/20 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            {file && (
              <p className="mt-2 font-mono text-xs text-muted">
                {file.name} · {formatBytes(file.size)}
              </p>
            )}
          </Field>
        )}

        <Field label="Título" required error={errors.title?.message}>
          <Input placeholder="Hoja de vida 2026" {...register('title', { required: 'El título es obligatorio' })} />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Tipo" required error={errors.kind?.message}>
            <Select {...register('kind')}>
              {KINDS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Orden" error={errors.sort_order?.message}>
            <Input type="number" placeholder="0" {...register('sort_order')} />
          </Field>
        </div>

        <Field label="Descripción" hint="Opcional" error={errors.description?.message}>
          <Textarea rows={2} placeholder="Ej. CV actualizado con experiencia en desarrollo web" {...register('description')} />
        </Field>

        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-[#22d3ee]" {...register('is_active')} />
          Visible en el sitio (sección de descargas)
        </label>

        {error && file && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? <Spinner /> : editing ? 'Guardar' : 'Subir documento'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
