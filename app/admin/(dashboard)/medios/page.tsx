import Image from "next/image";
import { ConfirmForm } from "@/components/admin/ConfirmForm";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { deleteMedia } from "@/lib/actions/media";
import { createClient } from "@/lib/supabase/server";
import { ALLOWED_HERO_MIME_TYPES, MAX_HERO_MEDIA_SIZE_BYTES } from "@/lib/validations/media";

function formatSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const HERO_SLOT_COUNT = 5;
const heroSlotModule = (slot: number) => `hero-slide-${slot}`;

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

  // El más reciente por módulo — si se reemplaza una foto del hero, la
  // vieja queda en la librería general de abajo (se puede borrar a mano).
  const heroSlotUrl = (slot: number) =>
    items.find((item) => item.module === heroSlotModule(slot))?.url ?? null;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Medios</h1>
      <p className="mt-1 text-sm text-ink-faint">
        Todas las imágenes subidas desde los demás módulos (prédicas, series,
        equipo…). Súbelas desde el formulario de cada uno.
      </p>

      <div className="mt-6 rounded-lg border border-border bg-paper-raised p-4">
        <p className="font-display text-lg font-semibold text-ink">
          Slide del hero de Inicio
        </p>
        <p className="mt-1 text-sm text-ink-faint">
          Hasta {HERO_SLOT_COUNT} fotos, cada una en su propio espacio. Reemplazar
          una foto no borra la anterior de la librería — bórrala manualmente
          si ya no la necesitas.
        </p>
        <p className="mt-3 rounded-md border border-border bg-paper px-3 py-2 text-sm text-ink-soft">
          <strong className="font-semibold text-ink">Medida recomendada:</strong>{" "}
          foto horizontal, mínimo <strong className="font-semibold text-ink">1920 × 1080 px</strong>{" "}
          (proporción 16:9). El hero recorta los bordes según el tamaño de
          pantalla, así que conviene dejar lo importante centrado en la foto.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: HERO_SLOT_COUNT }, (_, i) => i + 1).map((slot) => (
            <ImageUploadField
              key={slot}
              label={`Slide ${slot}`}
              name={`_hero_slide_${slot}`}
              bucket="site"
              module={heroSlotModule(slot)}
              defaultValue={heroSlotUrl(slot)}
              hint="Foto (JPG, PNG, WebP, GIF) o video corto (MP4, WebM, MOV) — máx. 40 MB"
              acceptedMimeTypes={ALLOWED_HERO_MIME_TYPES}
              maxSizeBytes={MAX_HERO_MEDIA_SIZE_BYTES}
            />
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-border-strong p-10 text-center">
          <p className="text-ink-soft">Todavía no se ha subido ninguna imagen.</p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
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
