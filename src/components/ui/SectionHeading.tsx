import { cn } from '@/lib/utils'
import { Reveal } from '@/components/animations/Reveal'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  highlight?: string
  description?: string
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  highlight,
  description,
  align = 'left',
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
        {title}
        {highlight && <span className="text-gradient"> {highlight}</span>}
      </h2>
      {description && (
        <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
          {description}
        </p>
      )}
    </Reveal>
  )
}