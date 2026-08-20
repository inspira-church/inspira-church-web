import { DAY_NAMES, MONTHLY_WEEK_OPTIONS } from "./constants";

export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateShort(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "short",
  });
}

/** "2026-08-16" -> "16 AGO 2026" — convención compacta de fecha para Prédicas (tarjetas, último mensaje, detalle). */
export function formatDateCompact(iso: string) {
  const date = new Date(`${iso}T00:00:00`);
  const day = date.toLocaleDateString("es-CO", { day: "numeric" });
  const month = date.toLocaleDateString("es-CO", { month: "short" }).replace(".", "").toUpperCase();
  const year = date.toLocaleDateString("es-CO", { year: "numeric" });
  return `${day} ${month} ${year}`;
}

/** "19:00" -> "7:00 p. m." */
export function formatTime(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString("es-CO", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function dayName(dayOfWeek: number) {
  return DAY_NAMES[dayOfWeek] ?? "";
}

/** "2026-08-12" -> día de la semana real de esa fecha ("Miércoles"), sin depender del texto libre del título. */
export function dayNameFromDate(iso: string) {
  return dayName(new Date(`${iso}T00:00:00`).getDay());
}

/** "Domingo" (recurrence "weekly") o "Último domingo de cada mes" (recurrence "monthly" + monthlyWeek) — usado por las tarjetas de horario en Inicio, /oraciones y el listado de Admin en vez de `dayName` a secas. */
export function scheduleDayLabel(
  dayOfWeek: number,
  recurrence: string,
  monthlyWeek: number | null
) {
  const day = dayName(dayOfWeek);
  if (recurrence === "monthly" && monthlyWeek != null) {
    const ordinal = MONTHLY_WEEK_OPTIONS.find((o) => o.value === monthlyWeek)?.label;
    if (ordinal) return `${ordinal} ${day.toLowerCase()} de cada mes`;
  }
  return day;
}

/** "Oración Presencial." / "oración virtual" -> "Presencial" / "Virtual". Deja el nombre tal cual si no reconoce la modalidad. Usado por Inicio y /oraciones — misma fuente para no divergir. */
export function prayerModality(name: string) {
  const normalized = name.toLowerCase();
  if (normalized.includes("presencial")) return "Presencial";
  if (normalized.includes("virtual")) return "Virtual";
  return name;
}

/** "suba" -> "Suba" — solo para mostrar; nunca cambia el valor real guardado (ver GroupsExplorer). */
export function titleCase(text: string) {
  return text
    .split(" ")
    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word))
    .join(" ");
}

/** Quita tildes/diacríticos para comparar texto sin distinguir acentos (ej. "bogota" encuentra "Bogotá"). */
export function normalizeSearch(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * "10 de octubre de 2026" o, si `endIso` es una fecha distinta,
 * "10–12 de octubre de 2026" (mismo mes) / "30 de sep. – 2 de oct. de 2026"
 * (meses distintos). Nunca inventa una duración: sin `endIso` cae al
 * formato de un solo día de siempre.
 */
export function formatDateRange(startIso: string, endIso?: string | null) {
  if (!endIso || endIso === startIso) return formatDate(startIso);

  const start = new Date(`${startIso}T00:00:00`);
  const end = new Date(`${endIso}T00:00:00`);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();

  if (sameMonth) {
    const day = start.toLocaleDateString("es-CO", { day: "numeric" });
    return `${day}–${formatDate(endIso)}`;
  }

  const startShort = start.toLocaleDateString("es-CO", { day: "numeric", month: "short" });
  return `${startShort} – ${formatDate(endIso)}`;
}

/** "hace 20 min" / "hace 1 h" — cae a fecha corta pasados 7 días. */
export function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "justo ahora";
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `hace ${diffHours} h`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 7) return `hace ${diffDays} d`;
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short" });
}

/** Acepta youtube.com/watch?v=, youtu.be/ y youtube.com/embed/. */
export function getYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1) || null;
    }
    if (parsed.pathname.startsWith("/embed/")) {
      return parsed.pathname.replace("/embed/", "") || null;
    }
    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}
