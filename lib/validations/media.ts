import { z } from "zod";

export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB, igual al límite del bucket

export const mediaBuckets = ["sermons", "events", "pastors", "groups", "site"] as const;

export const createMediaRecordSchema = z.object({
  bucket: z.enum(mediaBuckets),
  path: z.string().min(1),
  filename: z.string().min(1),
  mimeType: z.enum(ALLOWED_IMAGE_MIME_TYPES),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(MAX_IMAGE_SIZE_BYTES, "La imagen no puede superar 5 MB."),
  altText: z.string().trim().max(200).optional(),
  module: z.string().trim().max(50).optional(),
});
