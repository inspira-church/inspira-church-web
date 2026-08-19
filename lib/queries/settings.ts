import { SITE_CONFIG } from "@/lib/constants";
import { createPublicClient as createClient } from "@/lib/supabase/public";

export interface SiteSettings {
  whatsappNumber: string;
  whatsappMessage: string;
  contactEmail: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  xUrl: string;
  youtubeUrl: string;
  privacyPolicyUrl: string;
  churchAddress: string;
  churchLat: number | null;
  churchLng: number | null;
  youtubeChannelId: string;
  heroText1: string;
  heroText2: string;
  firstTimeHeroText: string;
}

const DEFAULT_SETTINGS: SiteSettings = {
  whatsappNumber: SITE_CONFIG.whatsappNumber,
  whatsappMessage: SITE_CONFIG.whatsappDefaultMessage,
  contactEmail: "",
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  xUrl: "",
  youtubeUrl: "",
  privacyPolicyUrl: "",
  churchAddress: "",
  churchLat: null,
  churchLng: null,
  youtubeChannelId: "",
  heroText1:
    "Somos una iglesia donde el **amor de Dios** restaura vidas y transforma **familias**.",
  heroText2:
    "Vivimos para **adorar a Dios**, conscientes de que **su presencia** nos acompaña cada día.",
  firstTimeHeroText:
    "Sin compromiso, solo para conocernos. Aquí tienes todo lo que necesitas para tu primera visita a Inspira Church.",
};

/** Toda la configuración vive en una sola fila (key='general') como jsonb. */
export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "general")
    .maybeSingle();

  if (!data?.value) return DEFAULT_SETTINGS;
  return { ...DEFAULT_SETTINGS, ...(data.value as Partial<SiteSettings>) };
}
