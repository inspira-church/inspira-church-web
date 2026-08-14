import {
  CalendarDays,
  Clock,
  HeartHandshake,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Layers,
  type LucideIcon,
  Mic,
  Settings,
  ShieldCheck,
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

export const ADMIN_NAV: AdminNavItem[] = [
  { href: "/admin", label: "Inicio", icon: LayoutDashboard },
  { href: "/admin/predicas", label: "Prédicas", icon: Mic },
  { href: "/admin/series", label: "Series", icon: Layers },
  { href: "/admin/eventos", label: "Eventos", icon: CalendarDays },
  { href: "/admin/grupos", label: "Grupos", icon: Users },
  { href: "/admin/horarios", label: "Horarios", icon: Clock },
  { href: "/admin/equipo", label: "Pastores y líderes", icon: UserRound },
  { href: "/admin/formularios", label: "Formularios", icon: Inbox },
  { href: "/admin/oracion", label: "Peticiones de oración", icon: HeartHandshake },
  { href: "/admin/usuarios", label: "Usuarios", icon: ShieldCheck, adminOnly: true },
  { href: "/admin/medios", label: "Medios", icon: ImageIcon },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings, adminOnly: true },
];
