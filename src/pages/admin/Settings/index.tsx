/* oxlint-disable react/set-state-in-effect -- carga asíncrona de ajustes al cambiar de página */
import { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Camera, Save, Settings2 } from 'lucide-react'
import {
  fetchSettings,
  updateMyProfile,
  upsertSetting,
  uploadPublicFile,
  buildStoragePath,
} from '@/services/supabase/admin'
import type { Profile, SiteSetting } from '@/types'
import { useAdminAuth } from '@/contexts/AdminAuth'
import { AdminHeader } from '../parts/AdminHeader'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'

const PAGES: { value: string; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'home', label: 'Portada' },
  { value: 'seo', label: 'SEO' },
  { value: 'projects', label: 'Proyectos' },
]

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

export function Settings() {
  const { user, profile, refreshProfile } = useAdminAuth()
  const [activePage, setActivePage] = useState('general')
  const [settings, setSettings] = useState<SiteSetting[]>([])
  const [settingsDraft, setSettingsDraft] = useState<Record<string, string>>({})
  const [loadingSettings, setLoadingSettings] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [status, setStatus] = useState<{ ok?: boolean; message: string } | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileValues>({
    mode: 'onBlur',
    defaultValues: { full_name: '', professional_title: '', bio: '', location: '', email: '', phone: '', resume_url: '' },
  })

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name ?? '',
        professional_title: profile.professional_title ?? '',
        bio: profile.bio ?? '',
        location: profile.location ?? '',
        email: profile.email ?? '',
        phone: profile.phone ?? '',
        resume_url: profile.resume_url ?? '',
      })
    }
  }, [profile, reset])

  const loadSettings = useCallback(async (page: string) => {
    setLoadingSettings(true)
    try {
      const rows = await fetchSettings(page)
      setSettings(rows)
      setSettingsDraft(
        Object.fromEntries(
          rows.map((row) => [
            `${row.page}.${row.key}`,
            typeof row.value === 'string' ? row.value : JSON.stringify(row.value ?? ''),
          ]),
        ),
      )
    } catch (cause) {
      setStatus({ ok: false, message: cause instanceof Error ? cause.message : 'No se pudieron cargar los ajustes' })
    } finally {
      setLoadingSettings(false)
    }
  }, [])

  useEffect(() => {
    void loadSettings(activePage)
  }, [activePage, loadSettings])

  const onSaveProfile = handleSubmit(async (values) => {
    if (!user) return
    setStatus(null)
    try {
      await updateMyProfile(user.id, values as Partial<Profile>)
      await refreshProfile()
      setStatus({ ok: true, message: 'Perfil actualizado' })
    } catch (cause) {
      setStatus({ ok: false, message: cause instanceof Error ? cause.message : 'No se pudo actualizar el perfil' })
    }
  })

  const onSaveSettings = async () => {
    setSavingSettings(true)
    setStatus(null)
    try {
      for (const [key, value] of Object.entries(settingsDraft)) {
        const [page, settingKey] = key.split('.')
        await upsertSetting(page, settingKey, value)
      }
      setStatus({ ok: true, message: 'Ajustes guardados' })
    } catch (cause) {
      setStatus({ ok: false, message: cause instanceof Error ? cause.message : 'No se pudieron guardar los ajustes' })
    } finally {
      setSavingSettings(false)
    }
  }

  const uploadPhoto = async (file: File | undefined) => {
    if (!user || !file) return
    setUploadingPhoto(true)
    setStatus(null)
    try {
      const url = await uploadPublicFile('portfolio', buildStoragePath('profile', file.name), file)
      await updateMyProfile(user.id, { photo_url: url } as Partial<Profile>)
      await refreshProfile()
      setStatus({ ok: true, message: 'Foto de perfil actualizada' })
    } catch (cause) {
      setStatus({ ok: false, message: cause instanceof Error ? cause.message : 'No se pudo subir la foto' })
    } finally {
      setUploadingPhoto(false)
    }
  }

  return (
    <div className="shell section-pad">
      <AdminHeader
        eyebrow="Ajustes"
        title="Configuración"
        description="Datos del perfil público y textos editables del sitio."
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="glass h-fit rounded-2xl p-3">
          <nav className="space-y-1">
            {PAGES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setActivePage(value)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                  activePage === value
                    ? 'bg-primary/15 text-primary'
                    : 'text-muted hover:bg-white/[0.05] hover:text-foreground',
                )}
              >
                <Settings2 className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="space-y-6">
          {status && (
            <div
              role="status"
              className={cn(
                'rounded-xl border px-4 py-3 text-sm',
                status.ok
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-red-400/30 bg-red-400/10 text-red-400',
              )}
            >
              {status.message}
            </div>
          )}

          {activePage === 'general' && (
            <>
              <section className="glass space-y-5 rounded-2xl p-6 sm:p-8">
                <h2 className="font-display text-lg font-bold tracking-tight">Datos del perfil</h2>

                <div className="flex items-center gap-4">
                  {profile?.photo_url ? (
                    <img
                      src={profile.photo_url}
                      alt="Foto de perfil"
                      className="h-20 w-20 rounded-2xl border border-white/10 object-cover"
                    />
                  ) : (
                    <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-tertiary/20 font-display text-2xl font-bold text-primary">
                      {(profile?.full_name ?? user?.email?.[0] ?? '?').slice(0, 1).toUpperCase()}
                    </span>
                  )}
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
                </div>

                <form onSubmit={onSaveProfile} className="space-y-5" noValidate>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Nombre" required error={errors.full_name?.message}>
                      <Input {...register('full_name')} />
                    </Field>
                    <Field label="Título profesional" error={errors.professional_title?.message}>
                      <Input placeholder="Desarrollador y Analista de Software" {...register('professional_title')} />
                    </Field>
                  </div>
                  <Field label="Biografía" error={errors.bio?.message}>
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
                  <Field label="URL de hoja de vida" hint="Enlace a tu CV (PDF)" error={errors.resume_url?.message}>
                    <Input placeholder="https://…" {...register('resume_url')} />
                  </Field>
                  <Button type="submit">
                    <Save className="h-4 w-4" /> Guardar perfil
                  </Button>
                </form>
              </section>
            </>
          )}

          {activePage !== 'general' && (
            <section className="glass space-y-5 rounded-2xl p-6 sm:p-8">
              <h2 className="font-display text-lg font-bold tracking-tight">
                Textos · {PAGES.find((page) => page.value === activePage)?.label}
              </h2>

              {loadingSettings ? (
                <div className="flex justify-center py-10 text-primary">
                  <Spinner className="h-6 w-6" label="Cargando ajustes" />
                </div>
              ) : settings.length === 0 ? (
                <p className="text-sm text-muted">
                  No hay ajustes definidos para esta sección. Ejecuta el archivo supabase/seed.sql para cargarlos.
                </p>
              ) : (
                <div className="space-y-4">
                  {settings.map((setting) => {
                    const draftKey = `${setting.page}.${setting.key}`
                    return (
                      <Field key={setting.id} label={`${setting.key}`} hint={setting.page}>
                        <Input
                          value={settingsDraft[draftKey] ?? ''}
                          onChange={(event) =>
                            setSettingsDraft((current) => ({ ...current, [draftKey]: event.target.value }))
                          }
                        />
                      </Field>
                    )
                  })}
                  <Button type="button" onClick={() => void onSaveSettings()} disabled={savingSettings}>
                    {savingSettings ? <Spinner /> : <Save className="h-4 w-4" />}
                    Guardar textos
                  </Button>
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  )
}