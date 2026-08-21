"use server";

import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { type ActionState, firstFieldErrors } from "@/lib/form-errors";
import { createClient } from "@/lib/supabase/server";
import { generationsContentSchema } from "@/lib/validations/generations";

function parseForm(formData: FormData) {
  const areasCount = Number(formData.get("areasCount") ?? 0);
  const areas = Array.from({ length: areasCount }, (_, i) => {
    const groupsCount = Number(formData.get(`areas.${i}.groupsCount`) ?? 0);
    const groups = Array.from({ length: groupsCount }, (_, j) => ({
      label: formData.get(`areas.${i}.groups.${j}.label`) || "",
      age: formData.get(`areas.${i}.groups.${j}.age`),
      when: formData.get(`areas.${i}.groups.${j}.when`),
      practice: formData.get(`areas.${i}.groups.${j}.practice`) || "",
    }));
    return {
      id: formData.get(`areas.${i}.id`),
      name: formData.get(`areas.${i}.name`),
      tags: formData.get(`areas.${i}.tags`),
      purpose: formData.get(`areas.${i}.purpose`),
      groups,
    };
  });

  const journeyCount = Number(formData.get("journeyCount") ?? 0);
  const journey = Array.from({ length: journeyCount }, (_, i) => ({
    title: formData.get(`journey.${i}.title`),
    when: formData.get(`journey.${i}.when`) || "",
    text: formData.get(`journey.${i}.text`),
  }));

  const rhythmCount = Number(formData.get("rhythmCount") ?? 0);
  const rhythm = Array.from({ length: rhythmCount }, (_, i) => ({
    word: formData.get(`rhythm.${i}.word`),
    text: formData.get(`rhythm.${i}.text`),
  }));

  const safetyPrinciplesCount = Number(formData.get("safetyPrinciplesCount") ?? 0);
  const safetyPrinciples = Array.from({ length: safetyPrinciplesCount }, (_, i) =>
    formData.get(`safetyPrinciples.${i}`)
  );

  const faqCount = Number(formData.get("faqCount") ?? 0);
  const faq = Array.from({ length: faqCount }, (_, i) => ({
    q: formData.get(`faq.${i}.q`),
    a: formData.get(`faq.${i}.a`),
  }));

  return {
    heroEyebrow: formData.get("heroEyebrow"),
    heroTitle: formData.get("heroTitle"),
    heroTaglineWhite: formData.get("heroTaglineWhite"),
    heroTaglineCoral: formData.get("heroTaglineCoral"),
    heroVerseText: formData.get("heroVerseText"),
    heroVerseRef: formData.get("heroVerseRef"),

    visionTitleWhite1: formData.get("visionTitleWhite1"),
    visionTitleCoral1: formData.get("visionTitleCoral1"),
    visionTitleWhite2: formData.get("visionTitleWhite2"),
    visionTitleCoral2: formData.get("visionTitleCoral2"),
    visionText: formData.get("visionText"),
    visionClosing: formData.get("visionClosing"),

    legacyTitleWhite: formData.get("legacyTitleWhite"),
    legacyTitleCoral: formData.get("legacyTitleCoral"),

    areasTitle: formData.get("areasTitle"),
    areasIntro: formData.get("areasIntro"),
    areas,

    journeyTitle: formData.get("journeyTitle"),
    journey,

    ratioLeftPercent: formData.get("ratioLeftPercent"),
    ratioLeftLabel: formData.get("ratioLeftLabel"),
    ratioLeftText: formData.get("ratioLeftText"),
    ratioRightPercent: formData.get("ratioRightPercent"),
    ratioRightLabel: formData.get("ratioRightLabel"),
    ratioRightText: formData.get("ratioRightText"),
    ratioClosingFaded: formData.get("ratioClosingFaded"),
    ratioClosingWhite: formData.get("ratioClosingWhite"),

    altarTitle: formData.get("altarTitle"),
    altarText: formData.get("altarText"),
    altarTagline: formData.get("altarTagline"),

    familiesTitle: formData.get("familiesTitle"),
    familiesText: formData.get("familiesText"),
    parentsGuideUrl: formData.get("parentsGuideUrl") || "",

    nextDateEyebrow: formData.get("nextDateEyebrow"),
    nextDate: formData.get("nextDate") || "",
    nextDateNote: formData.get("nextDateNote") || "",

    rhythm,

    safetyEyebrow: formData.get("safetyEyebrow"),
    safetyTitle: formData.get("safetyTitle"),
    safetyPrinciples,
    careGuidelinesUrl: formData.get("careGuidelinesUrl") || "",

    faqTitle: formData.get("faqTitle"),
    faq,

    ctaTitle: formData.get("ctaTitle"),
    ctaTagline: formData.get("ctaTagline"),
    ctaClosing: formData.get("ctaClosing"),
  };
}

export async function updateGenerationsContent(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = generationsContentSchema.safeParse(parseForm(formData));
  if (!parsed.success) {
    return { fieldErrors: firstFieldErrors(parsed.error.issues) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const value = { ...parsed.data, nextDate: parsed.data.nextDate || null };

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key: "generaciones", value, updated_by: user?.id }, { onConflict: "key" });

  // RLS (site_settings_write_admin / site_settings_update_admin) rechaza esto
  // si quien llama no es Administrador — igual que en lib/actions/about.ts.
  if (error) {
    return { error: "No se pudo guardar. Intenta de nuevo." };
  }

  await logAudit({
    module: "generations",
    action: "update",
    entityType: "generations_content",
    description: "Actualizó el contenido de la página Generaciones.",
  });

  revalidatePath("/admin/generaciones");
  revalidatePath("/generaciones");
  revalidatePath("/generaciones/inscripcion");
  return { success: true };
}
