import { FirstTimeSettingsForm } from "@/components/admin/FirstTimeSettingsForm";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { getSiteSettings } from "@/lib/queries/settings";
import { createClient } from "@/lib/supabase/server";

const PRIMERA_VEZ_HERO_MODULE = "primera-vez-hero";

export default async function AdminFirstTimePage() {
  const [settings, supabase] = await Promise.all([getSiteSettings(), createClient()]);
  const { data: media } = await supabase
    .from("media")
    .select("path")
    .eq("module", PRIMERA_VEZ_HERO_MODULE)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const heroUrl = media
    ? supabase.storage.from("site").getPublicUrl(media.path).data.publicUrl
    : null;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Primera vez</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Contenido de la página /primera-vez, dirigida a quien visita la
        iglesia por primera vez.
      </p>

      <div className="mt-6 rounded-lg border border-border bg-paper-raised p-4">
        <p className="font-display text-lg font-semibold text-ink">
          Foto de portada
        </p>
        <p className="mt-1 text-sm text-ink-faint">
          Foto arriba de la página, con degradado oscuro y el título
          superpuesto.
        </p>
        <div className="mt-4 max-w-xs">
          <ImageUploadField
            label="Foto de portada"
            name="_primera_vez_hero"
            bucket="site"
            module={PRIMERA_VEZ_HERO_MODULE}
            defaultValue={heroUrl}
            hint="Foto horizontal, mínimo 1600×900px — JPG, PNG o WebP, máx. 5 MB"
          />
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-paper-raised p-4">
        <FirstTimeSettingsForm
          defaultValues={{ firstTimeHeroText: settings.firstTimeHeroText }}
        />
      </div>
    </div>
  );
}
