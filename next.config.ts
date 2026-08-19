import type { NextConfig } from "next";

// CSP en una sola línea porque el header HTTP no admite saltos de línea reales.
// 'unsafe-eval' solo en desarrollo: React lo usa para reconstruir stack
// traces en el modo dev (nunca en producción, confirmado por el propio
// mensaje de React) — no tiene sentido debilitar la política de producción
// por una herramienta de depuración que ahí ni se activa.
const SCRIPT_SRC = [
  "'self'",
  "'unsafe-inline'",
  process.env.NODE_ENV !== "production" && "'unsafe-eval'",
  "https://challenges.cloudflare.com",
]
  .filter(Boolean)
  .join(" ");

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  `script-src ${SCRIPT_SRC}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https://*.supabase.co https://*.tile.openstreetmap.org https://img.youtube.com https://i.ytimg.com",
  "font-src 'self'",
  "connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com",
  "frame-src https://www.youtube.com https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage (Fase 8 en adelante: prédicas, series, equipo, grupos, eventos).
      { protocol: "https", hostname: "*.supabase.co" },
      // Fallback de miniatura para prédicas sin thumbnail_url propio (LazySermonVideo) — ya
      // permitido en img-src de la CSP, solo faltaba aquí para poder usar next/image.
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },
};

export default nextConfig;
