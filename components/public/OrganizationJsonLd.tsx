import { SITE_CONFIG, SITE_URL } from "@/lib/constants";
import type { SiteSettings } from "@/lib/queries/settings";

/**
 * JSON-LD de la organización, construido solo con datos reales ya
 * configurados en site_settings — nunca se inventa dirección, teléfono,
 * coordenadas o redes sociales. Cada campo se omite si no está configurado.
 * "573000000000" es el placeholder de SITE_CONFIG.whatsappNumber (ver
 * lib/constants.ts) — se excluye explícitamente para no publicar un
 * teléfono falso mientras nadie lo haya configurado desde /admin/contacto.
 */
const PLACEHOLDER_WHATSAPP = SITE_CONFIG.whatsappNumber;

export function OrganizationJsonLd({ settings }: { settings: SiteSettings }) {
  const sameAs = [
    settings.facebookUrl,
    settings.instagramUrl,
    settings.tiktokUrl,
    settings.xUrl,
    settings.youtubeUrl,
  ].filter((url): url is string => Boolean(url));

  const hasCoordinates = settings.churchLat != null && settings.churchLng != null;
  const hasRealWhatsapp =
    Boolean(settings.whatsappNumber) && settings.whatsappNumber !== PLACEHOLDER_WHATSAPP;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Church",
    name: SITE_CONFIG.name,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    ...(sameAs.length > 0 && { sameAs }),
    ...(settings.churchAddress && {
      address: {
        "@type": "PostalAddress",
        streetAddress: settings.churchAddress,
        addressCountry: "CO",
      },
    }),
    ...(hasCoordinates && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: settings.churchLat,
        longitude: settings.churchLng,
      },
    }),
    ...(hasRealWhatsapp && { telephone: `+${settings.whatsappNumber}` }),
    ...(settings.contactEmail && { email: settings.contactEmail }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
