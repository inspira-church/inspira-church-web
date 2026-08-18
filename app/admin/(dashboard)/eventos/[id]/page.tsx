import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/admin/Breadcrumbs";
import { EventForm } from "@/components/admin/EventForm";
import { updateEvent } from "@/lib/actions/events";
import { createClient } from "@/lib/supabase/server";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: event } = await supabase.from("events").select("*").eq("id", id).single();

  if (!event) notFound();

  const updateWithId = updateEvent.bind(null, id);

  return (
    <div>
      <Breadcrumbs
        items={[{ label: "Eventos", href: "/admin/eventos" }, { label: "Editar evento" }]}
        className="mb-3"
      />
      <h1 className="font-display text-2xl font-semibold text-ink">Editar evento</h1>
      <div className="mt-8">
        <EventForm
          action={updateWithId}
          defaultValues={{
            name: event.name,
            slug: event.slug,
            description: event.description,
            imageUrl: event.image_url,
            eventDate: event.event_date,
            eventTime: event.event_time,
            locationName: event.location_name,
            address: event.address,
            lat: event.lat,
            lng: event.lng,
            capacity: event.capacity,
            registrationUrl: event.registration_url,
            status: event.status,
            published: event.published,
          }}
        />
      </div>
    </div>
  );
}
