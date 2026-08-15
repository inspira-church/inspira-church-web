import type { Metadata } from "next";
import { Figtree, Petrona } from "next/font/google";
import "./globals.css";
import { SITE_URL } from "@/lib/constants";

const figtree = Figtree({
  variable: "--font-figtree",
  weight: "variable",
  subsets: ["latin"],
});

const petrona = Petrona({
  variable: "--font-petrona",
  weight: "variable",
  subsets: ["latin"],
});

const SITE_DESCRIPTION =
  "Sitio oficial de Inspira Church: prédicas, grupos de crecimiento, eventos y horarios.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Inspira Church",
  description: SITE_DESCRIPTION,
  openGraph: {
    title: "Inspira Church",
    description: SITE_DESCRIPTION,
    siteName: "Inspira Church",
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Inspira Church",
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${figtree.variable} ${petrona.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
