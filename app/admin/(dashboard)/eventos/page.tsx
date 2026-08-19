import Image from "next/image";
import { CalendarDays } from "lucide-react";
import Link from "next/link";
import { ConfirmForm } from "@/components/admin/ConfirmForm";
import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { deriveEventStatus } from "@/lib/event-status";
import { formatDate } from "@/lib/format";
import { deleteEvent, toggleEventPublished } from "@/lib/actions/events";
import { createClient } from "@/lib/supabase/server";

const STATUS_LABEL: Record<string, string> = {
  proximo: "Próximo",
  finalizado: "Finalizado",
  cancelado: "Cancelado",
};

export default async function EventsListPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("id, name, category, slug, image_url, event_date, event_time, end_date, end_time, status, published")
    .order("event_date", { ascending: false });

  return (
    <div>
      <PageHeader
        title="Eventos"
        actions={
          <Button as={Link} href="/admin/eventos/nuevo" size="sm">
            Agregar
          </Button>
        }
      />

      {!events || events.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Todavía no hay eventos creados."
          className="mt-8"
          action={
            <Button as={Link} href="/admin/eventos/nuevo" size="sm">
              Agregar evento
            </Button>
          }
        />
      ) : (
        <div className="mt-8 divide-y divide-border rounded-lg border border-border bg-paper-raised">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex flex-wrap items-center gap-4 p-4 transition-colors duration-150 hover:bg-ink/5"
            >
              <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-paper">
                {event.image_url && (
                  <Image
                    src={event.image_url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{event.name}</p>
                <p className="text-sm text-ink-faint">
                  {formatDate(event.event_date)}
                  {event.category ? ` · ${event.category}` : ""}
                </p>
              </div>
              <Badge>
                {
                  STATUS_LABEL[
                    deriveEventStatus({
                      status: event.status,
                      eventDate: event.event_date,
                      eventTime: event.event_time,
                      endDate: event.end_date,
                      endTime: event.end_time,
                    })
                  ]
                }
              </Badge>
              <Badge variant={event.published ? "accent" : "neutral"}>
                {event.published ? "Publicado" : "Borrador"}
              </Badge>
              <Link
                href={`/admin/eventos/${event.id}`}
                className="text-sm font-medium text-accent hover:underline"
              >
                Editar
              </Link>
              <form action={toggleEventPublished.bind(null, event.id, !event.published)}>
                <button type="submit" className="text-sm text-ink-soft hover:text-ink">
                  {event.published ? "Despublicar" : "Publicar"}
                </button>
              </form>
              <ConfirmForm
                action={deleteEvent.bind(null, event.id, event.name)}
                confirmMessage={`¿Eliminar "${event.name}"? Esta acción no se puede deshacer.`}
              >
                <button type="submit" className="text-sm text-danger hover:underline">
                  Eliminar
                </button>
              </ConfirmForm>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
