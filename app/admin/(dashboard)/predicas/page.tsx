import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/format";
import { toggleSermonPublished } from "@/lib/actions/sermons";
import { createClient } from "@/lib/supabase/server";

export default async function SermonsListPage() {
  const supabase = await createClient();
  const { data: sermons } = await supabase
    .from("sermons")
    .select("id, title, slug, thumbnail_url, sermon_date, published")
    .order("sermon_date", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Prédicas</h1>
        <Button as={Link} href="/admin/predicas/nuevo" size="sm">
          Agregar
        </Button>
      </div>

      {!sermons || sermons.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border-strong p-10 text-center">
          <p className="text-ink-soft">Todavía no hay prédicas creadas.</p>
        </div>
      ) : (
        <div className="mt-8 divide-y divide-border rounded-lg border border-border bg-paper-raised">
          {sermons.map((sermon) => (
            <div key={sermon.id} className="flex flex-wrap items-center gap-4 p-4">
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
