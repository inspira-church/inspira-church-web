import { SettingsForm } from "@/components/admin/SettingsForm";
import { getSiteSettings } from "@/lib/queries/settings";

export default async function SettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Configuración</h1>
      <div className="mt-8">
        <SettingsForm defaultValues={settings} />
      </div>
    </div>
  );
}
