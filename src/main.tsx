import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import './index.css'
import { router } from './App'
import { AdminAuthProvider } from '@/contexts/AdminAuth'
import { PortfolioDataProvider } from '@/contexts/PortfolioData'
import { ErrorBoundary } from '@/components/ErrorBoundary'

// El splash de arranque lo retira <SplashScreen> en el sitio público.
// En las rutas /admin no existe ese componente, así que lo retiramos aquí
// para que el panel no quede cubierto por la capa negra de arranque.
if (window.location.pathname.startsWith('/admin')) {
  document.getElementById('boot-splash')?.remove()
}

// Nota: no se usa <StrictMode> porque el doble montaje de desarrollo
// (setup → cleanup → setup) provoca una carrera con el <Canvas> de
// @react-three/fiber y el <Html> de @react-three/drei, generando errores
// "Attempted to synchronously unmount a root" y "removeChild" al recargar.
createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <AdminAuthProvider>
      <PortfolioDataProvider>
        <RouterProvider router={router} />
      </PortfolioDataProvider>
    </AdminAuthProvider>
  </ErrorBoundary>,
)