import { useState } from 'react'
import { RotateCcw, Settings2, X } from 'lucide-react'
import { useEffects } from '@/contexts/Effects'
import { cn } from '@/lib/utils'

export function FxPanel() {
  const [open, setOpen] = useState(false)
  const {
    background3D,
    trailThickness,
    trailLife,
    setBackground3D,
    setTrailThickness,
    setTrailLife,
    reset,
  } = useEffects()

  return (
    <div className="fixed bottom-4 right-4 z-[90]">
      {open ? (
        <section
          aria-label="Panel de efectos de fondo"
          className="glass-strong w-72 rounded-2xl p-4 shadow-2xl"
        >
          <header className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold tracking-tight">Fondo y puntero</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar panel"
              className="rounded-lg p-1.5 text-muted transition hover:bg-white/[0.06] hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="mt-4 space-y-4">
            <label className="flex items-center justify-between gap-3">
              <span className="text-sm text-foreground">Efectos de fondo y puntero</span>
              <input
                type="checkbox"
                checked={background3D}
                onChange={(event) => setBackground3D(event.target.checked)}
                className="h-4 w-4 accent-[#22d3ee]"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 flex items-center justify-between text-sm text-muted">
                <span>Grosor de la línea</span>
                <span className="font-mono text-primary">{trailThickness.toFixed(1)}</span>
              </span>
              <input
                type="range"
                min={0.6}
                max={3}
                step={0.1}
                value={trailThickness}
                onChange={(event) => setTrailThickness(Number(event.target.value))}
                className="w-full accent-[#22d3ee]"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 flex items-center justify-between text-sm text-muted">
                <span>Vida de la línea</span>
                <span className="font-mono text-primary">{trailLife.toFixed(2)}s</span>
              </span>
              <input
                type="range"
                min={0.3}
                max={1.6}
                step={0.05}
                value={trailLife}
                onChange={(event) => setTrailLife(Number(event.target.value))}
                className="w-full accent-[#22d3ee]"
              />
              <span className="mt-1 block text-xs text-muted">
                Menos tiempo = se desintegra más rápido
              </span>
            </label>

            <button
              type="button"
              onClick={reset}
              className={cn(
                'flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm text-muted',
                'transition hover:border-white/25 hover:text-foreground',
              )}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Restablecer
            </button>
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Abrir panel de efectos"
          className="glass-strong flex h-12 w-12 items-center justify-center rounded-full text-primary shadow-glow transition hover:scale-105"
        >
          <Settings2 className="h-5 w-5" />
        </button>
      )}
    </div>
  )
}