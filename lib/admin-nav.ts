import {
  CalendarDays,
  ClipboardList,
  Clock,
  DoorOpen,
  FileText,
  HandHeart,
  HeartHandshake,
  History,
  Home,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Layers,
  Mail,
  type LucideIcon,
  Mic,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Oculto para Editor — ver tabla de permisos, documento de arquitectura Fase 1 §5. */
  adminOnly?: boolean;
}

export interface AdminNavSection {
  /** Vacío para el grupo suelto de arriba (Dashboard) — no se renderiza encabezado. */
  label: string;
  items: AdminNavItem[];
}

/**
 * Agrupado por sección del sitio (o del panel) a la que pertenece cada
 * opción — cada módulo administra únicamente su propio contenido. Ver
 * plan de reorganización del panel admin.
 */
/**
 * Resuelve la sección/ítem activo para un pathname dado — usado por el
 * topbar de AdminShell para mostrar dónde está el usuario sin depender de
 * breadcrumbs manuales en cada página. Misma regla de coincidencia que
 * `isActive()` en AdminShell (exacta para /admin, prefijo para el resto).
 */
export function getActiveNavLabel(pathname: string): string | null {
  for (const section of ADMIN_NAV) {
    for (const item of section.items) {
      const active =
        item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
      if (active) {
        return section.label && section.label !== item.label
          ? `${section.label} / ${item.label}`
          : item.label;
      }
    }
  }
  return null;
}

export const ADMIN_NAV: AdminNavSection[] = [
  {
    label: "",
    items: [{ href: "/admin", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Inicio",
    items: [
      { href: "/admin/inicio", label: "Contenido del hero", icon: Home, adminOnly: true },
      { href: "/admin/horarios", label: "Horarios", icon: Clock },
    ],
  },
  {
    label: "Nosotros",
    items: [
      { href: "/admin/nosotros", label: "Página Nosotros", icon: FileText, adminOnly: true },
      { href: "/admin/equipo", label: "Pastores y líderes", icon: UserRound },
    ],
  },
  {
    label: "Primera vez",
    items: [
      { href: "/admin/primera-vez", label: "Página Primera vez", icon: DoorOpen, adminOnly: true },
    ],
  },
  {
    label: "Prédicas",
    items: [
      { href: "/admin/predicas", label: "Prédicas", icon: Mic },
      { href: "/admin/series", label: "Series", icon: Layers },
    ],
  },
  {
    label: "Oraciones",
    items: [{ href: "/admin/oraciones", label: "Grabaciones de oración", icon: HandHeart }],
  },
  {
    label: "Grupos",
    items: [{ href: "/admin/grupos", label: "Grupos de crecimiento", icon: Users }],
  },
  {
    label: "Eventos",
    items: [{ href: "/admin/eventos", label: "Eventos", icon: CalendarDays }],
  },
  {
    label: "Contacto",
    items: [
      { href: "/admin/contacto", label: "Configuración de contacto", icon: Mail, adminOnly: true },
    ],
  },
  {
    label: "Generaciones",
    items: [
      { href: "/admin/generaciones", label: "Página Generaciones", icon: Sparkles, adminOnly: true },
      {
        href: "/admin/generaciones/inscripciones",
        label: "Inscripciones",
        icon: ClipboardList,
        adminOnly: true,
      },
    ],
  },
  {
    label: "Solicitudes",
    items: [
      { href: "/admin/formularios", label: "Formularios", icon: Inbox },
      { href: "/admin/oracion", label: "Peticiones de oración", icon: HeartHandshake },
    ],
  },
  {
    label: "Medios",
    items: [{ href: "/admin/medios", label: "Librería de medios", icon: ImageIcon }],
  },
  {
    label: "Sistema",
    items: [
      { href: "/admin/actividad", label: "Actividad", icon: History, adminOnly: true },
      { href: "/admin/usuarios", label: "Usuarios", icon: ShieldCheck, adminOnly: true },
    ],
  },
];
