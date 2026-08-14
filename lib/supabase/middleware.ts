import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Refresca la sesión de Supabase en cada request y propaga la cookie
 * actualizada. Se llama desde proxy.ts.
 *
 * Esta fase (3) solo deja la sesión viva de punta a punta; la protección
 * real de /admin (redirigir sin sesión, bloquear por rol) se agrega en la
 * Fase 6, cuando exista la página de login.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Sin credenciales todavía no hay sesión que refrescar (proyecto Supabase
  // no conectado aún). Sin este corte, el proxy —que corre en cada
  // request— rompería absolutamente todo el sitio, incluidas las páginas
  // públicas que no usan Supabase. Avisa una sola vez por proceso, no en
  // cada request.
  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV !== 'production') {
      warnMissingSupabaseEnvOnce()
    }
    return response
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Dispara el refresco del token si expiró; sin esto, sesiones largas se
  // cierran solas a media navegación.
  await supabase.auth.getUser()

  return response
}

let warned = false
function warnMissingSupabaseEnvOnce() {
  if (warned) return
  warned = true
  console.warn(
    '[proxy] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY no están configuradas en .env.local — la sesión no se refresca hasta que conectes un proyecto de Supabase.'
  )
}
