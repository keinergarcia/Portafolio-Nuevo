import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { motion, useReducedMotion } from 'motion/react'
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  FolderKanban,
  Lock,
  Mail,
  MessageSquare,
  Settings2,
  ShieldCheck,
} from 'lucide-react'
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

const EASE = [0.22, 1, 0.36, 1] as const

const FEATURES = [
  {
    icon: FolderKanban,
    title: 'Proyectos',
    text: 'Crea, edita y publica tu trabajo con galería y tecnologías.',
  },
  {
    icon: MessageSquare,
    title: 'Mensajes',
    text: 'Bandeja de contacto con estados y respuestas organizadas.',
  },
  {
    icon: Settings2,
    title: 'Contenido en vivo',
    text: 'Perfil, servicios, tecnologías y textos del sitio al instante.',
  },
] as const

export function Login() {
  const { user, isAdmin, profile, signIn, loading } = useAdminAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const reducedMotion = useReducedMotion()

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

  const rise = (delay: number) =>
    reducedMotion
      ? {}
      : {
          initial: { opacity: 0, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.65, delay, ease: EASE },
        }

  if (!isSupabaseConfigured()) {
    return (
      <div className="relative flex min-h-svh items-center justify-center overflow-hidden p-6">
        <div aria-hidden="true" className="pointer-events-none fixed inset-0">
          <div className="grid-glow absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
          <div className="absolute -top-44 -left-44 h-[36rem] w-[36rem] rounded-full bg-primary/[0.07] blur-[130px]" />
          <div className="absolute -bottom-52 -right-44 h-[40rem] w-[40rem] rounded-full bg-secondary/[0.1] blur-[140px]" />
        </div>

        <motion.section
          {...(reducedMotion ? {} : { initial: { opacity: 0, y: 22 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.65, ease: EASE } })}
          className="glass-panel relative w-full max-w-md p-8 text-center sm:p-10"
        >
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
          />
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-background shadow-glow">
            <ShieldCheck size={24} aria-hidden="true" />
          </span>
          <h1 className="mt-6 font-display text-2xl font-bold tracking-tight">Configura Supabase</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Para usar el panel necesitas definir{' '}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-primary">
              VITE_SUPABASE_URL
            </code>{' '}
            y{' '}
            <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-primary">
              VITE_SUPABASE_ANON_KEY
            </code>{' '}
            en tu archivo <code className="font-mono text-xs text-primary">.env</code>.
          </p>
          <p className="mt-8 text-center text-sm text-muted">
            <Link to="/" className="inline-flex items-center gap-1.5 transition-colors hover:text-primary">
              ← Volver al portafolio
            </Link>
          </p>
        </motion.section>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-svh items-center justify-center overflow-hidden p-6">
      {/* Ambientación: rejilla + halos de marca */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0">
        <div className="grid-glow absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <div className="absolute -top-44 -left-44 h-[36rem] w-[36rem] rounded-full bg-primary/[0.07] blur-[130px]" />
        <div className="absolute -bottom-52 -right-44 h-[40rem] w-[40rem] rounded-full bg-secondary/[0.1] blur-[140px]" />
        <div className="absolute top-1/3 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-tertiary/[0.05] blur-[120px]" />
      </div>

      <div className="relative grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[1fr_26rem] lg:gap-20">
        {/* Lado de marca — solo en pantallas grandes */}
        <motion.section {...rise(0)} className="hidden lg:block">
          <p className="eyebrow">ElChivalez · Panel de control</p>
          <h1 className="mt-6 font-display text-[2.6rem] leading-[1.06] font-bold tracking-[-0.03em] text-balance">
            Tu portafolio,
            <span className="text-gradient"> bajo tu control</span>
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-muted">
            Un único lugar para administrar el contenido que ve el mundo: todo se
            guarda y sincroniza automáticamente.
          </p>

          <ul className="mt-10 space-y-5">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-4">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-br from-primary/15 to-tertiary/15 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <Icon size={19} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">{title}</span>
                  <span className="mt-0.5 block text-sm leading-relaxed text-muted">{text}</span>
                </span>
              </li>
            ))}
          </ul>

          <p className="mt-12 flex items-center gap-2 font-mono text-[11px] tracking-[0.18em] text-white/30 uppercase">
            <ShieldCheck size={14} className="text-primary/70" aria-hidden="true" />
            Acceso restringido al administrador
          </p>
        </motion.section>

        {/* Tarjeta de acceso */}
        <motion.div {...rise(0.12)} className="w-full">
          <div className="relative">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.08),rgba(99,102,241,0.06)_55%,transparent_80%)] blur-2xl"
            />

            <section className="glass-panel relative p-8 sm:p-10">
              <span
                aria-hidden="true"
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
              />

              <div className="flex flex-col items-center text-center">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-background shadow-glow">
                  <Lock size={24} aria-hidden="true" />
                </span>
                <h2 className="mt-6 font-display text-2xl font-bold tracking-tight">
                  Acceso al panel
                </h2>
                <p className="mt-2 text-sm text-muted">
                  Inicia sesión para administrar tu portafolio
                </p>
              </div>

              <form onSubmit={onSubmit} className="relative mt-8 space-y-5" noValidate>
                {error && (
                  <motion.div
                    key={error}
                    role="alert"
                    initial={reducedMotion ? false : { opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-2.5 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400"
                  >
                    <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                    {error}
                  </motion.div>
                )}

                {user && !isAdmin && (
                  <div
                    role="status"
                    className="flex items-start gap-2.5 rounded-xl border border-yellow-400/30 bg-yellow-400/10 px-4 py-3 text-sm text-yellow-300"
                  >
                    <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <span>
                      Tu usuario no tiene rol de administrador. Contacta al responsable del panel.
                      {profile?.full_name ? ` (${profile.full_name})` : ''}
                    </span>
                  </div>
                )}

                <Field label="Email" htmlFor="admin-email" required error={errors.email?.message}>
                  <div className="relative">
                    <Mail
                      size={17}
                      className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"
                      aria-hidden="true"
                    />
                    <Input
                      id="admin-email"
                      type="email"
                      autoComplete="email"
                      autoFocus
                      className="pr-4 pl-11"
                      aria-invalid={Boolean(errors.email)}
                      {...register('email')}
                    />
                  </div>
                </Field>

                <Field
                  label="Contraseña"
                  htmlFor="admin-password"
                  required
                  error={errors.password?.message}
                >
                  <div className="relative">
                    <Lock
                      size={17}
                      className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"
                      aria-hidden="true"
                    />
                    <Input
                      id="admin-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className="pr-12 pl-11"
                      aria-invalid={Boolean(errors.password)}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute top-1/2 right-3 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition hover:bg-white/[0.06] hover:text-foreground"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </Field>

                {loading || submitting ? (
                  <Button type="submit" size="lg" className="w-full" disabled>
                    <Spinner /> Ingresando…
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="lg"
                    className="group w-full text-base font-semibold"
                  >
                    Ingresar
                    <ArrowRight
                      size={18}
                      className="transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </Button>
                )}
              </form>

              <p className="mt-8 text-center text-sm text-muted">
                <Link
                  to="/"
                  className="inline-flex items-center gap-1.5 transition-colors hover:text-primary"
                >
                  ← Volver al portafolio
                </Link>
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
