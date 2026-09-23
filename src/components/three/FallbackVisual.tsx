import logoUrl from '@/assets/logo-elchivalez.png'

interface FallbackVisualProps {
  active?: boolean
}

export function FallbackVisual({ active = false }: FallbackVisualProps) {
  return (
    <div
      className={`relative aspect-square w-full max-w-md ${active ? '' : 'animate-float'}`}
      aria-hidden="true"
    >
      <img
        src={logoUrl}
        alt=""
        role="presentation"
        className="absolute inset-0 m-auto h-[58%] w-[58%] object-contain"
      />
    </div>
  )
}