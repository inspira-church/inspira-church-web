/** Sin barra final. Usa NEXT_PUBLIC_SITE_URL en producción (ver .env.example). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export const SITE_CONFIG = {
  name: "Inspira Church",
  description:
    "Una iglesia moderna, cercana y familiar. Prédicas, grupos de crecimiento y eventos.",
  city: "Bogotá, Colombia",
  // Placeholder — se reemplaza por el valor real configurado por el admin
  // en site_settings (módulo de Configuración, Fase 10).
  whatsappNumber: "573000000000",
  whatsappDefaultMessage:
    "Hola, me gustaría más información sobre Inspira Church.",
};

export function whatsappLink(
  message = SITE_CONFIG.whatsappDefaultMessage,
  number = SITE_CONFIG.whatsappNumber
) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export const DAY_NAMES = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
] as const;

/** Tag en `sermons.topics` que marca una grabación como oración (no prédica). */
export const PRAYER_TOPIC = "Oración";

export const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/predicas", label: "Prédicas" },
  { href: "/oraciones", label: "Oraciones" },
  { href: "/grupos", label: "Grupos" },
  { href: "/eventos", label: "Eventos" },
  { href: "/contacto", label: "Contacto" },
] as const;
