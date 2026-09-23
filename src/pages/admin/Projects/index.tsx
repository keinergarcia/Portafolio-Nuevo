/* oxlint-disable react/set-state-in-effect -- carga asíncrona de proyectos al montar */
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router'
import { FolderKanban, Pencil, Plus, Trash2 } from 'lucide-react'
import { deleteProject, fetchProjects } from '@/services/supabase/admin'
import type { Project } from '@/types'
import { AdminHeader } from '../parts/AdminHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'

export function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setProjects(await fetchProjects())
      setError(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudieron cargar los proyectos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const remove = async (project: Project) => {
    if (!window.confirm(`¿Eliminar el proyecto «${project.title}» de forma permanente?`)) return
    try {
      await deleteProject(project.id)
      setProjects((current) => current.filter((item) => item.id !== project.id))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo eliminar el proyecto')
    }
  }

  return (
    <div className="shell section-pad">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <AdminHeader
          eyebrow="Proyectos"
          title="Gestionar proyectos"
          description="Crea y administra los proyectos que se muestran en el portafolio."
        />
        <Button to="/admin/projects/nuevo">
          <Plus className="h-4 w-4" /> Nuevo proyecto
        </Button>
      </div>

      {error && (
        <div role="alert" className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-16 flex justify-center text-primary">
          <Spinner className="h-8 w-8" label="Cargando proyectos" />
        </div>
      ) : projects.length === 0 ? (
        <div className="glass mt-8 flex items-center gap-3 rounded-2xl p-6 text-sm text-muted">
          <FolderKanban className="h-5 w-5" />
          Aún no hay proyectos. Crea el primero con «Nuevo proyecto».
        </div>
      ) : (
        <div className="mt-8 flex flex-col gap-3">
          {projects.map((project) => (
            <div key={project.id} className="glass flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center">
              <Link to={`/admin/projects/${project.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                {project.cover_image ? (
                  <img
                    src={project.cover_image}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-xl border border-white/10 object-cover"
                  />
                ) : (
                  <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-tertiary/20 text-primary">
                    <FolderKanban className="h-6 w-6" />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">{project.title}</span>
                    <Badge variant={project.featured ? 'tertiary' : 'default'}>
                      {project.featured ? 'Destacado' : project.status}
                    </Badge>
                    {project.status === 'published' && <Badge variant="accent">Publicado</Badge>}
                  </span>
                  <span className="mt-1 block truncate text-sm text-muted">
                    {project.short_description ?? project.slug}
                  </span>
                </span>
              </Link>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  to={`/admin/projects/${project.id}`}
                  className={cn(
                    'inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-muted transition hover:border-white/25 hover:text-foreground',
                  )}
                  aria-label={`Editar ${project.title}`}
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => void remove(project)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-red-400/20 text-red-400 transition hover:bg-red-400/10"
                  aria-label={`Eliminar ${project.title}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}