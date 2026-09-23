interface TechnologyChipProps {
  name: string
}

export function TechnologyChip({ name }: TechnologyChipProps) {
  return (
    <span className="glass rounded-xl px-4 py-3 font-display text-sm font-medium text-foreground transition-colors duration-200 hover:border-primary/30 hover:text-primary">
      {name}
    </span>
  )
}