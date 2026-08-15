import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de solo lectura para contenido público (prédicas, series, grupos,
 * eventos, equipo, horarios, configuración del sitio). A diferencia de
 * lib/supabase/server.ts, no llama a cookies() — eso es justamente lo que
 * hoy fuerza a Next.js a renderizar cada página pública en modo dinámico
 * (sin caché) aunque el contenido cambie pocas veces por semana. Al no
 * tocar cookies(), estas páginas pueden usar `export const revalidate`
 * (ver app/(public)/layout.tsx) para servirse cacheadas.
 *
 * Solo para lecturas ya protegidas por políticas RLS `to anon` — nunca uses
 * este cliente para datos de staff o del usuario autenticado.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
