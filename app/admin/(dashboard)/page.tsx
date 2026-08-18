import {
  CalendarDays,
  HeartHandshake,
  History,
  Inbox,
  KeyRound,
  Mic,
  Plus,
  UserPlus,
  Users,
} from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";
import { StatCard } from "@/components/admin/StatCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatRelativeTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

const MODULE_LABELS: Record<string, string> = {
  home: "Inicio",
  about: "Nosotros",
  first_time: "Primera vez",
  contact_settings: "Contacto",
  team: "Equipo",
  sermons: "Prédicas",
  groups: "Grupos",
  schedules: "Horarios",
  events: "Eventos",
  inbox: "Formularios",
  prayer_requests: "Peticiones de oración",
  media: "Medios",
  users: "Usuarios",
};

const ACTION_LABELS: Record<string, string> = {
  create: "creó",
  update: "actualizó",
  delete: "borró",
  publish: "publicó",
  unpublish: "despublicó",
  activate: "activó",
  deactivate: "desactivó",
};

async function getRecentActivity() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_logs")
    .select("id, user_name, action, module, entity_type, created_at")
    .neq("module", "auth")
    .order("created_at", { ascending: false })
    .limit(5);
  return data ?? [];
}

async function getRecentLogins() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_logs")
    .select("id, user_name, action, created_at")
    .eq("module", "auth")
    .order("created_at", { ascending: false })
    .limit(5);
  return data ?? [];
}

/** audit_logs solo lo puede leer un admin (RLS) — estas dos tarjetas no
 * tienen sentido mostrarlas vacías a un Editor, así que se ocultan. */
async function getIsAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  return profile?.role === "admin";
}

async function getCounts() {
  const supabase = await createClient();

  const [sermons, events, groups, contacts, groupRequests, prayerRequests] =
    await Promise.all([
      supabase.from("sermons").select("*", { count: "exact", head: true }).eq("published", true),
      supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("published", true)
        .eq("status", "proximo"),
      supabase.from("growth_groups").select("*", { count: "exact", head: true }).eq("active", true),
      supabase.from("contacts").select("*", { count: "exact", head: true }).eq("status", "nueva"),
      supabase
        .from("group_join_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "nueva"),
      supabase
        .from("prayer_requests")
        .select("*", { count: "exact", head: true })
        .eq("status", "nueva"),
    ]);

  return {
    sermons: sermons.count ?? 0,
    events: events.count ?? 0,
    groups: groups.count ?? 0,
    contacts: contacts.count ?? 0,
    groupRequests: groupRequests.count ?? 0,
    prayerRequests: prayerRequests.count ?? 0,
  };
}

const QUICK_ACTIONS = [
  { href: "/admin/predicas/nuevo", label: "Crear prédica" },
  { href: "/admin/eventos/nuevo", label: "Crear evento" },
  { href: "/admin/oraciones/nuevo", label: "Agregar grabación" },
  { href: "/admin/grupos/nuevo", label: "Crear grupo" },
  { href: "/admin/formularios", label: "Revisar contactos" },
];

export default async function AdminDashboardPage() {
  const isAdmin = await getIsAdmin();
  const [counts, recentActivity, recentLogins] = await Promise.all([
    getCounts(),
    isAdmin ? getRecentActivity() : Promise.resolve([]),
    isAdmin ? getRecentLogins() : Promise.resolve([]),
  ]);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Lo que necesita atención hoy."
        actions={
          <>
            {QUICK_ACTIONS.map((action) => (
              <Button key={action.href} as={Link} href={action.href} variant="secondary" size="sm">
                <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                {action.label}
              </Button>
            ))}
          </>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={Mic} label="Prédicas publicadas" value={counts.sermons} />
        <StatCard icon={CalendarDays} label="Próximos eventos" value={counts.events} />
        <StatCard icon={Users} label="Grupos activos" value={counts.groups} />
        <StatCard
          icon={Inbox}
          label="Contactos nuevos"
          value={counts.contacts}
          tone={counts.contacts > 0 ? "attention" : "default"}
        />
        <StatCard
          icon={UserPlus}
          label="Solicitudes de grupo pendientes"
          value={counts.groupRequests}
          tone={counts.groupRequests > 0 ? "attention" : "default"}
        />
        <StatCard
          icon={HeartHandshake}
          label="Peticiones de oración pendientes"
          value={counts.prayerRequests}
          tone={counts.prayerRequests > 0 ? "attention" : "default"}
        />
      </div>

      {isAdmin && (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <p className="font-display text-lg font-semibold text-ink">Actividad reciente</p>
              <Link
                href="/admin/actividad"
                className="text-xs font-medium text-accent hover:underline"
              >
                Ver todo
              </Link>
            </div>
            {recentActivity.length === 0 ? (
              <EmptyState
                icon={History}
                title="Todavía no hay actividad registrada."
                description="Cuando alguien realice cambios en el panel, aparecerán aquí."
                className="mt-3 p-6"
              />
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {recentActivity.map((item) => (
                  <li key={item.id} className="py-2.5 text-sm">
                    <p className="text-ink">
                      <span className="font-medium">{item.user_name ?? "Alguien"}</span>{" "}
                      {ACTION_LABELS[item.action] ?? item.action}{" "}
                      {(item.module && MODULE_LABELS[item.module]?.toLowerCase()) ??
                        item.entity_type}
                    </p>
                    <p className="text-xs text-ink-faint">
                      {formatRelativeTime(item.created_at)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5">
            <p className="font-display text-lg font-semibold text-ink">Accesos recientes</p>
            {recentLogins.length === 0 ? (
              <EmptyState
                icon={KeyRound}
                title="Todavía no se han registrado accesos."
                description="Los inicios y cierres de sesión del panel aparecerán aquí."
                className="mt-3 p-6"
              />
            ) : (
              <ul className="mt-3 divide-y divide-border">
                {recentLogins.map((item) => (
                  <li key={item.id} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-ink">{item.user_name ?? "Intento sin cuenta"}</span>
                    <span className="text-xs text-ink-faint">
                      {item.action === "login" && "Inicio exitoso"}
                      {item.action === "login_failed" && "Intento fallido"}
                      {item.action === "logout" && "Cierre de sesión"} ·{" "}
                      {formatRelativeTime(item.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
