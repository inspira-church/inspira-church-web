import { DAY_NAMES } from "./constants";

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
