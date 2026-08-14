"use client";

import { useActionState, useState } from "react";
import { FormError } from "@/components/admin/FormError";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { SelectField } from "@/components/ui/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import type { ActionState } from "@/lib/form-errors";
import { slugify } from "@/lib/slugify";

interface EventFormProps {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: {
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    eventDate: string;
    eventTime: string | null;
    locationName: string | null;
    address: string | null;
    lat: number | null;
    lng: number | null;
    capacity: number | null;
    registrationUrl: string | null;
    status: "proximo" | "finalizado" | "cancelado";
    published: boolean;
  };
}

const initialState: ActionState = {};
const statusOptions = [
  { value: "proximo", label: "Próximo" },
  { value: "finalizado", label: "Finalizado" },
  { value: "cancelado", label: "Cancelado" },
];

export function EventForm({ action, defaultValues }: EventFormProps) {
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
        hint={`Se usará como /eventos/${slug || "..."}`}
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
        label="Imagen"
        name="imageUrl"
        bucket="events"
        defaultValue={defaultValues?.imageUrl}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Fecha"
          name="eventDate"
          type="date"
          defaultValue={defaultValues?.eventDate}
          required
        />
        <TextField
          label="Hora"
          name="eventTime"
          type="time"
          defaultValue={defaultValues?.eventTime ?? ""}
          hint="Opcional"
        />
      </div>

      <TextField
        label="Lugar"
        name="locationName"
        defaultValue={defaultValues?.locationName ?? ""}
        hint="Opcional"
      />
      <TextField
        label="Dirección"
        name="address"
        defaultValue={defaultValues?.address ?? ""}
        hint="Opcional — a diferencia de los grupos, la dirección del evento sí es pública."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          label="Latitud"
          name="lat"
          type="number"
          step="any"
          defaultValue={defaultValues?.lat ?? ""}
          hint="Opcional"
        />
        <TextField
          label="Longitud"
          name="lng"
          type="number"
          step="any"
          defaultValue={defaultValues?.lng ?? ""}
          hint="Opcional"
        />
      </div>

      <TextField
        label="Cupos"
        name="capacity"
        type="number"
        min={1}
        defaultValue={defaultValues?.capacity ?? ""}
        hint="Opcional — déjalo vacío si no hay límite"
      />
      {state.fieldErrors?.capacity && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.capacity}</p>
      )}

      <TextField
        label="Enlace de inscripción"
        name="registrationUrl"
        type="url"
        placeholder="https://…"
        defaultValue={defaultValues?.registrationUrl ?? ""}
        hint="Opcional"
      />
      {state.fieldErrors?.registrationUrl && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.registrationUrl}</p>
      )}

      <SelectField
        label="Estado"
        name="status"
        options={statusOptions}
        defaultValue={defaultValues?.status ?? "proximo"}
        required
      />

      <CheckboxField
        name="published"
        label="Publicado (visible en el sitio público)"
        defaultChecked={defaultValues?.published ?? false}
      />

      <SubmitButton>Guardar</SubmitButton>
    </form>
  );
}
