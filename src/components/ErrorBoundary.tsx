import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
  retries: number
}

/**
 * Barrera de error global. Evita que un error en tiempo de ejecución
 * (por ejemplo, al desmontar una escena 3D durante un cambio de ruta)
 * deje la página en blanco: captura el error, intenta recuperarse solo
 * un par de veces y, si persiste, muestra una pantalla de reintento.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, retries: 0 }

  private timer: number | null = null

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  componentDidUpdate(_prevProps: Props, prevState: State) {
    if (this.state.error && !prevState.error && this.state.retries < 3) {
      const retries = this.state.retries + 1
      this.timer = window.setTimeout(() => {
        this.setState({ error: null, retries })
      }, 100)
    }
  }

  componentWillUnmount() {
    if (this.timer !== null) window.clearTimeout(this.timer)
  }

  private handleRetry = () => {
    this.setState({ error: null, retries: 0 })
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="font-display text-2xl font-bold text-foreground">
            Ocurrió un error inesperado
          </h1>
          <p className="max-w-md text-sm leading-relaxed text-muted">
            Tu contenido está a salvo. Intenta recargar la página para continuar.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="rounded-xl bg-gradient-to-r from-primary to-secondary px-6 py-3 text-sm font-semibold text-background shadow-glow transition hover:brightness-110"
          >
            Reintentar
          </button>
        </div>
      )
    }

    return <>{this.props.children}</>
  }
}
