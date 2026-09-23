import { useState } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router'
import {
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessagesSquare,
  Settings,
  Sparkles,
  Tags,
  X,
} from 'lucide-react'
import { useAdminAuth } from '@/contexts/AdminAuth'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/projects', label: 'Proyectos', icon: FolderKanban },
  { to: '/admin/services', label: 'Servicios', icon: Sparkles },
  { to: '/admin/technologies', label: 'Tecnologías', icon: Tags },
  { to: '/admin/social', label: 'Enlaces sociales', icon: MessagesSquare },
  { to: '/admin/messages', label: 'Mensajes', icon: Mail },
  { to: '/admin/settings', label: 'Ajustes', icon: Settings },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { profile, signOut } = useAdminAuth()

  return (
    <div className="flex h-full flex-col">
      <Link
        to="/"
        className="flex items-center gap-2 px-6 py-5 font-display text-base font-bold tracking-tight"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-tertiary text-background">
          E
        </span>
        <span>
          ElChivalez
          <span className="block text-[11px] font-medium text-muted">Panel de control</span>
        </span>
      </Link>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted hover:bg-white/[0.05] hover:text-foreground',
              )
            }
          >
            <Icon className="h-4.5 w-4.5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/[0.06] px-3 py-4">
        <div className="mb-3 px-3">
          <p className="truncate text-sm font-medium">{profile?.full_name ?? 'Administrador'}</p>
          <p className="truncate text-xs text-muted">{profile?.professional_title ?? 'admin'}</p>
        </div>
        <button
          type="button"
          onClick={() => void signOut()}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-white/[0.05] hover:text-foreground"
        >
          <LogOut className="h-4.5 w-4.5" />
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

export function AdminLayout() {
  const { user, loading } = useAdminAuth()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background text-primary">
        <Spinner className="h-8 w-8" label="Verificando sesión" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  const isLoginRoute = location.pathname === '/admin/login'

  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="flex min-h-svh">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/[0.06] bg-surface/50 backdrop-blur-xl lg:block">
          <SidebarContent />
        </aside>

        {menuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <aside className="absolute inset-y-0 left-0 w-72 border-r border-white/[0.06] bg-surface">
              <button
                type="button"
                aria-label="Cerrar menú"
                onClick={() => setMenuOpen(false)}
                className="absolute right-3 top-4 rounded-lg p-1.5 text-muted hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent onNavigate={() => setMenuOpen(false)} />
            </aside>
          </div>
        )}

        <div className="flex min-h-svh w-full flex-col lg:pl-72">
          {!isLoginRoute && (
            <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-background/80 backdrop-blur-xl">
              <div className="flex h-16 items-center justify-between px-4 sm:px-6">
                <button
                  type="button"
                  aria-label="Abrir menú"
                  onClick={() => setMenuOpen(true)}
                  className="rounded-lg p-2 text-muted transition hover:bg-white/[0.06] hover:text-foreground lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <Link
                  to="/"
                  className="hidden text-sm text-muted transition hover:text-foreground lg:block"
                >
                  ← Volver al sitio
                </Link>
                <Link
                  to="/"
                  className="text-sm text-muted transition hover:text-foreground lg:hidden"
                >
                  ← Ver sitio
                </Link>
              </div>
            </header>
          )}

          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}