"use server";

import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { GLOBAL_FORM_KEY, type FormEmailConfig } from "@/lib/email/form-config";
import { isFormType } from "@/lib/email/form-definitions";
import { type ActionState, firstFieldErrors } from "@/lib/form-errors";
import { requireAdmin } from "@/lib/require-admin";
import { isMissingTableError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";
import { formEmailConfigSchema, globalFormEmailSchema } from "@/lib/validations/form-email";

const NOT_ADMIN_ERROR = "Solo un Administrador puede cambiar la configuración de correos.";
const SAVE_ERROR = "No se pudo guardar la configuración. Intenta de nuevo.";
const MIGRATION_PENDING_ERROR =
  "La configuración de correos todavía no está habilitada en la base de datos (falta aplicar la migración 028).";

/**
 * Lee las filas "additional.N" del formulario. Las direcciones en blanco se
 * descartan aquí (no se guardan filas vacías); el resto lo valida Zod.
 * `additionalCount` oculto le dice a la acción cuántas filas hay (mismo
 * patrón que BeliefsEditor).
 */
function readAdditional(formData: FormData): string[] {
  const count = Number(formData.get("additionalCount") ?? 0);
  const out: string[] = [];
  for (let i = 0; i < Math.min(count, 50); i++) {
    const value = formData.get(`additional.${i}`);
    if (typeof value === "string" && value.trim() !== "") out.push(value.trim());
  }
  return out;
}

async function persist(formKey: string, config: unknown, description: string): Promise<ActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("form_email_settings")
    .upsert({ form_key: formKey, config, updated_by: user?.id }, { onConflict: "form_key" })
    .select("form_key");

  if (error) return { error: isMissingTableError(error) ? MIGRATION_PENDING_ERROR : SAVE_ERROR };
  // Éxito solo si de verdad quedó una fila escrita (RLS puede filtrar sin dar error).
  if (!data || data.length === 0) return { error: SAVE_ERROR };

  await logAudit({
    module: "inbox",
    action: "update",
    entityType: "form_email_settings",
    description,
  });

  // La configuración no se cachea: cada envío la lee de la base de datos, así que la
  // siguiente solicitud ya usa lo recién guardado. Solo se refresca esta pantalla.
  revalidatePath("/admin/formularios/configuracion");
  return { success: true };
}

/** Configuración de UN formulario (notificación interna + respuesta automática). */
export async function updateFormEmailConfig(
  formKey: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!(await requireAdmin())) return { error: NOT_ADMIN_ERROR };
  if (!isFormType(formKey)) return { error: "Formulario desconocido." };

  const parsed = formEmailConfigSchema.safeParse({
    internalEnabled: formData.get("internalEnabled") === "on",
    useDefaultRecipient: formData.get("useDefaultRecipient") === "on",
    primary: String(formData.get("primary") ?? ""),
    additional: readAdditional(formData),
    autoReplyEnabled: formData.get("autoReplyEnabled") === "on",
    autoReplySubject: String(formData.get("autoReplySubject") ?? ""),
    autoReplyMessage: String(formData.get("autoReplyMessage") ?? ""),
  });
  if (!parsed.success) return { fieldErrors: firstFieldErrors(parsed.error.issues) };

  const d = parsed.data;
  const config: FormEmailConfig = {
    internal: {
      enabled: d.internalEnabled,
      useDefaultRecipient: d.useDefaultRecipient,
      primary: d.primary,
      additional: d.additional,
    },
    autoReply: { enabled: d.autoReplyEnabled, subject: d.autoReplySubject, message: d.autoReplyMessage },
  };

  return persist(formKey, config, `Actualizó la configuración de correos del formulario "${formKey}".`);
}

/** "Correo administrativo predeterminado": respaldo común de todos los formularios. */
export async function updateDefaultFormRecipient(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!(await requireAdmin())) return { error: NOT_ADMIN_ERROR };

  const parsed = globalFormEmailSchema.safeParse({
    defaultRecipient: String(formData.get("defaultRecipient") ?? ""),
  });
  if (!parsed.success) return { fieldErrors: firstFieldErrors(parsed.error.issues) };

  return persist(
    GLOBAL_FORM_KEY,
    { defaultRecipient: parsed.data.defaultRecipient },
    "Actualizó el correo administrativo predeterminado de los formularios."
  );
}
