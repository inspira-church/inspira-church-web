import Image from "next/image";
import { Image as ImageIcon, Trash2 } from "lucide-react";
import { ConfirmForm } from "@/components/admin/ConfirmForm";
import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";
import { deleteMedia } from "@/lib/actions/media";
import { createClient } from "@/lib/supabase/server";

function formatSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Cada módulo real visto en `media.module` (ver ImageUploadField y las
 * páginas de Inicio/Nosotros/Primera vez, que pasan un `module` propio) o,
 * si no se pasó ninguno, el bucket tal cual (ImageUploadField hace
 * `module: mediaModule ?? bucket`) — agrupa por página del sitio en vez de
 * por bucket técnico, que es como el admin realmente piensa el contenido.
 */
function pageGroup(bucket: string, module: string | null): { key: string; label: string; order: number } {
  if (module?.startsWith("hero-slide-")) return { key: "inicio", label: "Inicio", order: 0 };
  if (module === "nosotros-hero" || module === "nosotros-essence") {
    return { key: "nosotros", label: "Nosotros", order: 1 };
  }
  if (module === "primera-vez-hero") return { key: "primera-vez", label: "Primera vez", order: 2 };
  if (bucket === "sermons") return { key: "predicas", label: "Prédicas y series", order: 3 };
  if (bucket === "pastors") return { key: "equipo", label: "Equipo", order: 4 };
  if (bucket === "groups") return { key: "grupos", label: "Grupos", order: 5 };
  if (bucket === "events") return { key: "eventos", label: "Eventos", order: 6 };
  return { key: "otros", label: "Otros", order: 7 };
}

export default async function AdminMediaPage() {
  const supabase = await createClient();
  const { data: media } = await supabase
    .from("media")
    .select("id, bucket, path, filename, mime_type, size_bytes, module, created_at")
    .order("created_at", { ascending: false });

  const items = (media ?? []).map((item) => ({
    ...item,
    url: supabase.storage.from(item.bucket).getPublicUrl(item.path).data.publicUrl,
    group: pageGroup(item.bucket, item.module),
  }));

  const groups = new Map<string, { label: string; order: number; items: typeof items }>();
  for (const item of items) {
    const existing = groups.get(item.group.key);
    if (existing) existing.items.push(item);
    else groups.set(item.group.key, { label: item.group.label, order: item.group.order, items: [item] });
  }
  const sortedGroups = Array.from(groups.values()).sort((a, b) => a.order - b.order);

  return (
    <div>
      <PageHeader
        title="Librería de medios"
        description="Todas las imágenes y videos subidos desde los demás módulos (prédicas, series, equipo, Inicio, Primera vez…), agrupados por página. Súbelos desde el formulario de cada uno — esta página es solo para verlos todos juntos y borrar los que ya no se usan."
      />

      {items.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="Todavía no se ha subido ninguna imagen."
          description="Sube fotos o videos desde el formulario del módulo correspondiente — aparecerán aquí."
          className="mt-8"
        />
      ) : (
        <div className="mt-8 space-y-10">
          {sortedGroups.map((group) => (
            <section key={group.label}>
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-soft">
                {group.label} <span className="text-ink-faint">({group.items.length})</span>
              </h2>
              <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                {group.items.map((item) => (
                  <div key={item.id} className="group relative">
                    <div className="relative aspect-square overflow-hidden rounded-md border border-border bg-paper">
                      {item.mime_type?.startsWith("video/") ? (
                        <video src={item.url} className="h-full w-full object-cover" muted playsInline />
                      ) : (
                        <Image src={item.url} alt="" fill className="object-cover" sizes="120px" />
                      )}
                      <ConfirmForm
                        action={deleteMedia.bind(null, item.id)}
                        confirmMessage={`¿Borrar "${item.filename}"? Esta acción no se puede deshacer.`}
                        className="absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <button
                          type="submit"
                          aria-label={`Borrar ${item.filename}`}
                          title="Borrar"
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-danger"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </ConfirmForm>
                    </div>
                    <p
                      className="mt-1 truncate text-[11px] text-ink-faint"
                      title={`${item.filename} — ${formatSize(item.size_bytes)}`}
                    >
                      {item.filename}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
