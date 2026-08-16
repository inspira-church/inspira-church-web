"use server";

import { revalidatePath } from "next/cache";
import { type ActionState, firstFieldErrors } from "@/lib/form-errors";
import { createClient } from "@/lib/supabase/server";
import { aboutContentSchema } from "@/lib/validations/about";

function parseForm(formData: FormData) {
  const values = [0, 1, 2, 3].map((i) => ({
    title: formData.get(`values.${i}.title`),
    description: formData.get(`values.${i}.description`),
  }));

  const beliefs = String(formData.get("beliefs") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    historyEyebrow: formData.get("historyEyebrow"),
    historyTitle: formData.get("historyTitle"),
    historyText: formData.get("historyText"),
    missionTitle: formData.get("missionTitle"),
    missionText: formData.get("missionText"),
    visionTitle: formData.get("visionTitle"),
    visionText: formData.get("visionText"),
    valuesEyebrow: formData.get("valuesEyebrow"),
    valuesTitle: formData.get("valuesTitle"),
    values,
    beliefsEyebrow: formData.get("beliefsEyebrow"),
    beliefsTitle: formData.get("beliefsTitle"),
    beliefs,
  };
}

export async function updateAboutContent(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = aboutContentSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "about", value: parsed.data, updated_by: user?.id }, { onConflict: "key" });

  // RLS (site_settings_write_admin / site_settings_update_admin) rechaza esto
  // si quien llama no es Administrador — igual que en lib/actions/settings.ts.
  if (error) {
    return { error: "No se pudo guardar. Intenta de nuevo." };
  }

  revalidatePath("/admin/nosotros");
  revalidatePath("/nosotros");
  return { success: true };
}
