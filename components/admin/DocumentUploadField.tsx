"use client";

import { FileText } from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB — igual al límite real del bucket "documents"

interface DocumentUploadFieldProps {
  label: string;
  name: string;
  defaultValue?: string | null;
  hint?: string;
}

function sanitizeFilename(filename: string) {
  const lastDot = filename.lastIndexOf(".");
  const ext = lastDot >= 0 ? filename.slice(lastDot) : "";
  const base = (lastDot >= 0 ? filename.slice(0, lastDot) : filename)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "documento"}${ext.toLowerCase()}`;
}

/**
 * Sube un PDF directo al bucket "documents" desde el navegador (RLS ya
 * protege quién puede escribir) — sin pasar por la tabla `media`, porque
 * este no es un asset reutilizable de la librería, es un único documento
 * legal ligado a site_settings.privacyPolicyUrl. El resultado se guarda en
 * un input oculto `name`, igual que ImageUploadField.
 */
export function DocumentUploadField({ label, name, defaultValue, hint }: DocumentUploadFieldProps) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);

    if (file.type !== "application/pdf") {
      setError("Solo se admite PDF.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setError(`El archivo no puede superar ${Math.round(MAX_SIZE_BYTES / 1024 / 1024)} MB.`);
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const path = `${crypto.randomUUID()}-${sanitizeFilename(file.name)}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(path, file, { contentType: file.type });
      if (uploadError) {
        setError("No se pudo subir el archivo.");
        return;
      }

      const { data } = supabase.storage.from("documents").getPublicUrl(path);
      setUrl(data.publicUrl);
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
            "flex h-16 w-16 shrink-0 items-center justify-center rounded-md border border-border bg-paper text-ink-faint"
          )}
        >
          <FileText className="h-6 w-6" aria-hidden="true" />
        </div>

        <div className="flex-1">
          <input type="hidden" name={name} value={url} />
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-ink-soft file:mr-3 file:rounded-md file:border file:border-border-strong file:bg-paper-raised file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink hover:file:bg-paper"
          />
          {uploading && <p className="mt-1 text-xs text-ink-faint">Subiendo…</p>}
          {error && <p className="mt-1 text-xs text-danger">{error}</p>}
          {!error && url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-xs font-medium text-accent hover:underline"
            >
              Ver documento actual
            </a>
          )}
          {hint && !error && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}
        </div>
      </div>
    </div>
  );
}
