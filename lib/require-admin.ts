import { createClient } from "@/lib/supabase/server";

/**
 * Devuelve el usuario si la sesión actual es de un Administrador activo, o
 * null. Para Server Actions que usan service_role (bypasea RLS) o que
 * escriben configuración solo-admin: ahí RLS no basta como única barrera, o
 * conviene responder con un mensaje claro en vez de un error genérico.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, active")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin" || !profile.active) return null;
  return user;
}
