import { createBrowserClient } from '@supabase/ssr'

/**
 * Cliente de Supabase para Client Components. Usa la clave `anon`, la misma
 * que protege RLS — nunca la service role key llega a este archivo.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
