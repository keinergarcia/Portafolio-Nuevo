import { supabase, isSupabaseConfigured } from '@/lib/supabase'

/** Incrementa el contador de descargas (RPC security definer para anónimos). */
export async function registerDocumentDownload(documentId: string): Promise<void> {
  if (!isSupabaseConfigured()) return
  const { error } = await supabase.rpc('increment_document_download', {
    doc_id: documentId,
  })
  if (error) console.warn('No se pudo registrar la descarga:', error.message)
}
