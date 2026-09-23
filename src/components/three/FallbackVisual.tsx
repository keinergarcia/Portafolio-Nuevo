interface FallbackVisualProps {
  active?: boolean
}

export function FallbackVisual({ active = false }: FallbackVisualProps) {
  return (
    <div
      className={`relative aspect-square w-full max-w-md ${active ? '' : 'animate-float'}`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/25 via-secondary/20 to-tertiary/25 blur-3xl" />

      <div className="absolute inset-[6%] rounded-full border border-primary/20" />
      <div className="absolute inset-[16%] rounded-full border border-secondary/20" />
      <div className="absolute inset-[28%] rounded-full border border-tertiary/20" />

      <div className="absolute inset-[34%] rounded-full bg-gradient-to-br from-primary via-secondary to-tertiary shadow-glow" />

      <div className="absolute left-[8%] top-[18%] h-2 w-2 rounded-full bg-primary shadow-glow" />
      <div className="absolute right-[10%] top-[40%] h-1.5 w-1.5 rounded-full bg-secondary shadow-glow-soft" />
      <div className="absolute bottom-[22%] left-[20%] h-1.5 w-1.5 rounded-full bg-tertiary shadow-glow" />
    </div>
  )
}