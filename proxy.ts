import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Next.js 16 renombró `middleware.ts` a `proxy.ts` (la función exportada
// pasó de `middleware` a `proxy`); la funcionalidad es la misma. Ver
// https://nextjs.org/docs/app/api-reference/file-conventions/proxy — este
// proyecto se creó directamente con la convención nueva.

// Rutas bajo /admin accesibles sin sesión — el resto de /admin/** exige
// estar autenticado. La restricción por rol (admin vs editor) sobre
// módulos específicos se agrega en la Fase 7, cuando existan esos módulos.
const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/recuperar', '/admin/actualizar-password']

function isPublicAdminPath(pathname: string) {
  return PUBLIC_ADMIN_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`))
}

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const { pathname } = request.nextUrl

  const isAdminRoute = pathname.startsWith('/admin')

  if (isAdminRoute && !isPublicAdminPath(pathname) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    url.search = ''
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Ya autenticado: no tiene sentido volver a mostrarle el login.
  if (pathname === '/admin/login' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    // Corre en todo excepto assets estáticos e imágenes optimizadas — si no
    // se excluyen, el proxy se ejecuta también para cada CSS/JS/imagen.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
