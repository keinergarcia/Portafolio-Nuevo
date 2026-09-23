import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { ArrowRight, Lock, ShieldCheck } from 'lucide-react'
import { useAdminAuth } from '@/contexts/AdminAuth'
import { isSupabaseConfigured } from '@/lib/supabase'
import { Field, Input } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

const loginSchema = z.object({
  email: z.email('Ingresa un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function Login() {
  const { user, isAdmin, profile, signIn, loading } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ mode: 'onBlur' })

  if (user && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />
  }

  const from = (location.state as { from?: string } | null)?.from ?? '/admin/dashboard'

  const onSubmit = handleSubmit(async (values) => {
    setError(null)
    setSubmitting(true)
    try {
      await signIn(values.email, values.password)
      await new Promise((resolve) => setTimeout(resolve, 400))
      navigate(from, { replace: true })
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo iniciar sesión')
      setSubmitting(false)
    }
  })

  if (!isSupabaseConfigured()) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <div className="glass mt-[-20vh] w-full max-w-md space-y-4 p-8 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
          <h1 className="font-display text-2xl font-bold tracking-tight">Configura Supabase</h1>
          <p className="text-sm text-muted">
            Para usar el panel necesitas definir{' '}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-primary">
              VITE_SUPABASE_URL
            </code>{' '}
            y{' '}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-primary">
              VITE_SUPABASE_ANON_KEY
            </code>{' '}
            en tu archivo .env.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-tertiary text-background">
            <Lock className="h-6 w-6" />
          </span>
          <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">Acceso al panel</h1>
          <p className="mt-2 text-sm text-muted">Inicia sesión para administrar tu portafolio</p>
        </div>

        <form onSubmit={onSubmit} className="glass relative space-y-5 p-6 sm:p-8" noValidate>
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
          />

          {error && (
            <div role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {user && !isAdmin && (
            <div role="status" className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-300">
              Tu usuario no tiene rol de administrador. Contacta al responsable del panel.
              {profile?.full_name ? ` (${profile.full_name})` : ''}
            </div>
          )}

          <Field label="Email" htmlFor="admin-email" required error={errors.email?.message}>
            <Input
              id="admin-email"
              type="email"
              placeholder="admin@elchivalez.com"
              autoComplete="email"
              autoFocus
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
            />
          </Field>

          <Field label="Contraseña" htmlFor="admin-password" required error={errors.password?.message}>
            <Input
              id="admin-password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
            />
          </Field>

          {loading || submitting ? (
            <Button type="submit" size="lg" className="w-full" disabled>
              <Spinner /> Ingresando…
            </Button>
          ) : (
            <Button type="submit" size="lg" className="w-full">
              Ingresar <ArrowRight size={16} />
            </Button>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          <Link to="/" className="transition hover:text-primary">
            ← Volver al portafolio
          </Link>
        </p>
      </div>
    </div>
  )
}