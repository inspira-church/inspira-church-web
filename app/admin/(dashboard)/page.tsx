import type { LucideIcon } from "lucide-react";
import { CalendarDays, HeartHandshake, Inbox, Mic, UserPlus, Users } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";

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

interface StatProps {
  icon: LucideIcon;
  label: string;
  value: number;
}

function Stat({ icon: Icon, label, value }: StatProps) {
  return (
    <Card className="flex items-center gap-4 p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <p className="font-display text-2xl font-semibold text-ink">{value}</p>
        <p className="text-sm text-ink-soft">{label}</p>
      </div>
    </Card>
  );
}

export default async function AdminDashboardPage() {
  const counts = await getCounts();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Inicio</h1>
      <p className="mt-1 text-sm text-ink-faint">
        Lo que necesita atención hoy.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Stat icon={Mic} label="Prédicas publicadas" value={counts.sermons} />
        <Stat icon={CalendarDays} label="Próximos eventos" value={counts.events} />
        <Stat icon={Users} label="Grupos activos" value={counts.groups} />
        <Stat icon={Inbox} label="Contactos nuevos" value={counts.contacts} />
        <Stat
          icon={UserPlus}
          label="Solicitudes de grupo pendientes"
          value={counts.groupRequests}
        />
        <Stat
          icon={HeartHandshake}
          label="Peticiones de oración pendientes"
          value={counts.prayerRequests}
        />
      </div>
    </div>
  );
}
