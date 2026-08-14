import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * Cliente de Supabase para Server Components, Server Actions y Route
 * Handlers. Crea una instancia nueva en cada request — nunca se comparte
 * entre requests (así lo exige @supabase/ssr).
 */
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Un Server Component no puede escribir cookies (Next.js lo
            // impide fuera de Server Actions/Route Handlers). No es un
            // error: el proxy.ts se encarga de refrescar la sesión en esos
            // casos.
          }
        },
      },
    }
  )
}
