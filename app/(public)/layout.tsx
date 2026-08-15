import type { ReactNode } from "react";
import { Footer } from "@/components/public/Footer";
import { Header } from "@/components/public/Header";
import { WhatsAppButton } from "@/components/public/WhatsAppButton";
import { getSiteSettings } from "@/lib/queries/settings";

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
        youtubeUrl={settings.youtubeUrl}
      />
      <WhatsAppButton message={settings.whatsappMessage} number={settings.whatsappNumber} />
    </div>
  );
}
