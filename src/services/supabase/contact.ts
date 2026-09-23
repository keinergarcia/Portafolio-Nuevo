import { isSupabaseConfigured, supabase } from '@/lib/supabase'

export interface ContactFormInput {
  name: string
  email: string
  phone: string | null
  service_type: string | null
  message: string
}

export async function submitContact(input: ContactFormInput) {
  if (!isSupabaseConfigured()) {
    await new Promise((resolve) => setTimeout(resolve, 600))
    return
  }

  const { error } = await supabase.from('contact_messages').insert({
    name: input.name,
    email: input.email,
    phone: input.phone,
    service_type: input.service_type,
    message: input.message,
    status: 'new',
  })

  if (error) {
    throw new Error('No se pudo enviar el mensaje. Inténtalo de nuevo.')
  }
}