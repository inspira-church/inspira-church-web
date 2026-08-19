"use server";

import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { type ActionState, firstFieldErrors } from "@/lib/form-errors";
import { createClient } from "@/lib/supabase/server";
import { aboutContentSchema } from "@/lib/validations/about";

function parseForm(formData: FormData) {
  const values = [0, 1, 2, 3].map((i) => ({
    title: formData.get(`values.${i}.title`),
    description: formData.get(`values.${i}.description`),
  }));

  const beliefsCount = Number(formData.get("beliefsCount") ?? 0);
  const beliefs = Array.from({ length: beliefsCount }, (_, i) => ({
    category: formData.get(`beliefs.${i}.category`),
    content: formData.get(`beliefs.${i}.content`),
    visible: formData.get(`beliefs.${i}.visible`) != null,
  }));

  return {
    historyEyebrow: formData.get("historyEyebrow"),
    historyTitle: formData.get("historyTitle"),
    historyText: formData.get("historyText"),
    historyImageAlt: formData.get("historyImageAlt") || "",

    purposeEyebrow: formData.get("purposeEyebrow"),
    purposeTitle: formData.get("purposeTitle"),
    missionTitle: formData.get("missionTitle"),
    missionHeadline: formData.get("missionHeadline"),
    missionText: formData.get("missionText"),
    visionTitle: formData.get("visionTitle"),
    visionHeadline: formData.get("visionHeadline"),
    visionText: formData.get("visionText"),

    essenceTitle: formData.get("essenceTitle"),
    essenceText: formData.get("essenceText"),
    essenceImageAlt: formData.get("essenceImageAlt") || "",

    valuesEyebrow: formData.get("valuesEyebrow"),
    valuesTitle: formData.get("valuesTitle"),
    values,

    beliefsEyebrow: formData.get("beliefsEyebrow"),
    beliefsTitle: formData.get("beliefsTitle"),
    beliefsIntro: formData.get("beliefsIntro"),
    beliefs,

    visitEyebrow: formData.get("visitEyebrow"),
    visitTitle: formData.get("visitTitle"),

    ctaTitle: formData.get("ctaTitle"),
    ctaText: formData.get("ctaText"),
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

  await logAudit({
    module: "about",
    action: "update",
    entityType: "about_content",
    description: "Actualizó el contenido de la página Nosotros.",
  });

  revalidatePath("/admin/nosotros");
  revalidatePath("/nosotros");
  return { success: true };
}
