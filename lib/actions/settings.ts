"use server";

import { revalidatePath } from "next/cache";
import { type ActionState, firstFieldErrors } from "@/lib/form-errors";
import { createClient } from "@/lib/supabase/server";
import { siteSettingsSchema } from "@/lib/validations/settings";

function parseForm(formData: FormData) {
  return {
    whatsappNumber: formData.get("whatsappNumber"),
    whatsappMessage: formData.get("whatsappMessage"),
    facebookUrl: formData.get("facebookUrl") || undefined,
    instagramUrl: formData.get("instagramUrl") || undefined,
    tiktokUrl: formData.get("tiktokUrl") || undefined,
    xUrl: formData.get("xUrl") || undefined,
    youtubeUrl: formData.get("youtubeUrl") || undefined,
    privacyPolicyUrl: formData.get("privacyPolicyUrl") || undefined,
    churchAddress: formData.get("churchAddress") || undefined,
    churchLat: formData.get("churchLat") || undefined,
    churchLng: formData.get("churchLng") || undefined,
    youtubeChannelId: formData.get("youtubeChannelId") || undefined,
  };
}

export async function updateSiteSettings(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = siteSettingsSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("site_settings")
    .upsert(
      { key: "general", value: parsed.data, updated_by: user?.id },
      { onConflict: "key" }
    );

  // RLS (site_settings_write_admin / site_settings_update_admin) rechaza
  // esto si quien llama no es Administrador — es la única barrera aquí,
  // no hace falta duplicarla a mano como en lib/actions/users.ts.
  if (error) {
    return { error: "No se pudo guardar la configuración. Intenta de nuevo." };
  }

  revalidatePath("/admin/configuracion");
  revalidatePath("/", "layout");
  return { success: true };
}
