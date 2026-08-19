import { ABOUT_COLORS } from "@/lib/fonts";

/**
 * group_type es texto libre administrado desde el CMS (ver
 * 006_growth_groups.sql) — no hay una tabla de tipos que enumerar. Esta
 * función solo decide el color de acento por nombre conocido, con un color
 * por defecto para cualquier tipo nuevo que se agregue desde el panel sin
 * requerir tocar código.
 */
const KNOWN_TYPE_COLORS: { match: RegExp; color: string }[] = [
  { match: /crecimiento/i, color: ABOUT_COLORS.tealLight },
  { match: /j[oó]ven/i, color: ABOUT_COLORS.coral },
  { match: /famil/i, color: ABOUT_COLORS.cream },
  { match: /mujer/i, color: ABOUT_COLORS.orange },
  { match: /hombre/i, color: ABOUT_COLORS.teal },
];

const DEFAULT_TYPE_COLOR = ABOUT_COLORS.teal;

export function getGroupTypeColor(groupType: string): string {
  return KNOWN_TYPE_COLORS.find((entry) => entry.match.test(groupType))?.color ?? DEFAULT_TYPE_COLOR;
}
