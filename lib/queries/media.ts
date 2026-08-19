import { createPublicClient as createClient } from "@/lib/supabase/public";
import type { HeroSlide } from "@/components/public/Hero";

const HERO_SLOT_COUNT = 5;
const heroSlotModule = (slot: number) => `hero-slide-${slot}`;

/**
 * Fotos subidas desde /admin/medios (una por slot, "hero-slide-1"…
 * "hero-slide-5") para el slide del hero de Inicio, en ese orden. Si un
 * slot se reemplazó más de una vez, usa la más reciente de ese módulo.
 */
export async function getHeroSlides(): Promise<HeroSlide[]> {
  const supabase = await createClient();
  const modules = Array.from({ length: HERO_SLOT_COUNT }, (_, i) => heroSlotModule(i + 1));

  const { data } = await supabase
    .from("media")
    .select("path, mime_type, filename, module")
    .in("module", modules)
    .order("created_at", { ascending: false });

  const slides: HeroSlide[] = [];
  for (const mod of modules) {
    const item = (data ?? []).find((row) => row.module === mod);
    if (!item) continue;
    slides.push({
      type: item.mime_type.startsWith("video/") ? "video" : "image",
      url: supabase.storage.from("site").getPublicUrl(item.path).data.publicUrl,
      alt: item.filename,
    });
  }
  return slides;
}

const PRIMERA_VEZ_HERO_MODULE = "primera-vez-hero";

/** Foto de portada de /primera-vez, subida desde /admin/medios. Null si no se ha cargado. */
export async function getFirstTimeHeroImage(): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("media")
    .select("path")
    .eq("module", PRIMERA_VEZ_HERO_MODULE)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return supabase.storage.from("site").getPublicUrl(data.path).data.publicUrl;
}

const NOSOTROS_HERO_MODULE = "nosotros-hero";
const NOSOTROS_ESSENCE_MODULE = "nosotros-essence";

async function getLatestSiteMediaUrl(module: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("media")
    .select("path")
    .eq("module", module)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  return supabase.storage.from("site").getPublicUrl(data.path).data.publicUrl;
}

/** Foto principal del Hero de /nosotros, subida desde /admin/nosotros. Null si no se ha cargado. */
export async function getAboutHeroImage(): Promise<string | null> {
  return getLatestSiteMediaUrl(NOSOTROS_HERO_MODULE);
}

/** Foto a todo el ancho de la sección "Amamos a Dios. Amamos a las personas." en /nosotros. */
export async function getAboutEssenceImage(): Promise<string | null> {
  return getLatestSiteMediaUrl(NOSOTROS_ESSENCE_MODULE);
}
