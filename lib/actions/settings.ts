"use server";

import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { type ActionState, firstFieldErrors } from "@/lib/form-errors";
import type { PermissionModule } from "@/lib/permissions";
import { getSiteSettings } from "@/lib/queries/settings";
import { createClient } from "@/lib/supabase/server";
import { siteSettingsSchema } from "@/lib/validations/settings";

/**
 * Guarda un subconjunto de site_settings sin pisar el resto de campos —
 * cada página admin (Inicio, Nosotros, Primera vez, Contacto) solo conoce
 * sus propios campos, no todo el objeto. Mergea sobre el valor actual y
 * revalida el objeto completo para que la fila nunca quede en un estado
 * inválido en la base de datos.
 */
async function saveSettingsPartial(
  partial: Record<string, unknown>,
  module: PermissionModule,
  description: string,
  revalidate: () => void
): Promise<ActionState> {
  const current = await getSiteSettings();
  const merged = { ...current, ...partial };

  const parsed = siteSettingsSchema.safeParse(merged);
  if (!parsed.success) {
    const allErrors = firstFieldErrors(parsed.error.issues);
    const ownErrors = Object.fromEntries(
      Object.entries(allErrors).filter(([key]) => key in partial)
    );
    return { fieldErrors: Object.keys(ownErrors).length > 0 ? ownErrors : allErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "general", value: parsed.data, updated_by: user?.id }, { onConflict: "key" });

  // RLS (site_settings_write_admin / site_settings_update_admin) rechaza
  // esto si quien llama no es Administrador — es la única barrera aquí,
  // no hace falta duplicarla a mano como en lib/actions/users.ts.
  if (error) {
    return { error: "No se pudo guardar la configuración. Intenta de nuevo." };
  }

  await logAudit({
    module,
    action: "update",
    entityType: "site_settings",
    description,
  });

  revalidate();
  revalidatePath("/", "layout");
  return { success: true };
}

/** Textos del hero de Inicio y el canal de YouTube para "En vivo". */
export async function updateHomeSettings(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  return saveSettingsPartial(
    {
      heroText1: formData.get("heroText1"),
      heroText2: formData.get("heroText2"),
      youtubeChannelId: formData.get("youtubeChannelId") || undefined,
    },
    "home",
    "Actualizó el texto del hero de Inicio.",
    () => revalidatePath("/admin/inicio")
  );
}

/** Texto del hero de /primera-vez (la foto se sube aparte, vía media). */
export async function updateFirstTimeSettings(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  return saveSettingsPartial(
    { firstTimeHeroText: formData.get("firstTimeHeroText") },
    "first_time",
    'Actualizó el texto del hero de "Primera vez".',
    () => revalidatePath("/admin/primera-vez")
  );
}

/** WhatsApp, redes sociales y política de privacidad — usados en el footer y formularios públicos. */
export async function updateContactSettings(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  return saveSettingsPartial(
    {
      whatsappNumber: formData.get("whatsappNumber"),
      whatsappMessage: formData.get("whatsappMessage"),
      facebookUrl: formData.get("facebookUrl") || undefined,
      instagramUrl: formData.get("instagramUrl") || undefined,
      tiktokUrl: formData.get("tiktokUrl") || undefined,
      xUrl: formData.get("xUrl") || undefined,
      youtubeUrl: formData.get("youtubeUrl") || undefined,
      privacyPolicyUrl: formData.get("privacyPolicyUrl") || undefined,
    },
    "contact_settings",
    "Actualizó la configuración de contacto.",
    () => revalidatePath("/admin/contacto")
  );
}

/** Dirección y coordenadas de la sede — usadas en /nosotros (mapa) y el footer. */
export async function updateAboutLocation(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  return saveSettingsPartial(
    {
      churchAddress: formData.get("churchAddress") || undefined,
      churchLat: formData.get("churchLat") || undefined,
      churchLng: formData.get("churchLng") || undefined,
    },
    "about",
    "Actualizó la ubicación de la sede.",
    () => revalidatePath("/admin/nosotros")
  );
}
