"use server";

import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { createClient } from "@/lib/supabase/server";
import { createMediaRecordSchema } from "@/lib/validations/media";

export interface CreateMediaInput {
  bucket: string;
  path: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  altText?: string;
  module?: string;
}

type CreateMediaResult = { error: string } | { data: { id: string; url: string } };

/**
 * Registra en `media` un archivo que el navegador ya subió directamente a
 * Storage (ver components/admin/ImageUploadField.tsx). No sube nada él
 * mismo — solo guarda los metadatos y devuelve la URL pública.
 */
export async function createMediaRecord(input: CreateMediaInput): Promise<CreateMediaResult> {
  const parsed = createMediaRecordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos de imagen inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sesión expirada. Vuelve a ingresar." };
  }

  const { data, error } = await supabase
    .from("media")
    .insert({
      bucket: parsed.data.bucket,
      path: parsed.data.path,
      filename: parsed.data.filename,
      mime_type: parsed.data.mimeType,
      size_bytes: parsed.data.sizeBytes,
      alt_text: parsed.data.altText,
      module: parsed.data.module,
      uploaded_by: user.id,
    })
    .select("id, bucket, path")
    .single();

  if (error) {
    return { error: "No se pudo registrar la imagen." };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(data.bucket).getPublicUrl(data.path);

  revalidatePath("/admin/medios");
  if (parsed.data.module?.startsWith("hero-slide-")) {
    revalidatePath("/");
    await logAudit({
      module: "home",
      action: "update",
      entityType: "media",
      entityId: data.id,
      description: `Reemplazó una foto/video del hero de Inicio (${parsed.data.module}).`,
    });
  }
  if (parsed.data.module === "primera-vez-hero") {
    revalidatePath("/primera-vez");
    await logAudit({
      module: "first_time",
      action: "update",
      entityType: "media",
      entityId: data.id,
      description: 'Reemplazó la foto de portada de "Primera vez".',
    });
  }
  return { data: { id: data.id, url: publicUrl } };
}

export async function deleteMedia(mediaId: string) {
  const supabase = await createClient();

  const { data: media, error: fetchError } = await supabase
    .from("media")
    .select("bucket, path")
    .eq("id", mediaId)
    .single();

  if (fetchError || !media) {
    return { error: "No se encontró la imagen." };
  }

  const { error: storageError } = await supabase.storage
    .from(media.bucket)
    .remove([media.path]);
  if (storageError) {
    return { error: "No se pudo borrar el archivo del almacenamiento." };
  }

  const { error: deleteError } = await supabase.from("media").delete().eq("id", mediaId);
  if (deleteError) {
    return { error: "El archivo se borró pero no se pudo quitar el registro." };
  }

  revalidatePath("/admin/medios");
  return { success: true };
}
