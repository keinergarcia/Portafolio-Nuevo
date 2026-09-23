import { Suspense, lazy } from 'react'
import { Navigate, createBrowserRouter } from 'react-router'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Home } from '@/pages/Home'
import { Projects } from '@/pages/Projects'
import { ProjectDetail } from '@/pages/ProjectDetail'
import { Services } from '@/pages/Services'
import { Contact } from '@/pages/Contact'
import { NotFound } from '@/pages/NotFound'
import { Spinner } from '@/components/ui/Spinner'

const Login = lazy(() =>
  import('@/pages/admin/Login').then((m) => ({ default: m.Login })),
)
const Dashboard = lazy(() =>
  import('@/pages/admin/Dashboard').then((m) => ({ default: m.Dashboard })),
)
const AdminProjects = lazy(() =>
  import('@/pages/admin/Projects').then((m) => ({ default: m.Projects })),
)
const ProjectForm = lazy(() =>
  import('@/pages/admin/ProjectForm').then((m) => ({ default: m.ProjectForm })),
)
const AdminServices = lazy(() =>
  import('@/pages/admin/Services').then((m) => ({ default: m.Services })),
)
const Technologies = lazy(() =>
  import('@/pages/admin/Technologies').then((m) => ({ default: m.Technologies })),
)
const AdminSocial = lazy(() =>
  import('@/pages/admin/Social').then((m) => ({ default: m.Social })),
)
const Messages = lazy(() =>
  import('@/pages/admin/Messages').then((m) => ({ default: m.Messages })),
)
const AdminSettings = lazy(() =>
  import('@/pages/admin/Settings').then((m) => ({ default: m.Settings })),
)

function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full items-center justify-center">
          <Spinner />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'projects', element: <Projects /> },
      { path: 'project/:slug', element: <ProjectDetail /> },
      { path: 'services', element: <Services /> },
      { path: 'contact', element: <Contact /> },
    ],
  },
  {
    path: 'admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="login" replace /> },
      { path: 'login', element: <AdminRoute><Login /></AdminRoute> },
      { path: 'dashboard', element: <AdminRoute><Dashboard /></AdminRoute> },
      { path: 'projects', element: <AdminRoute><AdminProjects /></AdminRoute> },
      { path: 'projects/nuevo', element: <AdminRoute><ProjectForm /></AdminRoute> },
      { path: 'projects/:id', element: <AdminRoute><ProjectForm /></AdminRoute> },
      { path: 'services', element: <AdminRoute><AdminServices /></AdminRoute> },
      { path: 'technologies', element: <AdminRoute><Technologies /></AdminRoute> },
      { path: 'social', element: <AdminRoute><AdminSocial /></AdminRoute> },
      { path: 'messages', element: <AdminRoute><Messages /></AdminRoute> },
      { path: 'settings', element: <AdminRoute><AdminSettings /></AdminRoute> },
    ],
  },
  { path: '*', element: <NotFound /> },
])

export {
  PublicLayout,
  AdminLayout,
  Home,
  Projects,
  ProjectDetail,
  Services,
  Contact,
  NotFound,
}
