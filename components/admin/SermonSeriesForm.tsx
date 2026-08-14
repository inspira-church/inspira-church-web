"use client";

import { useActionState, useState } from "react";
import { FormError } from "@/components/admin/FormError";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import type { ActionState } from "@/lib/form-errors";
import { slugify } from "@/lib/slugify";

interface SermonSeriesFormProps {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: {
    name: string;
    slug: string;
    description: string | null;
    coverImageUrl: string | null;
    active: boolean;
  };
}

const initialState: ActionState = {};

export function SermonSeriesForm({ action, defaultValues }: SermonSeriesFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultValues));

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <FormError message={state.error} />

      <TextField
        label="Nombre"
        name="name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          if (!slugTouched) setSlug(slugify(e.target.value));
        }}
        required
      />
      {state.fieldErrors?.name && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.name}</p>
      )}

      <TextField
        label="Slug (URL)"
        name="slug"
        value={slug}
        onChange={(e) => {
          setSlug(e.target.value);
          setSlugTouched(true);
        }}
        hint={`Se usará como /series/${slug || "..."}`}
        required
      />
      {state.fieldErrors?.slug && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.slug}</p>
      )}

      <TextAreaField
        label="Descripción"
        name="description"
        defaultValue={defaultValues?.description ?? ""}
      />

      <ImageUploadField
        label="Imagen de portada"
        name="coverImageUrl"
        bucket="sermons"
        defaultValue={defaultValues?.coverImageUrl}
      />

      <CheckboxField
        name="active"
        label="Visible en el sitio público"
        defaultChecked={defaultValues?.active ?? true}
      />

      <SubmitButton>Guardar</SubmitButton>
    </form>
  );
}
