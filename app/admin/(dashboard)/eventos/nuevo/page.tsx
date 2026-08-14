import { EventForm } from "@/components/admin/EventForm";
import { createEvent } from "@/lib/actions/events";

export default function NewEventPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Nuevo evento</h1>
      <div className="mt-8">
        <EventForm action={createEvent} />
      </div>
    </div>
  );
}
