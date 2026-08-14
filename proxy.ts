import type { NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Next.js 16 renombró `middleware.ts` a `proxy.ts` (la función exportada
// pasó de `middleware` a `proxy`); la funcionalidad es la misma. Ver
// https://nextjs.org/docs/app/api-reference/file-conventions/proxy — este
// proyecto se creó directamente con la convención nueva.
export async function proxy(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: [
    // Corre en todo excepto assets estáticos e imágenes optimizadas — si no
    // se excluyen, el proxy se ejecuta también para cada CSS/JS/imagen.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
