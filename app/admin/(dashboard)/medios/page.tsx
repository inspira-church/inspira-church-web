import Image from "next/image";
import { ConfirmForm } from "@/components/admin/ConfirmForm";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { deleteMedia } from "@/lib/actions/media";
import { createClient } from "@/lib/supabase/server";

function formatSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default async function AdminMediaPage() {
  const supabase = await createClient();
  const { data: media } = await supabase
    .from("media")
    .select("id, bucket, path, filename, size_bytes, created_at")
    .order("created_at", { ascending: false });

  const items = (media ?? []).map((item) => ({
    ...item,
    url: supabase.storage.from(item.bucket).getPublicUrl(item.path).data.publicUrl,
  }));

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Medios</h1>
      <p className="mt-1 text-sm text-ink-faint">
        Todas las imágenes subidas desde los demás módulos (prédicas, series,
        equipo…). Súbelas desde el formulario de cada uno.
      </p>

      {items.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border-strong p-10 text-center">
          <p className="text-ink-soft">Todavía no se ha subido ninguna imagen.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative aspect-square bg-paper">
                <Image src={item.url} alt="" fill className="object-cover" sizes="240px" />
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium text-ink" title={item.filename}>
                  {item.filename}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <Badge>{item.bucket}</Badge>
                  <span className="text-xs text-ink-faint">
                    {formatSize(item.size_bytes)}
                  </span>
                </div>
                <ConfirmForm
                  action={deleteMedia.bind(null, item.id)}
                  confirmMessage={`¿Borrar "${item.filename}"? Esta acción no se puede deshacer.`}
                  className="mt-3"
                >
                  <button
                    type="submit"
                    className="w-full rounded-md border border-border-strong px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-danger/40 hover:text-danger"
                  >
                    Borrar
                  </button>
                </ConfirmForm>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
