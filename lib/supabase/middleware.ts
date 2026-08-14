import { createServerClient } from '@supabase/ssr'
import type { AuthUser } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Refresca la sesión de Supabase en cada request, propaga la cookie
 * actualizada y devuelve el usuario autenticado (o null) para que proxy.ts
 * decida si protege la ruta — evita crear un segundo cliente de Supabase
 * solo para volver a preguntar quién es.
 */
export async function updateSession(
  request: NextRequest
): Promise<{ response: NextResponse; user: AuthUser | null }> {
  let response = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Sin credenciales todavía no hay sesión que refrescar (proyecto Supabase
  // no conectado aún). Sin este corte, el proxy —que corre en cada
  // request— rompería absolutamente todo el sitio, incluidas las páginas
  // públicas que no usan Supabase. Avisa una sola vez por proceso, no en
  // cada request. `user: null` hace que proxy.ts trate esto igual que
  // "nadie ha iniciado sesión", que es lo correcto: sin Supabase conectado
  // no hay forma legítima de estar autenticado.
  if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV !== 'production') {
      warnMissingSupabaseEnvOnce()
    }
    return { response, user: null }
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
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return { response, user }
}

let warned = false
function warnMissingSupabaseEnvOnce() {
  if (warned) return
  warned = true
  console.warn(
    '[proxy] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY no están configuradas en .env.local — la sesión no se refresca hasta que conectes un proyecto de Supabase.'
  )
}
