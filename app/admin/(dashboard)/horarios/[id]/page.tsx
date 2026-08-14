import { notFound } from "next/navigation";
import { ScheduleForm } from "@/components/admin/ScheduleForm";
import { updateSchedule } from "@/lib/actions/schedules";
import { createClient } from "@/lib/supabase/server";

export default async function EditSchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: schedule } = await supabase
    .from("schedules")
    .select("*")
    .eq("id", id)
    .single();

  if (!schedule) notFound();

  const updateWithId = updateSchedule.bind(null, id);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Editar horario</h1>
      <div className="mt-8">
        <ScheduleForm
          action={updateWithId}
          defaultValues={{
            type: schedule.type,
            name: schedule.name,
            dayOfWeek: schedule.day_of_week,
            timeOfDay: schedule.time_of_day,
            location: schedule.location,
            orderIndex: schedule.order_index,
            active: schedule.active,
          }}
        />
      </div>
    </div>
  );
}
