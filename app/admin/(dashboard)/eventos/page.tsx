import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";
import { toggleEventPublished } from "@/lib/actions/events";
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
    .select("id, name, slug, image_url, event_date, status, published")
    .order("event_date", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Eventos</h1>
        <Button as={Link} href="/admin/eventos/nuevo" size="sm">
          Agregar
        </Button>
      </div>

      {!events || events.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border-strong p-10 text-center">
          <p className="text-ink-soft">Todavía no hay eventos creados.</p>
        </div>
      ) : (
        <div className="mt-8 divide-y divide-border rounded-lg border border-border bg-paper-raised">
          {events.map((event) => (
            <div key={event.id} className="flex flex-wrap items-center gap-4 p-4">
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
                <p className="text-sm text-ink-faint">{formatDate(event.event_date)}</p>
              </div>
              <Badge>{STATUS_LABEL[event.status] ?? event.status}</Badge>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
