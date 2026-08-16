import { SITE_CONFIG } from "@/lib/constants";
import { createPublicClient as createClient } from "@/lib/supabase/public";

export interface SiteSettings {
  whatsappNumber: string;
  whatsappMessage: string;
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
}

const DEFAULT_SETTINGS: SiteSettings = {
  whatsappNumber: SITE_CONFIG.whatsappNumber,
  whatsappMessage: SITE_CONFIG.whatsappDefaultMessage,
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
