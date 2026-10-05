/**
 * Páginas públicas que muestran una foto según su `media.module`. Solo estos
 * módulos son "slots" que la web lee directo de `media` (el resto de fotos
 * —equipo, eventos, prédicas— se guarda como URL en su propia tabla y se
 * invalida desde la acción de ese módulo).
 */
export function publicPathsForMediaModule(module: string | null | undefined): string[] {
  if (!module) return [];
  if (module.startsWith("hero-slide-")) return ["/"];
  if (module === "primera-vez-hero") return ["/primera-vez"];
  if (module === "nosotros-hero" || module === "nosotros-essence") return ["/nosotros"];
  if (module.startsWith("generaciones-")) return ["/generaciones"];
  return [];
}

/** Módulo de auditoría/permisos al que pertenece un slot de foto; null si `module` no es un slot. */
export function auditModuleForMediaSlot(
  module: string | null | undefined
): "home" | "first_time" | "about" | "generations" | null {
  if (!module) return null;
  if (module.startsWith("hero-slide-")) return "home";
  if (module === "primera-vez-hero") return "first_time";
  if (module === "nosotros-hero" || module === "nosotros-essence") return "about";
  if (module.startsWith("generaciones-")) return "generations";
  return null;
}
