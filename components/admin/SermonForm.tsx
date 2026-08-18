"use client";

import { useActionState, useState } from "react";
import { FormError } from "@/components/admin/FormError";
import { FormSection } from "@/components/admin/FormSection";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { SelectField } from "@/components/ui/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import type { ActionState } from "@/lib/form-errors";
import { slugify } from "@/lib/slugify";

interface Option {
  value: string;
  label: string;
}

interface SermonFormProps {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  seriesOptions: Option[];
  preacherOptions: Option[];
  /** Precarga el campo "Temas" en una prédica nueva (ej. "Oración" desde /admin/oraciones/nuevo). Ignorado si hay defaultValues. */
  defaultTopics?: string;
  /** A dónde vuelve "Cancelar" — /admin/predicas por defecto, /admin/oraciones desde ese módulo. */
  cancelHref?: string;
  defaultValues?: {
    title: string;
    slug: string;
    seriesId: string | null;
    preacherId: string | null;
    description: string | null;
    youtubeUrl: string;
    thumbnailUrl: string | null;
    sermonDate: string;
    topics: string[];
    published: boolean;
  };
}

const initialState: ActionState = {};

export function SermonForm({
  action,
  seriesOptions,
  preacherOptions,
  defaultTopics,
  cancelHref = "/admin/predicas",
  defaultValues,
}: SermonFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultValues));

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <FormError message={state.error} />

      <FormSection title="Detalles">
        <TextField
          label="Título"
          name="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          required
        />
        {state.fieldErrors?.title && (
          <p className="-mt-3 text-xs text-danger">{state.fieldErrors.title}</p>
        )}

        <TextField
          label="Slug (URL)"
          name="slug"
          value={slug}
          onChange={(e) => {
            setSlug(e.target.value);
            setSlugTouched(true);
          }}
          hint={`Se usará como /predicas/${slug || "..."}`}
          required
        />
        {state.fieldErrors?.slug && (
          <p className="-mt-3 text-xs text-danger">{state.fieldErrors.slug}</p>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Serie"
            name="seriesId"
            placeholder="Sin serie"
            options={seriesOptions}
            defaultValue={defaultValues?.seriesId ?? ""}
          />
          <SelectField
            label="Predicador"
            name="preacherId"
            placeholder="Sin especificar"
            options={preacherOptions}
            defaultValue={defaultValues?.preacherId ?? ""}
          />
        </div>

        <TextField
          label="Fecha"
          name="sermonDate"
          type="date"
          defaultValue={defaultValues?.sermonDate}
          required
        />
        {state.fieldErrors?.sermonDate && (
          <p className="-mt-3 text-xs text-danger">{state.fieldErrors.sermonDate}</p>
        )}
      </FormSection>

      <FormSection title="Contenido">
        <TextField
          label="Enlace de YouTube"
          name="youtubeUrl"
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          defaultValue={defaultValues?.youtubeUrl}
          required
        />
        {state.fieldErrors?.youtubeUrl && (
          <p className="-mt-3 text-xs text-danger">{state.fieldErrors.youtubeUrl}</p>
        )}

        <TextAreaField
          label="Descripción"
          name="description"
          defaultValue={defaultValues?.description ?? ""}
        />

        <TextField
          label="Temas"
          name="topics"
          defaultValue={defaultValues?.topics.join(", ") ?? defaultTopics}
          hint="Separados por coma — ej: fe, familia, propósito"
        />

        <ImageUploadField
          label="Miniatura"
          name="thumbnailUrl"
          bucket="sermons"
          defaultValue={defaultValues?.thumbnailUrl}
        />
      </FormSection>

      <FormSection title="Publicación">
        <CheckboxField
          name="published"
          label="Publicada (visible en el sitio público)"
          defaultChecked={defaultValues?.published ?? false}
        />
      </FormSection>

      <SubmitButton cancelHref={cancelHref}>Guardar</SubmitButton>
    </form>
  );
}
