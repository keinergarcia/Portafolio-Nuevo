import { Award, Download, FileText, GraduationCap, ScrollText } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Reveal } from '@/components/animations/Reveal'
import { usePortfolioData } from '@/contexts/PortfolioData'
import { registerDocumentDownload } from '@/services/supabase/documents'
import type { Document } from '@/types'

const KIND_META: Record<string, { label: string; icon: typeof FileText }> = {
  cv: { label: 'Hoja de vida', icon: ScrollText },
  title: { label: 'Título', icon: GraduationCap },
  certificate: { label: 'Certificado', icon: Award },
  other: { label: 'Documento', icon: FileText },
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function DocumentRow({ document }: { document: Document }) {
  const meta = KIND_META[document.kind] ?? KIND_META.other
  const Icon = meta.icon

  return (
    <Reveal delay={0.05}>
      <div className="glass group flex items-center gap-4 rounded-2xl p-4 transition-colors hover:border-white/[0.14] sm:p-5">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-gradient-to-br from-primary/15 to-tertiary/15 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <Icon size={22} aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold tracking-tight text-foreground">
            {document.title}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-sm text-muted">
            <span>{meta.label}</span>
            {document.file_size && (
              <span className="font-mono text-xs">{formatBytes(document.file_size)}</span>
            )}
            {document.downloads > 0 && (
              <span className="font-mono text-xs">{document.downloads} descargas</span>
            )}
          </p>
          {document.description && (
            <p className="mt-1 hidden text-sm text-muted sm:block">{document.description}</p>
          )}
        </div>

        <a
          href={document.file_url}
          target="_blank"
          rel="noreferrer"
          onClick={() => void registerDocumentDownload(document.id)}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary transition hover:bg-primary/20 hover:shadow-glow"
          aria-label={`Descargar ${document.title}`}
        >
          <Download size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Descargar</span>
        </a>
      </div>
    </Reveal>
  )
}

export function Documents() {
  const { documents } = usePortfolioData()

  // Sin documentos cargados la sección no se muestra.
  if (documents.length === 0) return null

  return (
    <section id="documentos" className="section-pad shell">
      <SectionHeading
        eyebrow="Documentos"
        title="Hoja de vida y"
        highlight="certificados"
        description="Descarga mi hoja de vida, títulos y certificados. Todo verificado y siempre actualizado."
      />

      <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-3">
        {documents.map((document) => (
          <DocumentRow key={document.id} document={document} />
        ))}
      </div>
    </section>
  )
}
