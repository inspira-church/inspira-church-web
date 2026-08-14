import { ScheduleForm } from "@/components/admin/ScheduleForm";
import { createSchedule } from "@/lib/actions/schedules";

export default function NewSchedulePage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Nuevo horario</h1>
      <div className="mt-8">
        <ScheduleForm action={createSchedule} />
      </div>
    </div>
  );
}
