import { Users } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { dayName, formatTime } from "@/lib/format";
import { toggleGrowthGroupActive } from "@/lib/actions/growth-groups";
import { createClient } from "@/lib/supabase/server";

export default async function GrowthGroupsListPage() {
  const supabase = await createClient();
  const { data: groups } = await supabase
    .from("growth_groups")
    .select("id, name, group_type, city, locality, day_of_week, time_of_day, active")
    .order("name");

  return (
    <div>
      <PageHeader
        title="Grupos"
        actions={
          <Button as={Link} href="/admin/grupos/nuevo" size="sm">
            Agregar
          </Button>
        }
      />

      {!groups || groups.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Todavía no hay grupos creados."
          className="mt-8"
          action={
            <Button as={Link} href="/admin/grupos/nuevo" size="sm">
              Agregar grupo
            </Button>
          }
        />
      ) : (
        <div className="mt-8 divide-y divide-border rounded-lg border border-border bg-paper-raised">
          {groups.map((group) => (
            <div
              key={group.id}
              className="flex flex-wrap items-center gap-4 p-4 transition-colors duration-150 hover:bg-ink/5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{group.name}</p>
                <p className="truncate text-sm text-ink-faint">
                  {[group.locality, group.city].filter(Boolean).join(", ")} ·{" "}
                  {dayName(group.day_of_week)} · {formatTime(group.time_of_day)}
                </p>
              </div>
              <Badge variant="accent">{group.group_type}</Badge>
              <Badge variant={group.active ? "accent" : "neutral"}>
                {group.active ? "Visible" : "Oculto"}
              </Badge>
              <Link
                href={`/admin/grupos/${group.id}`}
                className="text-sm font-medium text-accent hover:underline"
              >
                Editar
              </Link>
              <form action={toggleGrowthGroupActive.bind(null, group.id, !group.active)}>
                <button type="submit" className="text-sm text-ink-soft hover:text-ink">
                  {group.active ? "Ocultar" : "Mostrar"}
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
