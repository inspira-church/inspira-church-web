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
