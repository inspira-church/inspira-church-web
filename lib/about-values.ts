import type { AboutValue } from "@/lib/queries/about";

/**
 * Qué valores se muestran en /nosotros: los marcados como visibles que tengan
 * título. La descripción es opcional — "" significa "mostrar solo el título",
 * así que NUNCA debe participar en la decisión de visibilidad.
 */
export function getVisibleValues(values: AboutValue[]): AboutValue[] {
  return values.filter((v) => v.visible && v.title.trim().length > 0);
}
