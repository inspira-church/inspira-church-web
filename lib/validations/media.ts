import { z } from "zod";

export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB, igual al límite del bucket

/**
 * Formatos extra permitidos solo para el hero de Inicio (bucket "site"),
 * que ya admite fotos o video corto — ver components/public/Hero.tsx.
 * El límite real también se aplica en Supabase Storage a nivel del bucket
 * (ver supabase/migrations/013_site_bucket_hero_media_formats.sql).
 */
export const ALLOWED_HERO_MIME_TYPES = [
  ...ALLOWED_IMAGE_MIME_TYPES,
  "image/gif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;
export const MAX_HERO_MEDIA_SIZE_BYTES = 40 * 1024 * 1024; // 40 MB — video corto

export const mediaBuckets = ["sermons", "events", "pastors", "groups", "site"] as const;

export const createMediaRecordSchema = z.object({
  bucket: z.enum(mediaBuckets),
  path: z.string().min(1),
  filename: z.string().min(1),
  mimeType: z.enum(ALLOWED_HERO_MIME_TYPES),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(MAX_HERO_MEDIA_SIZE_BYTES, "El archivo no puede superar 40 MB."),
  altText: z.string().trim().max(200).optional(),
  module: z.string().trim().max(50).optional(),
});
