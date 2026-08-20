import localFont from "next/font/local";
import { Anton, Hind, Montserrat_Alternates } from "next/font/google";

/**
 * Tipografía de cartel para la página de Inicio únicamente (ver
 * components/public/Hero.tsx y app/(public)/page.tsx). El resto del sitio
 * sigue usando Petrona/Figtree vía app/layout.tsx sin cambios.
 */
export const anton = Anton({ weight: "400", subsets: ["latin"] });

/** Frase destacada de la ficha de conexión en /primera-vez ("Déjanos tus datos"). */
export const montserratAlternates = Montserrat_Alternates({
  weight: ["600", "700"],
  subsets: ["latin"],
});

/** Frases del hero sobre el slide — misma tipografía que usa g12.co para ese mismo tipo de texto. */
export const hind = Hind({ weight: ["400", "600"], subsets: ["latin"] });

/**
 * Script manuscrita para la frase destacada de "¿Eres nuevo?" en Inicio —
 * no está en Google Fonts, el archivo lo proporcionó el usuario
 * (public/fonts/Gistesy.ttf).
 */
export const gistesy = localFont({
  src: "../public/fonts/Gistesy.ttf",
  display: "swap",
});

/** Color de campaña que rota por tarjeta — el mismo patrón real de @inspira.church en Instagram. */
export const CAMPAIGN_COLORS = ["#FF7F50", "#23d3d9", "#ff8a3d", "#3e6fa8", "#87281B"] as const;

/**
 * Paleta oficial de marca (distinta de CAMPAIGN_COLORS, que rota libremente
 * por tarjeta) — usada con intención cromática fija en /nosotros: cada
 * sección tiene un color propio, nunca varios a la vez.
 */
export const ABOUT_COLORS = {
  coral: "#FF7F50",
  teal: "#008080",
  tealLight: "#508A8C",
  green: "#266C62",
  cream: "#D4C78F",
  orange: "#D2431B",
  red: "#87281B",
} as const;
