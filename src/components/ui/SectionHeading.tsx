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
        'max-w-3xl',
        align === 'center' && 'mx-auto flex flex-col items-center text-center',
        className,
      )}
    >
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-5 font-display text-[2rem] leading-[1.08] font-bold tracking-[-0.025em] text-balance text-foreground sm:text-4xl lg:text-[2.9rem]">
        {title}
        {highlight && <span className="text-gradient"> {highlight}</span>}
      </h2>
      {description && (
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-pretty text-muted sm:text-lg">
          {description}
        </p>
      )}
    </Reveal>
  )
}
