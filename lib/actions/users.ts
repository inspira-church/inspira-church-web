"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { type ActionState, firstFieldErrors } from "@/lib/form-errors";
import { getSiteUrl } from "@/lib/get-site-url";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { inviteUserSchema, updateUserSchema } from "@/lib/validations/user";

const NOT_ADMIN_ERROR = "Solo un Administrador puede gestionar usuarios.";
const PRIMARY_ADMIN_ERROR =
  "No se puede modificar la cuenta del administrador principal de esa forma.";

/**
 * El cliente admin (service_role) bypasea RLS por completo, así que a
 * diferencia del resto de módulos (protegidos solo por políticas RLS), aquí
 * hay que verificar el rol a mano antes de tocarlo.
 */
async function requireAdmin() {
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

function parseInviteForm(formData: FormData) {
  return {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    role: formData.get("role"),
  };
}

export async function inviteStaffUser(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: NOT_ADMIN_ERROR };

  const parsed = inviteUserSchema.safeParse(parseInviteForm(formData));
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const adminClient = createAdminClient();
  const siteUrl = await getSiteUrl();

  const { data, error } = await adminClient.auth.admin.inviteUserByEmail(parsed.data.email, {
    data: { full_name: parsed.data.fullName },
    redirectTo: `${siteUrl}/auth/confirm?next=/admin/actualizar-password`,
  });

  if (error || !data.user) {
    let message = "No se pudo enviar la invitación. Intenta de nuevo.";
    if (error?.code === "email_exists") {
      message = "Ya existe una cuenta de staff con ese correo.";
    } else if (error?.code === "over_email_send_rate_limit") {
      message =
        "Se alcanzó el límite de correos del proyecto. Espera unos minutos e intenta de nuevo.";
    }
    return { error: message };
  }

  // El trigger on_auth_user_created ya creó la fila en profiles con
  // role='editor' por defecto; completamos rol y teléfono reales.
  await adminClient
    .from("profiles")
    .update({ phone: parsed.data.phone, role: parsed.data.role })
    .eq("id", data.user.id);

  await logAudit({
    module: "users",
    action: "create",
    entityType: "profile",
    entityId: data.user.id,
    description: `Invitó a "${parsed.data.fullName}" (${parsed.data.role}) como staff.`,
  });

  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}

export async function updateStaffUser(
  id: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const admin = await requireAdmin();
  if (!admin) return { error: NOT_ADMIN_ERROR };

  const parsed = updateUserSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone") || undefined,
    role: formData.get("role"),
    active: formData.get("active") === "on",
  });
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone,
      role: parsed.data.role,
      active: parsed.data.active,
    })
    .eq("id", id);

  if (error) {
    // El trigger protect_primary_admin_trigger rechaza degradar/desactivar
    // al admin principal — es el caso más probable de error aquí.
    return { error: PRIMARY_ADMIN_ERROR };
  }

  await logAudit({
    module: "users",
    action: "update",
    entityType: "profile",
    entityId: id,
    description: `Actualizó al usuario "${parsed.data.fullName}" (rol: ${parsed.data.role}, activo: ${parsed.data.active}).`,
  });

  revalidatePath("/admin/usuarios");
  redirect("/admin/usuarios");
}

export async function toggleStaffActive(id: string, nextActive: boolean) {
  const admin = await requireAdmin();
  if (!admin) return;

  const supabase = await createClient();
  await supabase.from("profiles").update({ active: nextActive }).eq("id", id);
  await logAudit({
    module: "users",
    action: nextActive ? "activate" : "deactivate",
    entityType: "profile",
    entityId: id,
    description: `${nextActive ? "Activó" : "Desactivó"} a un usuario del staff.`,
  });
  revalidatePath("/admin/usuarios");
}
