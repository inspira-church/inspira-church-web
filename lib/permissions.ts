/**
 * Espejo en código del seed de `role_permissions` (ver
 * supabase/migrations/015_permissions.sql) — para condicionales de UI
 * (mostrar/ocultar botones) sin ida y vuelta a la base de datos. El
 * chequeo real de servidor sigue siendo RLS (`is_editor_or_admin()` hoy;
 * `has_permission()` queda preparada para cuando se decida el alcance
 * exacto de Editor y se reescriban las políticas). Si cambia el seed en
 * la migración, actualizar esta lista para que coincidan.
 */

export type AdminRole = "admin" | "editor";

export const PERMISSION_MODULES = [
  "home",
  "about",
  "first_time",
  "contact_settings",
  "team",
  "sermons",
  "groups",
  "schedules",
  "events",
  "inbox",
  "prayer_requests",
  "media",
  "users",
  "audit",
  "generations",
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];

/** Módulos donde 'editor' tiene exactamente el mismo acceso que 'admin' hoy. */
const EDITOR_MODULES: PermissionModule[] = [
  "team",
  "sermons",
  "groups",
  "schedules",
  "events",
  "inbox",
  "prayer_requests",
  "media",
];

export function hasPermission(role: AdminRole, module: PermissionModule): boolean {
  if (role === "admin") return true;
  return EDITOR_MODULES.includes(module);
}
