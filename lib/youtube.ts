const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

export function isYouTubeLiveConfigured() {
  return Boolean(process.env.YOUTUBE_API_KEY);
}

let warned = false;
function warnNotConfiguredOnce() {
  if (warned) return;
  warned = true;
  console.warn(
    "YOUTUBE_API_KEY no está configurada — la sección 'En vivo' de Inicio permanece oculta. Ver .env.example."
  );
}

interface LiveVideo {
  videoId: string;
  title: string;
}

/**
 * Consulta si el canal está transmitiendo ahora mismo. No lanza si algo
 * falla (canal no configurado, cuota agotada, red caída) — el visitante
 * simplemente no ve la sección "En vivo", nunca un error.
 */
export async function getCurrentLiveVideo(channelId: string | null): Promise<LiveVideo | null> {
  if (!channelId) return null;

  if (!isYouTubeLiveConfigured()) {
    if (process.env.NODE_ENV !== "production") warnNotConfiguredOnce();
    return null;
  }

  const url = new URL(SEARCH_URL);
  url.searchParams.set("part", "snippet");
  url.searchParams.set("channelId", channelId);
  url.searchParams.set("eventType", "live");
  url.searchParams.set("type", "video");
  url.searchParams.set("key", process.env.YOUTUBE_API_KEY!);

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;

    const data = (await res.json()) as {
      items?: { id?: { videoId?: string }; snippet?: { title?: string } }[];
    };
    const item = data.items?.[0];
    const videoId = item?.id?.videoId;
    if (!videoId) return null;

    return { videoId, title: item?.snippet?.title ?? "Transmisión en vivo" };
  } catch {
    return null;
  }
}
