import Image from "next/image";
import { HandHeart } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PRAYER_TOPIC } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { toggleSermonPublished } from "@/lib/actions/sermons";
import { createClient } from "@/lib/supabase/server";

/**
 * Vista filtrada del mismo módulo de Prédicas — una grabación de oración
 * es una prédica normal con "Oración" en Temas, sin tabla propia. Editar
 * reutiliza /admin/predicas/[id] tal cual.
 */
export default async function PrayerRecordingsAdminPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("sermons")
    .select("id, title, slug, thumbnail_url, sermon_date, published, topics")
    .order("sermon_date", { ascending: false });

  // El campo "Temas" es texto libre y sermons.ts lo guarda en minúsculas —
  // comparar sin distinguir mayúsculas evita que "Oración" (constante) no
  // encuentre "oración" (guardado). Mismo criterio que
  // getPublishedSermonsByTopic en lib/queries/sermons.ts para el sitio público.
  const normalizedTopic = PRAYER_TOPIC.toLowerCase();
  const sermons = (data ?? []).filter((sermon) =>
    (sermon.topics ?? []).some((t: string) => t.toLowerCase() === normalizedTopic)
  );

  return (
    <div>
      <PageHeader
        title="Grabaciones de oración"
        description={`Prédicas con el tema "${PRAYER_TOPIC}" — aparecen en la sección de oración de Inicio y en /oraciones. Para editarlas usa el mismo formulario de Prédicas.`}
        actions={
          <Button as={Link} href="/admin/oraciones/nuevo" size="sm">
            Agregar
          </Button>
        }
      />

      {!sermons || sermons.length === 0 ? (
        <EmptyState
          icon={HandHeart}
          title="Todavía no hay grabaciones de oración."
          description={`Al crear una, se etiqueta automáticamente con el tema "${PRAYER_TOPIC}".`}
          className="mt-8"
          action={
            <Button as={Link} href="/admin/oraciones/nuevo" size="sm">
              Agregar grabación
            </Button>
          }
        />
      ) : (
        <div className="mt-8 divide-y divide-border rounded-lg border border-border bg-paper-raised">
          {sermons.map((sermon) => (
            <div
              key={sermon.id}
              className="flex flex-wrap items-center gap-4 p-4 transition-colors duration-150 hover:bg-ink/5"
            >
              <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md bg-paper">
                {sermon.thumbnail_url && (
                  <Image
                    src={sermon.thumbnail_url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{sermon.title}</p>
                <p className="text-sm text-ink-faint">{formatDate(sermon.sermon_date)}</p>
              </div>
              <Badge variant={sermon.published ? "accent" : "neutral"}>
                {sermon.published ? "Publicada" : "Borrador"}
              </Badge>
              <Link
                href={`/admin/predicas/${sermon.id}`}
                className="text-sm font-medium text-accent hover:underline"
              >
                Editar
              </Link>
              <form action={toggleSermonPublished.bind(null, sermon.id, !sermon.published)}>
                <button type="submit" className="text-sm text-ink-soft hover:text-ink">
                  {sermon.published ? "Despublicar" : "Publicar"}
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
