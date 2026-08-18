import { Anton, Caveat, Hind } from "next/font/google";

/**
 * Tipografía de cartel para la página de Inicio únicamente (ver
 * components/public/Hero.tsx y app/(public)/page.tsx). El resto del sitio
 * sigue usando Petrona/Figtree vía app/layout.tsx sin cambios.
 */
export const anton = Anton({ weight: "400", subsets: ["latin"] });
export const caveat = Caveat({ weight: "700", subsets: ["latin"] });

/** Frases del hero sobre el slide — misma tipografía que usa g12.co para ese mismo tipo de texto. */
export const hind = Hind({ weight: ["400", "600"], subsets: ["latin"] });

/** Color de campaña que rota por tarjeta — el mismo patrón real de @inspira.church en Instagram. */
export const CAMPAIGN_COLORS = ["#FF7F50", "#23d3d9", "#ff8a3d", "#3e6fa8", "#87281B"] as const;
