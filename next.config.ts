import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Placeholder de desarrollo (Fase 5) — se retira cuando las imágenes
      // vengan de Supabase Storage.
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      // Supabase Storage (todas las fases desde el CRUD de contenido en adelante).
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
