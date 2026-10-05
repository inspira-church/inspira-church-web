"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createMediaRecord, unlinkMediaSlot } from "@/lib/actions/media";
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
  /**
   * Muestra "Quitar foto" cuando hay una imagen. Solo para imágenes opcionales.
   * - Campo de una fila (sin `module`): deja el valor vacío y se persiste como
   *   null al guardar el formulario.
   * - Slot (con `module`): la foto vigente es la última fila de `media` de ese
   *   módulo, así que se desvincula de inmediato en el servidor (igual que una
   *   subida se publica de inmediato). En ambos casos el archivo NO se borra de
   *   Storage: eso se decide en /admin/medios.
   */
  removable?: boolean;
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
  removable = false,
}: ImageUploadFieldProps) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removing, setRemoving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
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
    setNotice(null);

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

  async function handleRemove() {
    setError(null);
    setNotice(null);

    if (mediaModule) {
      if (
        !window.confirm(
          "¿Quitar esta foto del sitio? Dejará de mostrarse de inmediato; el archivo seguirá en la librería de medios."
        )
      ) {
        return;
      }
      setRemoving(true);
      try {
        const result = await unlinkMediaSlot(mediaModule);
        if ("error" in result) {
          setError(result.error);
          return;
        }
      } finally {
        setRemoving(false);
      }
      setNotice("Foto quitada del sitio.");
    } else {
      setNotice("Foto quitada. Guarda el formulario para aplicar el cambio.");
    }

    setUrl("");
    // Permite volver a elegir el mismo archivo después de quitarlo.
    if (inputRef.current) inputRef.current.value = "";
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
          {removable && url && !uploading && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={removing}
              className="mt-2 text-sm text-ink-soft underline-offset-2 hover:text-danger hover:underline disabled:opacity-50"
            >
              {removing ? "Quitando…" : "Quitar foto"}
            </button>
          )}
          {error && <p className="mt-1 text-xs text-danger">{error}</p>}
          {notice && !error && (
            <p role="status" className="mt-1 text-xs text-ink-soft">
              {notice}
            </p>
          )}
          {hint && !error && !notice && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}
        </div>
      </div>
    </div>
  );
}
