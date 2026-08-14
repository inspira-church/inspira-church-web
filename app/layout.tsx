import type { Metadata } from "next";
import { Figtree, Petrona } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "Inspira Church",
  description:
    "Sitio oficial de Inspira Church: prédicas, grupos de crecimiento, eventos y horarios.",
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
