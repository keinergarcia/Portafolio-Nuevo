interface AdminHeaderProps {
  eyebrow: string
  title: string
  description?: string
}

export function AdminHeader({ eyebrow, title, description }: AdminHeaderProps) {
  return (
    <header className="flex flex-col gap-1">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      {description && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{description}</p>}
    </header>
  )
}