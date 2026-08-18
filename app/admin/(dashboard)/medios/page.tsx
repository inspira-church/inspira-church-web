import Image from "next/image";
import { Image as ImageIcon } from "lucide-react";
import { ConfirmForm } from "@/components/admin/ConfirmForm";
import { EmptyState } from "@/components/admin/EmptyState";
import { PageHeader } from "@/components/admin/PageHeader";
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
    .select("id, bucket, path, filename, mime_type, size_bytes, module, created_at")
    .order("created_at", { ascending: false });

  const items = (media ?? []).map((item) => ({
    ...item,
    url: supabase.storage.from(item.bucket).getPublicUrl(item.path).data.publicUrl,
  }));

  return (
    <div>
      <PageHeader
        title="Librería de medios"
        description="Todas las imágenes y videos subidos desde los demás módulos (prédicas, series, equipo, Inicio, Primera vez…). Súbelos desde el formulario de cada uno — esta página es solo para verlos todos juntos y borrar los que ya no se usan."
      />

      {items.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="Todavía no se ha subido ninguna imagen."
          description="Sube fotos o videos desde el formulario del módulo correspondiente — aparecerán aquí."
          className="mt-8"
        />
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <Card key={item.id} interactive className="overflow-hidden">
              <div className="relative aspect-square bg-paper">
                {item.mime_type?.startsWith("video/") ? (
                  <video src={item.url} className="h-full w-full object-cover" muted playsInline />
                ) : (
                  <Image src={item.url} alt="" fill className="object-cover" sizes="240px" />
                )}
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
