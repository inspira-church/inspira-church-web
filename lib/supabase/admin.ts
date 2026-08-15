import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente con la service_role key: bypasea RLS por completo y puede llamar
 * a supabase.auth.admin.*. Úsalo solo dentro de Server Actions que ya
 * verificaron is_admin() con el cliente normal — nunca se importa desde un
 * componente cliente ni se expone su resultado directo al navegador.
 */
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY no está configurada. Agrégala en .env.local (Supabase → Settings → API)."
    );
  }

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
