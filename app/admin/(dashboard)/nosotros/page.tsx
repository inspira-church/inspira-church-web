import { AboutContentForm } from "@/components/admin/AboutContentForm";
import { AboutLocationForm } from "@/components/admin/AboutLocationForm";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { getAboutContent } from "@/lib/queries/about";
import { getSiteSettings } from "@/lib/queries/settings";
import { createClient } from "@/lib/supabase/server";

const NOSOTROS_HERO_MODULE = "nosotros-hero";
const NOSOTROS_ESSENCE_MODULE = "nosotros-essence";

async function getSiteMediaUrl(supabase: Awaited<ReturnType<typeof createClient>>, module: string) {
  const { data } = await supabase
    .from("media")
    .select("path")
    .eq("module", module)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data ? supabase.storage.from("site").getPublicUrl(data.path).data.publicUrl : null;
}

export default async function AdminAboutPage() {
  const supabase = await createClient();
  const [content, settings, heroUrl, essenceUrl] = await Promise.all([
    getAboutContent(),
    getSiteSettings(),
    getSiteMediaUrl(supabase, NOSOTROS_HERO_MODULE),
    getSiteMediaUrl(supabase, NOSOTROS_ESSENCE_MODULE),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Página Nosotros</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Historia, propósito, misión, visión, valores, creencias y visita que se muestran en
        /nosotros.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-paper-raised p-4">
          <p className="font-display text-lg font-semibold text-ink">Foto principal</p>
          <p className="mt-1 text-sm text-ink-faint">
            Foto junto al título, arriba de la página. Vertical funciona mejor.
          </p>
          <div className="mt-4 max-w-xs">
            <ImageUploadField
              label="Foto principal"
              name="_nosotros_hero"
              bucket="site"
              module={NOSOTROS_HERO_MODULE}
              defaultValue={heroUrl}
              hint="Foto vertical, mínimo 900×1100px — JPG, PNG o WebP, máx. 5 MB"
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-paper-raised p-4">
          <p className="font-display text-lg font-semibold text-ink">Foto de identidad</p>
          <p className="mt-1 text-sm text-ink-faint">
            Foto a todo el ancho en &ldquo;Amamos a Dios. Amamos a las personas.&rdquo;
          </p>
          <div className="mt-4 max-w-xs">
            <ImageUploadField
              label="Foto de identidad"
              name="_nosotros_essence"
              bucket="site"
              module={NOSOTROS_ESSENCE_MODULE}
              defaultValue={essenceUrl}
              hint="Foto horizontal, mínimo 1600×900px — JPG, PNG o WebP, máx. 5 MB"
            />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <AboutContentForm defaultValues={content} />
      </div>

      <div className="mt-10 border-t border-border pt-8">
        <p className="font-display text-lg font-semibold text-ink">Ubicación</p>
        <p className="mt-1 text-sm text-ink-soft">
          Dirección y coordenadas de la sede — se muestran en esta página junto a un mapa
          grande, y en el footer del sitio.
        </p>
        <div className="mt-6">
          <AboutLocationForm
            defaultValues={{
              churchAddress: settings.churchAddress,
              churchLat: settings.churchLat,
              churchLng: settings.churchLng,
            }}
          />
        </div>
      </div>
    </div>
  );
}
