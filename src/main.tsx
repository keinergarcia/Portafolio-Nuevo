import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import './index.css'
import { router } from './App'
import { AdminAuthProvider } from '@/contexts/AdminAuth'
import { PortfolioDataProvider } from '@/contexts/PortfolioData'

// El splash de arranque lo retira <SplashScreen> en el sitio público.
// En las rutas /admin no existe ese componente, así que lo retiramos aquí
// para que el panel no quede cubierto por la capa negra de arranque.
if (window.location.pathname.startsWith('/admin')) {
  document.getElementById('boot-splash')?.remove()
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminAuthProvider>
      <PortfolioDataProvider>
        <RouterProvider router={router} />
      </PortfolioDataProvider>
    </AdminAuthProvider>
  </StrictMode>,
)