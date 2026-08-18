import { ContactSettingsForm } from "@/components/admin/ContactSettingsForm";
import { getSiteSettings } from "@/lib/queries/settings";

export default async function AdminContactSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">
        Configuración de contacto
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        WhatsApp, redes sociales y política de privacidad — usados en el
        footer y en los formularios públicos de todo el sitio.
      </p>
      <div className="mt-8">
        <ContactSettingsForm
          defaultValues={{
            whatsappNumber: settings.whatsappNumber,
            whatsappMessage: settings.whatsappMessage,
            facebookUrl: settings.facebookUrl,
            instagramUrl: settings.instagramUrl,
            tiktokUrl: settings.tiktokUrl,
            xUrl: settings.xUrl,
            youtubeUrl: settings.youtubeUrl,
            privacyPolicyUrl: settings.privacyPolicyUrl,
          }}
        />
      </div>
    </div>
  );
}
