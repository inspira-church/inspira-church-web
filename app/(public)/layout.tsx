import type { ReactNode } from "react";
import { ContactFAB } from "@/components/public/ContactFAB";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { getSiteSettings } from "@/lib/queries/settings";

/**
 * El contenido público cambia pocas veces por semana (vía el panel admin) —
 * servir cacheado 60s en vez de pegarle a Supabase en cada visita es una
 * mejora de rendimiento real sin arriesgar frescura perceptible. El panel
 * admin (app/admin) sigue siendo 100% dinámico, sin este export.
 */
export const revalidate = 60;

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer
        whatsappNumber={settings.whatsappNumber}
        facebookUrl={settings.facebookUrl}
        instagramUrl={settings.instagramUrl}
        tiktokUrl={settings.tiktokUrl}
        xUrl={settings.xUrl}
        youtubeUrl={settings.youtubeUrl}
        churchAddress={settings.churchAddress}
        churchLat={settings.churchLat}
        churchLng={settings.churchLng}
        privacyPolicyUrl={settings.privacyPolicyUrl}
      />
      <ContactFAB
        whatsappMessage={settings.whatsappMessage}
        whatsappNumber={settings.whatsappNumber}
        contactEmail={settings.contactEmail}
      />
    </div>
  );
}
