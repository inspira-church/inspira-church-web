import { HomeSettingsForm } from "@/components/admin/HomeSettingsForm";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { getSiteSettings } from "@/lib/queries/settings";
import { createClient } from "@/lib/supabase/server";
import { ALLOWED_HERO_MIME_TYPES, MAX_HERO_MEDIA_SIZE_BYTES } from "@/lib/validations/media";

const HERO_SLOT_COUNT = 5;
const heroSlotModule = (slot: number) => `hero-slide-${slot}`;

export default async function AdminHomePage() {
  const [settings, supabase] = await Promise.all([getSiteSettings(), createClient()]);
  const modules = Array.from({ length: HERO_SLOT_COUNT }, (_, i) => heroSlotModule(i + 1));
  const { data: media } = await supabase
    .from("media")
    .select("path, module, created_at")
    .in("module", modules)
    .order("created_at", { ascending: false });

  const heroSlotUrl = (slot: number) => {
    const item = (media ?? []).find((row) => row.module === heroSlotModule(slot));
    return item ? supabase.storage.from("site").getPublicUrl(item.path).data.publicUrl : null;
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Inicio</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Contenido del hero de la página de Inicio: fotos/video del slide y
        los textos que aparecen sobre ellas.
      </p>

      <div className="mt-6 rounded-lg border border-border bg-paper-raised p-4">
        <p className="font-display text-lg font-semibold text-ink">Slide del hero</p>
        <p className="mt-1 text-sm text-ink-faint">
          Hasta {HERO_SLOT_COUNT} fotos, cada una en su propio espacio.
          Reemplazar una foto no borra la anterior de la librería — bórrala
          manualmente en Medios si ya no la necesitas.
        </p>
        <p className="mt-3 rounded-md border border-border bg-paper px-3 py-2 text-sm text-ink-soft">
          <strong className="font-semibold text-ink">Medida recomendada:</strong>{" "}
          foto horizontal, mínimo{" "}
          <strong className="font-semibold text-ink">1920 × 1080 px</strong>{" "}
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

      <div className="mt-6 rounded-lg border border-border bg-paper-raised p-4">
        <HomeSettingsForm
          defaultValues={{
            heroText1: settings.heroText1,
            heroText2: settings.heroText2,
            youtubeChannelId: settings.youtubeChannelId,
          }}
        />
      </div>
    </div>
  );
}
