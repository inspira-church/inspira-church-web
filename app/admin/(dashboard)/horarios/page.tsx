import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { dayName, formatTime } from "@/lib/format";
import { toggleScheduleActive } from "@/lib/actions/schedules";
import { createClient } from "@/lib/supabase/server";

const TYPE_LABEL: Record<string, string> = {
  servicio: "Servicio",
  reunion: "Reunión",
  grupo: "Grupo",
  actividad: "Actividad especial",
};

export default async function SchedulesListPage() {
  const supabase = await createClient();
  const { data: schedules } = await supabase
    .from("schedules")
    .select("id, type, name, day_of_week, time_of_day, location, active")
    .order("order_index");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Horarios</h1>
        <Button as={Link} href="/admin/horarios/nuevo" size="sm">
          Agregar
        </Button>
      </div>

      {!schedules || schedules.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border-strong p-10 text-center">
          <p className="text-ink-soft">Todavía no hay horarios creados.</p>
        </div>
      ) : (
        <div className="mt-8 divide-y divide-border rounded-lg border border-border bg-paper-raised">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{schedule.name}</p>
                <p className="truncate text-sm text-ink-faint">
                  {dayName(schedule.day_of_week)} · {formatTime(schedule.time_of_day)}
                  {schedule.location ? ` · ${schedule.location}` : ""}
                </p>
              </div>
              <Badge>{TYPE_LABEL[schedule.type] ?? schedule.type}</Badge>
              <Badge variant={schedule.active ? "accent" : "neutral"}>
                {schedule.active ? "Visible" : "Oculto"}
              </Badge>
              <Link
                href={`/admin/horarios/${schedule.id}`}
                className="text-sm font-medium text-accent hover:underline"
              >
                Editar
              </Link>
              <form action={toggleScheduleActive.bind(null, schedule.id, !schedule.active)}>
                <button type="submit" className="text-sm text-ink-soft hover:text-ink">
                  {schedule.active ? "Ocultar" : "Mostrar"}
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
