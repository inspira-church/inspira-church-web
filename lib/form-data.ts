/**
 * Texto opcional de un formulario del CMS.
 *
 * `""` es un valor VÁLIDO: significa que el usuario vació el campo a propósito
 * y debe persistirse tal cual. `undefined` significa que el campo no vino en
 * el formulario (no se toca la columna). Nunca usar `formData.get(x) ||
 * undefined` para esto: convierte `""` en `undefined`, `JSON.stringify` omite
 * la clave del payload y Supabase conserva el valor anterior, así que un
 * campo vaciado "revive" para siempre.
 *
 * No aplica a URLs ni imágenes: ahí un vacío es `null` (una URL `""` no es
 * válida), ver `?? null` en cada `toRow`/`update`.
 */
export function optionalText(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" ? value : undefined;
}
