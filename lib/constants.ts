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

export function whatsappLink(message = SITE_CONFIG.whatsappDefaultMessage) {
  return `https://wa.me/${SITE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
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

export const NAV_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/predicas", label: "Prédicas" },
  { href: "/grupos", label: "Grupos" },
  { href: "/eventos", label: "Eventos" },
  { href: "/contacto", label: "Contacto" },
] as const;
