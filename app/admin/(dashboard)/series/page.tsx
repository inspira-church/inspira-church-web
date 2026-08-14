import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { toggleSermonSeriesActive } from "@/lib/actions/sermon-series";
import { createClient } from "@/lib/supabase/server";

export default async function SermonSeriesListPage() {
  const supabase = await createClient();
  const { data: series } = await supabase
    .from("sermon_series")
    .select("id, name, slug, cover_image_url, active")
    .order("name");

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-ink">Series</h1>
        <Button as={Link} href="/admin/series/nuevo" size="sm">
          Agregar
        </Button>
      </div>

      {!series || series.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border-strong p-10 text-center">
          <p className="text-ink-soft">Todavía no hay series creadas.</p>
        </div>
      ) : (
        <div className="mt-8 divide-y divide-border rounded-lg border border-border bg-paper-raised">
          {series.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center gap-4 p-4">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-paper">
                {item.cover_image_url && (
                  <Image
                    src={item.cover_image_url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-ink">{item.name}</p>
                <p className="truncate text-sm text-ink-faint">/series/{item.slug}</p>
              </div>
              <Badge variant={item.active ? "accent" : "neutral"}>
                {item.active ? "Visible" : "Oculto"}
              </Badge>
              <Link
                href={`/admin/series/${item.id}`}
                className="text-sm font-medium text-accent hover:underline"
              >
                Editar
              </Link>
              <form action={toggleSermonSeriesActive.bind(null, item.id, !item.active)}>
                <button type="submit" className="text-sm text-ink-soft hover:text-ink">
                  {item.active ? "Ocultar" : "Mostrar"}
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
