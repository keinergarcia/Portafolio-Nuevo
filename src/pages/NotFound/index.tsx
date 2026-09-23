import { Link } from 'react-router'

export function NotFound() {
  return (
    <section className="shell section-pad text-center">
      <p className="eyebrow">Error 404</p>
      <h1 className="mt-4 font-display text-7xl font-bold tracking-tight">404</h1>
      <p className="mt-4 text-muted">La página que buscas no existe.</p>
      <Link
        to="/"
        className="mt-8 inline-block rounded-lg bg-gradient-to-r from-primary to-secondary px-6 py-3 text-sm font-semibold text-background"
      >
        Volver al inicio
      </Link>
    </section>
  )
}