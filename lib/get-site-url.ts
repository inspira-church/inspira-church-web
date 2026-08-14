import { headers } from "next/headers";

/**
 * Origen absoluto del sitio, para construir `redirectTo` en los correos de
 * Supabase Auth. Usa NEXT_PUBLIC_SITE_URL si está definida (recomendado en
 * producción, detrás de proxies); si no, la deriva de los headers de la
 * request — funciona sin configuración adicional en desarrollo local.
 */
export async function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }

  const headersList = await headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  return `${protocol}://${host}`;
}
