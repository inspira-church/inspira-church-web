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
