import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { PermissionModule } from "@/lib/permissions";

interface LogAuditInput {
  module: PermissionModule;
  /** Verbo libre: 'create' | 'update' | 'delete' | 'publish' | 'unpublish' | 'status_change'… */
  action: string;
  entityType: string;
  entityId?: string | null;
  description: string;
  previousData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
}

/**
 * Registra una acción administrativa en audit_logs, a nombre del usuario
 * autenticado actual (RLS de audit_logs exige user_id = auth.uid() — ver
 * 010_audit_logs.sql). Nunca guarda contraseñas, tokens ni el contenido
 * completo de una petición de oración o contacto — solo IDs, título/nombre
 * y los campos de negocio que cambiaron.
 *
 * Un fallo al registrar la auditoría nunca debe tumbar la acción principal
 * (crear/editar/borrar ya se hizo) — por eso todo el cuerpo va en try/catch
 * y no propaga el error.
 */
export async function logAudit(input: LogAuditInput): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, role")
      .eq("id", user.id)
      .maybeSingle();

    await supabase.from("audit_logs").insert({
      user_id: user.id,
      user_name: profile?.full_name ?? null,
      user_role: profile?.role ?? null,
      module: input.module,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId ?? null,
      description: input.description,
      previous_data: input.previousData ?? null,
      new_data: input.newData ?? null,
    });
  } catch {
    // No interrumpir la acción principal por un fallo de auditoría.
  }
}

interface LogAuthEventInput {
  action: "login" | "login_failed" | "logout";
  userId: string | null;
  description: string;
}

/**
 * Registra inicio/cierre de sesión. Usa el cliente service_role porque un
 * intento de login fallido no tiene sesión todavía para pasar la política
 * RLS normal de audit_logs (que exige estar autenticado) — ese cliente
 * bypasea RLS, así que solo se llama desde lib/actions/auth.ts, nunca
 * desde código expuesto al navegador.
 */
export async function logAuthEvent(input: LogAuthEventInput): Promise<void> {
  try {
    const adminClient = createAdminClient();
    let userName: string | null = null;
    let userRole: string | null = null;

    if (input.userId) {
      const { data: profile } = await adminClient
        .from("profiles")
        .select("full_name, role")
        .eq("id", input.userId)
        .maybeSingle();
      userName = profile?.full_name ?? null;
      userRole = profile?.role ?? null;
    }

    await adminClient.from("audit_logs").insert({
      user_id: input.userId,
      user_name: userName,
      user_role: userRole,
      module: "auth",
      action: input.action,
      entity_type: "session",
      description: input.description,
    });
  } catch {
    // No interrumpir el flujo de login/logout por un fallo de auditoría.
  }
}
