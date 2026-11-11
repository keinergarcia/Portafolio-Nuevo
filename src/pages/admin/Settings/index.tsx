/* oxlint-disable react/set-state-in-effect -- carga asíncrona de ajustes al cambiar de página */
import { useCallback, useEffect, useState } from 'react'
import { ArrowUpRight, Save, Settings2 } from 'lucide-react'
import { Link } from 'react-router'
import { fetchSettings, upsertSetting } from '@/services/supabase/admin'
import type { SiteSetting } from '@/types'
import { AdminHeader } from '../parts/AdminHeader'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'

const PAGES: { value: string; label: string; hint: string }[] = [
  {
    value: 'home',
    label: 'Portada',
    hint: 'Textos del hero: saludo, nombre, título y tagline.',
  },
  {
    value: 'general',
    label: 'General',
    hint: 'Datos de contacto usados por el formulario y el pie de página.',
  },
  {
    value: 'seo',
    label: 'SEO',
    hint: 'Metadatos compartidos en redes sociales.',
  },
  {
    value: 'projects',
    label: 'Proyectos',
    hint: 'Textos de la sección de proyectos.',
  },
]

function settingText(value: SiteSetting['value']): string {
  if (typeof value === 'string') return value
  if (value === null || value === undefined) return ''
  return JSON.stringify(value)
}

export function Settings() {
  const [activePage, setActivePage] = useState('home')
  const [settings, setSettings] = useState<SiteSetting[]>([])
  const [settingsDraft, setSettingsDraft] = useState<Record<string, string>>({})
  const [loadingSettings, setLoadingSettings] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [status, setStatus] = useState<{ ok?: boolean; message: string } | null>(null)

  const loadSettings = useCallback(async (page: string) => {
    setLoadingSettings(true)
    try {
      const rows = await fetchSettings(page)
      setSettings(rows)
      setSettingsDraft(
        Object.fromEntries(rows.map((row) => [`${row.page}.${row.key}`, settingText(row.value)])),
      )
      setStatus(null)
    } catch (cause) {
      setStatus({
        ok: false,
        message: cause instanceof Error ? cause.message : 'No se pudieron cargar los ajustes',
      })
    } finally {
      setLoadingSettings(false)
    }
  }, [])

  useEffect(() => {
    void loadSettings(activePage)
  }, [activePage, loadSettings])

  const onSaveSettings = async () => {
    setSavingSettings(true)
    setStatus(null)
    try {
      for (const [key, value] of Object.entries(settingsDraft)) {
        const [page, settingKey] = key.split('.')
        await upsertSetting(page, settingKey, value)
      }
      setStatus({ ok: true, message: 'Textos guardados' })
    } catch (cause) {
      setStatus({
        ok: false,
        message: cause instanceof Error ? cause.message : 'No se pudieron guardar los textos',
      })
    } finally {
      setSavingSettings(false)
    }
  }

  const activeHint = PAGES.find((page) => page.value === activePage)?.hint ?? ''

  return (
    <div className="shell section-pad">
      <AdminHeader
        eyebrow="Ajustes"
        title="Textos del sitio"
        description="Edita los encabezados y textos fijos de cada sección. Tu información personal se administra en «Mi perfil»."
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
          <Link
            to="/admin/profile"
            className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/[0.07] px-3 py-2.5 text-sm text-primary transition hover:bg-primary/15"
          >
            Mi perfil
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
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

          <section className="glass space-y-5 rounded-2xl p-6 sm:p-8">
            <div>
              <h2 className="font-display text-lg font-bold tracking-tight">
                {PAGES.find((page) => page.value === activePage)?.label}
              </h2>
              <p className="mt-1 text-xs text-muted">{activeHint}</p>
            </div>

            {loadingSettings ? (
              <div className="flex justify-center py-10 text-primary">
                <Spinner className="h-6 w-6" label="Cargando textos" />
              </div>
            ) : settings.length === 0 ? (
              <p className="text-sm text-muted">
                No hay textos definidos para esta sección. Ejecuta{' '}
                <code className="font-mono text-xs text-primary">supabase/seed.sql</code> en el SQL
                Editor de Supabase para cargar los iniciales.
              </p>
            ) : (
              <div className="space-y-4">
                {settings.map((setting) => {
                  const draftKey = `${setting.page}.${setting.key}`
                  const isLong = draftKey.endsWith('_tagline') || draftKey.endsWith('_description')
                  return (
                    <Field key={setting.id} label={setting.key}>
                      {isLong ? (
                        <Textarea
                          rows={3}
                          value={settingsDraft[draftKey] ?? ''}
                          onChange={(event) =>
                            setSettingsDraft((current) => ({
                              ...current,
                              [draftKey]: event.target.value,
                            }))
                          }
                        />
                      ) : (
                        <Input
                          value={settingsDraft[draftKey] ?? ''}
                          onChange={(event) =>
                            setSettingsDraft((current) => ({
                              ...current,
                              [draftKey]: event.target.value,
                            }))
                          }
                        />
                      )}
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
        </div>
      </div>
    </div>
  )
}
