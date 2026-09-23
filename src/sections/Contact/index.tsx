import { useState, type ComponentType } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  ArrowRight,
  CheckCircle2,
  Globe,
  Mail,
  MessageCircle,
} from 'lucide-react'
import { GitHubIcon, LinkedInIcon } from '@/components/ui/BrandIcons'
import { usePortfolioData } from '@/contexts/PortfolioData'
import type { Profile, SocialLink } from '@/types'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { Reveal } from '@/components/animations/Reveal'
import { submitContact } from '@/services/supabase/contact'

const contactSchema = z.object({
  name: z.string().trim().min(2, 'Ingresa tu nombre'),
  email: z.email('Ingresa un email válido'),
  phone: z.string().trim().optional().or(z.literal('')),
  service_type: z.string().min(1, 'Selecciona un tipo de servicio'),
  message: z.string().trim().min(10, 'Cuéntame un poco más sobre tu proyecto'),
})

type ContactFormValues = z.infer<typeof contactSchema>

type Channel = {
  icon: ComponentType<{ size?: number | string; className?: string }>
  label: string
  value: string
}

function buildChannels(profile: Profile, links: SocialLink[]): Channel[] {
  const channels: Channel[] = []
  if (profile.email) {
    channels.push({ icon: Mail, label: 'Email', value: profile.email })
  }
  if (profile.phone) {
    channels.push({ icon: MessageCircle, label: 'Teléfono', value: profile.phone })
  }
  const icons: Record<string, Channel['icon']> = {
    whatsapp: MessageCircle,
    github: GitHubIcon,
    linkedin: LinkedInIcon,
    portafolio: Globe,
  }
  for (const link of links) {
    if (!link.is_active) continue
    const Icon = icons[link.platform] ?? Globe
    channels.push({ icon: Icon, label: link.platform, value: link.url })
  }
  return channels
}

export function Contact() {
  const { profile, socialLinks, serviceCategories } = usePortfolioData()
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const channels = buildChannels(profile, socialLinks)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ContactFormValues>({ mode: 'onBlur' })

  const onSubmit = handleSubmit(async (values) => {
    setStatus('sending')
    try {
      await submitContact({
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        service_type: values.service_type,
        message: values.message,
      })
      setStatus('success')
      reset()
    } catch (error) {
      setStatus('error')
      setError('name', { message: error instanceof Error ? error.message : '' })
    }
  })

  return (
    <section id="contacto" className="section-pad shell">
      <SectionHeading
        eyebrow="Contacto"
        title="Hablemos de tu"
        highlight="proyecto"
        description="Cuéntame qué necesitas y te propongo una solución. Respondo con la información correcta al primer mensaje."
      />

      <div className="mt-14 grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
        <Reveal>
          <div className="space-y-6">
            <p className="text-sm leading-relaxed text-muted">
              ¿Tienes una idea, necesitas un sistema, una web o una automatización?
              Escríbeme directamente por cualquiera de estos canales.
            </p>

            <ul className="space-y-3">
              {channels.map((channel) => {
                const isPlaceholder = channel.value === 'TODO'
                const content = (
                  <span className="glass flex items-center gap-4 px-5 py-4 transition-colors hover:border-white/15">
                    <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-tertiary/20 text-primary">
                      <channel.icon size={19} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold capitalize text-foreground">
                        {channel.label}
                      </span>
                      <span className="block truncate font-mono text-xs text-muted">
                        {isPlaceholder
                          ? '¿Disponible próximamente?'
                          : channel.value}
                      </span>
                    </span>
                  </span>
                )
                return (
                  <li key={channel.label}>
                    {isPlaceholder ? (
                      content
                    ) : (
                      <a
                        href={channel.value}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Contactar por ${channel.label}`}
                      >
                        {content}
                      </a>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <form
            onSubmit={onSubmit}
            className="glass relative space-y-5 p-6 sm:p-8"
            noValidate
          >
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            />

            {status === 'success' && (
              <div
                role="status"
                className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary"
              >
                <CheckCircle2 size={18} aria-hidden="true" />
                ¡Mensaje enviado! Te responderé lo antes posible.
              </div>
            )}

            {status === 'error' && (
              <div
                role="alert"
                className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400"
              >
                Hubo un problema al enviar el mensaje. Inténtalo de nuevo.
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nombre" htmlFor="contact-name" required error={errors.name?.message}>
                <Input
                  id="contact-name"
                  placeholder="Tu nombre"
                  autoComplete="name"
                  aria-invalid={Boolean(errors.name)}
                  {...register('name')}
                />
              </Field>

              <Field label="Email" htmlFor="contact-email" required error={errors.email?.message}>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="tucorreo@ejemplo.com"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  {...register('email')}
                />
              </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Teléfono" htmlFor="contact-phone" error={errors.phone?.message}>
                <Input
                  id="contact-phone"
                  type="tel"
                  placeholder="+58 000 000 0000"
                  autoComplete="tel"
                  {...register('phone')}
                />
              </Field>

              <Field
                label="Tipo de servicio"
                htmlFor="contact-service"
                required
                error={errors.service_type?.message}
              >
                <Select id="contact-service" defaultValue="" {...register('service_type')}>
                  <option value="" disabled>
                    Selecciona una opción
                  </option>
                  {serviceCategories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <Field label="Mensaje" htmlFor="contact-message" required error={errors.message?.message}>
              <Textarea
                id="contact-message"
                placeholder="Cuéntame sobre tu proyecto, objetivo y plazos…"
                {...register('message')}
              />
            </Field>

            <Button type="submit" size="lg" className="w-full" disabled={status === 'sending'}>
              {status === 'sending' ? (
                <>
                  <Spinner /> Enviando…
                </>
              ) : (
                <>
                  Enviar mensaje <ArrowRight size={16} />
                </>
              )}
            </Button>

            <p className="text-center font-mono text-[11px] text-muted">
              Sin spam. Tus datos se usan solo para responder este mensaje.
            </p>
          </form>
        </Reveal>
      </div>
    </section>
  )
}