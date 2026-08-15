import Script from "next/script";

/**
 * Widget de Cloudflare Turnstile en modo implícito: el script detecta el
 * <div data-sitekey> y crea solo un input oculto `cf-turnstile-response`
 * dentro del <form> que lo contenga — no hace falta callback manual.
 *
 * Si NEXT_PUBLIC_TURNSTILE_SITE_KEY no está configurada (antes de crear la
 * cuenta de Cloudflare), no renderiza nada; el servidor ya sabe dejar pasar
 * el envío sin verificación en ese caso (ver lib/turnstile.ts).
 */
export function TurnstileWidget() {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey) return null;

  return (
    <>
      <Script
        id="cf-turnstile-script"
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <div className="cf-turnstile" data-sitekey={siteKey} data-theme="light" />
    </>
  );
}
