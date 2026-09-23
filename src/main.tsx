import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import './index.css'
import { router } from './App'
import { AdminAuthProvider } from '@/contexts/AdminAuth'
import { PortfolioDataProvider } from '@/contexts/PortfolioData'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AdminAuthProvider>
      <PortfolioDataProvider>
        <RouterProvider router={router} />
      </PortfolioDataProvider>
    </AdminAuthProvider>
  </StrictMode>,
)