import { GenerationsContentForm } from "@/components/admin/GenerationsContentForm";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { getGenerationsContent } from "@/lib/queries/generations";
import { GENERATIONS_PHOTO_MODULES } from "@/lib/generations-photo-modules";
import { getGenerationsMediaForAdmin } from "@/lib/queries/generations-media";

const SECTION_PHOTOS = [
  { key: GENERATIONS_PHOTO_MODULES.hero, label: "Foto — Hero", hint: "Foto de fondo del encabezado de la página." },
  { key: GENERATIONS_PHOTO_MODULES.legacy1, label: "Foto — Legado 1", hint: "Primera foto del bloque 'Una generación cuenta a la otra'." },
  { key: GENERATIONS_PHOTO_MODULES.legacy2, label: "Foto — Legado 2", hint: "Segunda foto del mismo bloque." },
  { key: GENERATIONS_PHOTO_MODULES.altar, label: "Foto — Toda área es altar", hint: "Foto de fondo de esa sección." },
  { key: GENERATIONS_PHOTO_MODULES.families, label: "Foto — Familias", hint: "Foto junto a 'No formamos generaciones solos'." },
  { key: GENERATIONS_PHOTO_MODULES.cta, label: "Foto — CTA final", hint: "Foto de fondo de 'Hay un lugar para ti'." },
] as const;

export default async function AdminGenerationsPage() {
  const [content, mediaMap] = await Promise.all([getGenerationsContent(), getGenerationsMediaForAdmin()]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Página Generaciones</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Todo el contenido de /generaciones: hero, áreas de servicio, proceso, seguridad, preguntas
        frecuentes y el CTA final.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTION_PHOTOS.map((photo) => (
          <div key={photo.key} className="rounded-lg border border-border bg-paper-raised p-4">
            <p className="font-display text-base font-semibold text-ink">{photo.label}</p>
            <p className="mt-1 text-xs text-ink-faint">{photo.hint}</p>
            <div className="mt-3 max-w-xs">
              <ImageUploadField
                label={photo.label}
                name={`_${photo.key}`}
                bucket="site"
                module={photo.key}
                defaultValue={mediaMap[photo.key] ?? null}
                hint="JPG, PNG o WebP, máx. 5 MB"
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <GenerationsContentForm defaultValues={content} mediaMap={mediaMap} />
      </div>
    </div>
  );
}
