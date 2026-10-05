"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createMediaRecord } from "@/lib/actions/media";
import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/validations/media";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type MediaBucket = "sermons" | "events" | "pastors" | "groups" | "site";

interface ImageUploadFieldProps {
  label: string;
  name: string;
  bucket: MediaBucket;
  defaultValue?: string | null;
  hint?: string;
  /** Por defecto usa el bucket. Sirve para distinguir "slots" dentro de un mismo bucket (ver hero de Inicio). */
  module?: string;
  /** Por defecto solo imágenes (JPEG/PNG/WebP). Pasar ALLOWED_HERO_MIME_TYPES para admitir GIF y video corto. */
  acceptedMimeTypes?: readonly string[];
  /** Por defecto 5 MB. Debe coincidir con el límite real del bucket en Supabase Storage. */
  maxSizeBytes?: number;
}

/** El valor guardado es solo una URL — el formato se infiere de la extensión para decidir <video> vs <img>. */
function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url);
}

function sanitizeFilename(filename: string) {
  const lastDot = filename.lastIndexOf(".");
  const ext = lastDot >= 0 ? filename.slice(lastDot) : "";
  const base = (lastDot >= 0 ? filename.slice(0, lastDot) : filename)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "imagen"}${ext.toLowerCase()}`;
}

/**
 * Sube directo al bucket de Storage desde el navegador (RLS ya protege
 * quién puede escribir) y registra los metadatos en `media` vía Server
 * Action. El resultado se guarda en un input oculto `name` para que el
 * formulario que lo envuelve lo mande junto con el resto de sus campos.
 */
export function ImageUploadField({
  label,
  name,
  bucket,
  defaultValue,
  hint,
  module: mediaModule,
  acceptedMimeTypes = ALLOWED_IMAGE_MIME_TYPES,
  maxSizeBytes = MAX_IMAGE_SIZE_BYTES,
}: ImageUploadFieldProps) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mientras la imagen sube, el input oculto `name` todavía está vacío (o con
  // la foto anterior). Si el formulario se enviara ahora, guardaría sin la
  // foto nueva y la subida terminaría "en el vacío". Un customValidity en el
  // input de archivo hace que el navegador bloquee el envío y lo explique.
  useEffect(() => {
    inputRef.current?.setCustomValidity(
      uploading ? "Espera a que termine de subir la imagen antes de guardar." : ""
    );
  }, [uploading]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || uploading) return;
    setError(null);

    if (!acceptedMimeTypes.includes(file.type)) {
      setError("Ese formato de archivo no está permitido.");
      return;
    }
    if (file.size > maxSizeBytes) {
      setError(`El archivo no puede superar ${Math.round(maxSizeBytes / 1024 / 1024)} MB.`);
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const path = `${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;

      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
        contentType: file.type,
      });
      if (uploadError) {
        setError("No se pudo subir el archivo.");
        return;
      }

      const result = await createMediaRecord({
        bucket,
        path,
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        module: mediaModule ?? bucket,
      });

      if ("error" in result) {
        setError(result.error);
        return;
      }

      setUrl(result.data.url);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="text-sm font-medium text-ink">{label}</label>

      <div className="mt-1.5 flex items-start gap-4">
        <div
          className={cn(
            "relative h-24 w-24 shrink-0 overflow-hidden rounded-md border border-border bg-paper",
            !url && "flex items-center justify-center"
          )}
        >
          {url ? (
            isVideoUrl(url) ? (
              <video src={url} className="h-full w-full object-cover" muted playsInline />
            ) : (
              <Image src={url} alt="" fill className="object-cover" sizes="96px" />
            )
          ) : (
            <span className="text-xs text-ink-faint">Sin imagen</span>
          )}
        </div>

        <div className="flex-1">
          <input type="hidden" name={name} value={url} />
          <input
            ref={inputRef}
            type="file"
            accept={acceptedMimeTypes.join(",")}
            onChange={handleFileChange}
            // Sin `disabled`: un input deshabilitado queda fuera de la validación
            // del formulario y el customValidity de arriba no bloquearía el envío.
            className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-md file:border file:border-border-strong file:bg-paper-raised file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink hover:file:bg-paper"
          />
          {uploading && <p className="mt-1 text-xs text-ink-faint">Subiendo…</p>}
          {error && <p className="mt-1 text-xs text-danger">{error}</p>}
          {hint && !error && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}
        </div>
      </div>
    </div>
  );
}
