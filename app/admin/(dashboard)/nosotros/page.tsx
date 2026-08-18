import { AboutContentForm } from "@/components/admin/AboutContentForm";
import { AboutLocationForm } from "@/components/admin/AboutLocationForm";
import { getAboutContent } from "@/lib/queries/about";
import { getSiteSettings } from "@/lib/queries/settings";

export default async function AdminAboutPage() {
  const [content, settings] = await Promise.all([getAboutContent(), getSiteSettings()]);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Página Nosotros</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Historia, misión, visión, valores y creencias que se muestran en /nosotros.
      </p>
      <div className="mt-8">
        <AboutContentForm defaultValues={content} />
      </div>

      <div className="mt-10 border-t border-border pt-8">
        <p className="font-display text-lg font-semibold text-ink">Ubicación</p>
        <p className="mt-1 text-sm text-ink-soft">
          Dirección y coordenadas de la sede — se muestran en esta página
          junto a un mapa, y en el footer del sitio.
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
