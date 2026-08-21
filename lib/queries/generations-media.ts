import { createPublicClient } from "@/lib/supabase/public";
import { createClient as createServerClient } from "@/lib/supabase/server";

type MediaClient = Awaited<ReturnType<typeof createPublicClient>> | Awaited<ReturnType<typeof createServerClient>>;

async function batchGenerationsMedia(supabase: MediaClient): Promise<Record<string, string>> {
  const { data } = await supabase
    .from("media")
    .select("path, module, created_at")
    .like("module", "generaciones-%")
    .order("created_at", { ascending: false });

  const result: Record<string, string> = {};
  for (const row of data ?? []) {
    if (!row.module || result[row.module]) continue;
    result[row.module] = supabase.storage.from("site").getPublicUrl(row.path).data.publicUrl;
  }
  return result;
}

/**
 * Una sola query para los ~15 slots de foto de Generaciones (6 fijos + uno
 * por área), en vez de una consulta por slot — mismo criterio de batching
 * que getHeroSlides() en lib/queries/media.ts. Devuelve módulo -> URL
 * pública; un módulo sin fila subida simplemente no aparece en el mapa
 * (el consumidor cae al placeholder de GenerationsPhotoSlot). Cliente
 * anon — solo ve lo que permite media_select_public_hero (027).
 */
export async function getGenerationsMedia(): Promise<Record<string, string>> {
  const supabase = await createPublicClient();
  return batchGenerationsMedia(supabase);
}

/**
 * Misma consulta, pero con el cliente de sesión (is_editor_or_admin() vía
 * media_all_staff) en vez del cliente anon — para que /admin/generaciones
 * siempre vea las fotos recién subidas, incluso antes de correr la
 * migración 027 que habilita la lectura pública. Mismo criterio que
 * getSiteMediaUrl() en app/admin/(dashboard)/nosotros/page.tsx: el bug de
 * "invisible en /admin, roto en el sitio público" solo existe si el admin
 * también usara el cliente anon.
 */
export async function getGenerationsMediaForAdmin(): Promise<Record<string, string>> {
  const supabase = await createServerClient();
  return batchGenerationsMedia(supabase);
}
