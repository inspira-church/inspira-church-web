import { headers } from "next/headers";

/**
 * Limitador de tasa en memoria del proceso — sin dependencias externas.
 * Correcto para el volumen de tráfico esperado de este sitio. Si el
 * proyecto crece y se despliega en varias instancias serverless a la vez,
 * el conteo deja de ser exacto entre ellas (cada una lleva el suyo); en ese
 * punto, migrar a un store compartido como Upstash Redis.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 10 * 60 * 1000; // 10 minutos
const MAX_REQUESTS = 5;

function pruneExpired(now: number) {
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) buckets.delete(key);
  }
}

/** true si puede continuar; false si superó el límite para esta ventana. */
export function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  pruneExpired(now);

  const bucket = buckets.get(identifier);
  if (!bucket) {
    buckets.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (bucket.count >= MAX_REQUESTS) {
    return false;
  }

  bucket.count += 1;
  return true;
}

/** IP del cliente a partir de los headers que ponen Vercel y la mayoría de proxies. */
export async function getClientIp(): Promise<string> {
  const headersList = await headers();
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return headersList.get("x-real-ip") ?? "unknown";
}
