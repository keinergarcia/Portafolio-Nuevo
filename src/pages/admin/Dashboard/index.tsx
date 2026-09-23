/* oxlint-disable react/set-state-in-effect -- carga asíncrona de métricas al montar */
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { FolderKanban, Globe, Mail, MessageSquare, Sparkles, Tags } from 'lucide-react'
import type { ComponentType } from 'react'
import { getAdminStats, fetchMessages, type AdminStats } from '@/services/supabase/admin'
import type { ContactMessage } from '@/types'
import { AdminHeader } from '../parts/AdminHeader'
import { MessageRow } from '../parts/MessageRow'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'

export function Dashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recent, setRecent] = useState<ContactMessage[]>([])
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      const [nextStats, messages] = await Promise.all([getAdminStats(), fetchMessages()])
      setStats(nextStats)
      setRecent(messages.slice(0, 5))
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los datos')
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const cards: { label: string; value: number; icon: ComponentType<{ className?: string }>; to: string; tone: string }[] =
    stats
      ? [
          { label: 'Proyectos', value: stats.projectsTotal, icon: FolderKanban, to: '/admin/projects', tone: 'from-primary/20 to-primary/5 text-primary' },
          { label: 'Publicados', value: stats.projectsPublished, icon: Globe, to: '/admin/projects', tone: 'from-secondary/20 to-secondary/5 text-secondary' },
          { label: 'Mensajes nuevos', value: stats.messagesNew, icon: Mail, to: '/admin/messages', tone: 'from-tertiary/20 to-tertiary/5 text-tertiary' },
          { label: 'Categorías', value: stats.categories, icon: Sparkles, to: '/admin/services', tone: 'from-primary/20 to-primary/5 text-primary' },
          { label: 'Tecnologías', value: stats.technologies, icon: Tags, to: '/admin/technologies', tone: 'from-secondary/20 to-secondary/5 text-secondary' },
        ]
      : []

  return (
    <div className="shell section-pad">
      <AdminHeader
        eyebrow="Dashboard"
        title="Resumen del portafolio"
        description="Vista general de proyectos, contenido y mensajes recibidos."
      />

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {!stats && !error && (
        <div className="mt-16 flex justify-center text-primary">
          <Spinner className="h-8 w-8" label="Cargando métricas" />
        </div>
      )}

      {stats && (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map(({ label, value, icon: Icon, to, tone }) => (
            <Link
              key={label}
              to={to}
              className="glass group rounded-2xl p-5 transition hover:border-white/15"
            >
              <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${tone}`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="mt-4 block font-display text-3xl font-bold tracking-tight">
                {value}
              </span>
              <span className="block text-sm text-muted transition group-hover:text-foreground">
                {label}
              </span>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold tracking-tight">Mensajes recientes</h2>
          <Link to="/admin/messages" className="text-sm text-primary transition hover:text-primary/80">
            Ver todos →
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="glass flex items-center gap-3 rounded-2xl p-6 text-sm text-muted">
            <MessageSquare className="h-5 w-5" />
            Aún no hay mensajes. El formulario de contacto los guardará aquí.
          </div>
        ) : (
          <ul className="space-y-3">
            {recent.map((message) => (
              <MessageRow key={message.id} message={message} />
            ))}
          </ul>
        )}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Badge variant="outline">Fase 7 · Panel CMS</Badge>
      </div>
    </div>
  )
}