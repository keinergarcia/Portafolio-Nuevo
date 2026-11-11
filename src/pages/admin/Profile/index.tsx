/* oxlint-disable react/set-state-in-effect -- carga asíncrona del perfil al montar */
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  ArrowDown,
  ArrowUp,
  Briefcase,
  Camera,
  GraduationCap,
  ListPlus,
  Save,
  UserRound,
  X,
} from 'lucide-react'
import { updateMyProfile, uploadPublicFile, buildStoragePath } from '@/services/supabase/admin'
import type { Profile } from '@/types'
import { useAdminAuth } from '@/contexts/AdminAuth'
import { AdminHeader } from '../parts/AdminHeader'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'

const profileSchema = z.object({
  full_name: z.string().trim().min(2, 'El nombre es obligatorio'),
  professional_title: z.string(),
  bio: z.string(),
  location: z.string(),
  email: z.string(),
  phone: z.string(),
  resume_url: z.string(),
})

type ProfileValues = z.infer<typeof profileSchema>

interface ListEditorProps {
  title: string
  eyebrow: string
  icon: React.ComponentType<{ className?: string }>
  placeholder: string
  hint: string
  items: string[]
  onChange: (items: string[]) => void
}

/** Editor de listas (formación / experiencia): añade, reordena y elimina líneas. */
function ListEditor({
  title,
  eyebrow,
  icon: Icon,
  placeholder,
  hint,
  items,
  onChange,
}: ListEditorProps) {
  const update = (index: number, value: string) => {
    onChange(items.map((item, i) => (i === index ? value : item)))
  }

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  return (
    <section className="glass space-y-5 rounded-2xl p-6 sm:p-8">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 flex items-center gap-2 font-display text-lg font-bold tracking-tight">
          <Icon className="h-4.5 w-4.5 text-primary" />
          {title}
        </h2>
        <p className="mt-1 text-xs text-muted">{hint}</p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted">Aún no hay elementos. Agrega el primero abajo.</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((item, index) => (
            <li key={index} className="flex items-center gap-2">
              <span className="w-6 shrink-0 text-center font-mono text-xs text-muted">
                {index + 1}
              </span>
              <Input
                value={item}
                placeholder={placeholder}
                onChange={(event) => update(index, event.target.value)}
              />
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-white/[0.06] hover:text-foreground disabled:opacity-30"
                  aria-label="Subir"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-white/[0.06] hover:text-foreground disabled:opacity-30"
                  aria-label="Bajar"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onChange(items.filter((_, i) => i !== index))}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted transition hover:bg-red-400/10 hover:text-red-400"
                  aria-label="Eliminar"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        size="sm"
        variant="secondary"
        onClick={() => onChange([...items, ''])}
      >
        <ListPlus className="h-4 w-4" /> Agregar elemento
      </Button>
    </section>
  )
}

export function ProfileAdmin() {
  const { user, profile, refreshProfile } = useAdminAuth()
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [formation, setFormation] = useState<string[]>([])
  const [experience, setExperience] = useState<string[]>([])
  const [status, setStatus] = useState<{ ok?: boolean; message: string } | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileValues>({
    mode: 'onBlur',
    defaultValues: {
      full_name: '',
      professional_title: '',
      bio: '',
      location: '',
      email: '',
      phone: '',
      resume_url: '',
    },
  })

  useEffect(() => {
    if (!profile) return
    reset({
      full_name: profile.full_name ?? '',
      professional_title: profile.professional_title ?? '',
      bio: profile.bio ?? '',
      location: profile.location ?? '',
      email: profile.email ?? '',
      phone: profile.phone ?? '',
      resume_url: profile.resume_url ?? '',
    })
    // Los marcadores «TODO» no se cargan: el panel es para reemplazarlos.
    const clean = (list: string[] | null) => (list ?? []).filter((item) => item && item !== 'TODO')
    setFormation(clean(profile.formation))
    setExperience(clean(profile.experience))
  }, [profile, reset])

  const onSave = handleSubmit(async (values) => {
    if (!user) return
    setSaving(true)
    setStatus(null)
    try {
      await updateMyProfile(user.id, {
        ...values,
        formation: formation.map((item) => item.trim()).filter(Boolean),
        experience: experience.map((item) => item.trim()).filter(Boolean),
      } as Partial<Profile>)
      await refreshProfile()
      setStatus({ ok: true, message: 'Perfil actualizado. El sitio refleja los cambios al recargar.' })
    } catch (cause) {
      setStatus({
        ok: false,
        message: cause instanceof Error ? cause.message : 'No se pudo actualizar el perfil',
      })
    } finally {
      setSaving(false)
    }
  })

  const uploadPhoto = async (file: File | undefined) => {
    if (!user || !file) return
    setUploadingPhoto(true)
    setStatus(null)
    try {
      const url = await uploadPublicFile('portfolio', buildStoragePath('profile', file.name), file)
      await updateMyProfile(user.id, { photo_url: url })
      await refreshProfile()
      setStatus({ ok: true, message: 'Foto de perfil actualizada' })
    } catch (cause) {
      setStatus({
        ok: false,
        message: cause instanceof Error ? cause.message : 'No se pudo subir la foto',
      })
    } finally {
      setUploadingPhoto(false)
    }
  }

  return (
    <div className="shell section-pad">
      <AdminHeader
        eyebrow="Mi perfil"
        title="Datos personales"
        description="Tu información pública: foto, biografía, formación, experiencia y contacto. Se muestra en la página «Perfil» y en «Sobre mí»."
      />

      {status && (
        <div
          role="status"
          className={cn(
            'mt-6 rounded-xl border px-4 py-3 text-sm',
            status.ok
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'border-red-400/30 bg-red-400/10 text-red-400',
          )}
        >
          {status.message}
        </div>
      )}

      <form onSubmit={onSave} className="mt-8 space-y-6" noValidate>
        <section className="glass space-y-5 rounded-2xl p-6 sm:p-8">
          <h2 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
            <UserRound className="h-4.5 w-4.5 text-primary" />
            Presentación
          </h2>

          <div className="flex flex-wrap items-center gap-5">
            {profile?.photo_url ? (
              <img
                src={profile.photo_url}
                alt="Foto de perfil"
                className="h-24 w-24 rounded-2xl border border-white/10 object-cover"
              />
            ) : (
              <span className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-tertiary/20 font-display text-3xl font-bold text-primary">
                {(profile?.full_name ?? user?.email?.[0] ?? '?').slice(0, 1).toUpperCase()}
              </span>
            )}
            <div className="space-y-1.5">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-muted transition hover:border-white/25 hover:text-foreground">
                {uploadingPhoto ? <Spinner className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
                {uploadingPhoto ? 'Subiendo…' : 'Subir foto'}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => void uploadPhoto(event.target.files?.[0])}
                />
              </label>
              <p className="text-xs text-muted">PNG o JPG · se recorta en cuadrado en el sitio</p>
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Nombre" required error={errors.full_name?.message}>
              <Input placeholder="Keiner García" {...register('full_name')} />
            </Field>
            <Field label="Título profesional" error={errors.professional_title?.message}>
              <Input
                placeholder="Desarrollador y Analista de Software"
                {...register('professional_title')}
              />
            </Field>
          </div>

          <Field label="Biografía" hint="Aparece en el hero, en «Sobre mí» y en tu perfil público" error={errors.bio?.message}>
            <Textarea rows={4} {...register('bio')} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Ubicación" error={errors.location?.message}>
              <Input placeholder="Venezuela" {...register('location')} />
            </Field>
            <Field label="Email público" error={errors.email?.message}>
              <Input type="email" placeholder="tu@correo.com" {...register('email')} />
            </Field>
            <Field label="Teléfono" error={errors.phone?.message}>
              <Input placeholder="+58 000 000 0000" {...register('phone')} />
            </Field>
          </div>

          <Field label="URL de hoja de vida" hint="Enlace a tu CV en PDF" error={errors.resume_url?.message}>
            <Input placeholder="https://…" {...register('resume_url')} />
          </Field>
        </section>

        <ListEditor
          eyebrow="Trayectoria"
          title="Formación"
          icon={GraduationCap}
          placeholder="Ingeniería de Software · Universidad (2018 – 2022)"
          hint="Un elemento por línea. Se muestra en «Sobre mí» y en tu perfil."
          items={formation}
          onChange={setFormation}
        />

        <ListEditor
          eyebrow="Trayectoria"
          title="Experiencia"
          icon={Briefcase}
          placeholder="Desarrollador Freelance · 2023 – presente"
          hint="Un elemento por línea. Se muestra en «Sobre mí» y en tu perfil."
          items={experience}
          onChange={setExperience}
        />

        <div className="flex flex-wrap items-center gap-3 pb-10">
          <Button type="submit" size="lg" disabled={saving}>
            {saving ? (
              <>
                <Spinner /> Guardando…
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Guardar perfil
              </>
            )}
          </Button>
          <p className="text-xs text-muted">
            Los elementos vacíos se descartan al guardar.
          </p>
        </div>
      </form>
    </div>
  )
}
