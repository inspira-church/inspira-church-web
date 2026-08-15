import { getClientIp } from "@/lib/rate-limit";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function isTurnstileConfigured() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

let warned = false;
function warnNotConfiguredOnce() {
  if (warned) return;
  warned = true;
  console.warn(
    "[turnstile] TURNSTILE_SECRET_KEY no está configurada — los formularios públicos aceptan envíos sin verificación anti-bot. Configúrala en .env.local antes de producción."
  );
}

/**
 * Verifica el token que el widget de Turnstile pone en el campo oculto
 * `cf-turnstile-response`. Si las claves todavía no están configuradas
 * (desarrollo local antes de crear la cuenta de Cloudflare), deja pasar el
 * envío igual — mismo patrón que Supabase en la Fase 3.
 */
export async function verifyTurnstile(formData: FormData): Promise<boolean> {
  if (!isTurnstileConfigured()) {
    if (process.env.NODE_ENV !== "production") {
      warnNotConfiguredOnce();
    }
    return true;
  }

  const token = formData.get("cf-turnstile-response");
  if (!token || typeof token !== "string") {
    return false;
  }

  const ip = await getClientIp();
  const body = new URLSearchParams({
    secret: process.env.TURNSTILE_SECRET_KEY!,
    response: token,
    remoteip: ip,
  });

  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch {
    // Si Cloudflare no responde, no bloqueamos al visitante por un problema
    // nuestro — el límite de tasa sigue siendo la segunda barrera.
    return true;
  }
}
