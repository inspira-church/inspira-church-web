"use client";

import { useActionState, useState } from "react";
import { FormError } from "@/components/admin/FormError";
import { FormSection } from "@/components/admin/FormSection";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { LocationPicker } from "@/components/admin/LocationPicker";
import { PracticalInfoEditor } from "@/components/admin/PracticalInfoEditor";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { SelectField } from "@/components/ui/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import type { ActionState } from "@/lib/form-errors";
import { slugify } from "@/lib/slugify";
import type { EventPracticalInfoItem } from "@/types/content";

interface EventFormProps {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  defaultValues?: {
    name: string;
    subtitle: string | null;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    eventDate: string;
    eventTime: string | null;
    endDate: string | null;
    endTime: string | null;
    modality: "presencial" | "virtual" | "hibrido";
    locationName: string | null;
    address: string | null;
    lat: number | null;
    lng: number | null;
    locationPublic: boolean;
    category: string | null;
    capacity: number | null;
    requiresRegistration: boolean;
    registrationUrl: string | null;
    registrationStatus: "abiertas" | "ultimos_cupos" | "cerradas" | "agotado" | null;
    showCountdown: boolean;
    practicalInfo: EventPracticalInfoItem[];
    cost: string | null;
    ageRange: string | null;
    adminStatus: "activo" | "cancelado";
    published: boolean;
  };
}

const initialState: ActionState = {};

const modalityOptions = [
  { value: "presencial", label: "Presencial" },
  { value: "virtual", label: "Virtual" },
  { value: "hibrido", label: "Híbrido" },
];

const registrationStatusOptions = [
  { value: "abiertas", label: "Inscripciones abiertas" },
  { value: "ultimos_cupos", label: "Últimos cupos" },
  { value: "cerradas", label: "Inscripciones cerradas" },
  { value: "agotado", label: "Agotado" },
];

const adminStatusOptions = [
  { value: "activo", label: "Activo" },
  { value: "cancelado", label: "Cancelado" },
];

/** Sugerencias, no un catálogo — el admin puede escribir cualquier categoría propia. */
const SUGGESTED_CATEGORIES = ["Jóvenes", "Familias", "Niños", "Iglesia"];

export function EventForm({ action, defaultValues }: EventFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultValues));
  const [modality, setModality] = useState(defaultValues?.modality ?? "presencial");
  const [requiresRegistration, setRequiresRegistration] = useState(
    defaultValues?.requiresRegistration ?? false
  );
  const [lat, setLat] = useState<number | null>(defaultValues?.lat ?? null);
  const [lng, setLng] = useState<number | null>(defaultValues?.lng ?? null);

  const showLocationFields = modality !== "virtual";

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <FormError message={state.error} />

      <FormSection title="Información básica">
        <TextField
          label="Título"
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

        <TextField
          label="Subtítulo"
          name="subtitle"
          defaultValue={defaultValues?.subtitle ?? ""}
          hint="Opcional — frase corta que acompaña el título (ej: 'Cara a Cara con Jesús')."
        />

        <TextAreaField
          label="Descripción"
          name="description"
          defaultValue={defaultValues?.description ?? ""}
          hint="Se muestra en 'Sobre este evento' — déjala vacía si todavía no la tienes lista."
        />

        <ImageUploadField
          label="Imagen"
          name="imageUrl"
          bucket="events"
          defaultValue={defaultValues?.imageUrl}
        />

        <TextField
          label="Categoría"
          name="category"
          defaultValue={defaultValues?.category ?? ""}
          list="event-category-suggestions"
          hint="Opcional — ej: Jóvenes, Familias. Se usa para agrupar eventos relacionados."
        />
        <datalist id="event-category-suggestions">
          {SUGGESTED_CATEGORIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </FormSection>

      <FormSection title="Fecha y lugar">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Fecha de inicio"
            name="eventDate"
            type="date"
            defaultValue={defaultValues?.eventDate}
            required
          />
          <TextField
            label="Hora de inicio"
            name="eventTime"
            type="time"
            defaultValue={defaultValues?.eventTime ?? ""}
            hint="Opcional"
          />
        </div>
        {state.fieldErrors?.eventDate && (
          <p className="-mt-3 text-xs text-danger">{state.fieldErrors.eventDate}</p>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Fecha de finalización"
            name="endDate"
            type="date"
            defaultValue={defaultValues?.endDate ?? ""}
            hint="Opcional — solo si dura más de un día"
          />
          <TextField
            label="Hora de finalización"
            name="endTime"
            type="time"
            defaultValue={defaultValues?.endTime ?? ""}
            hint="Opcional"
          />
        </div>
        {state.fieldErrors?.endDate && (
          <p className="-mt-3 text-xs text-danger">{state.fieldErrors.endDate}</p>
        )}

        <SelectField
          label="Modalidad"
          name="modality"
          options={modalityOptions}
          value={modality}
          onChange={(e) => setModality(e.target.value as typeof modality)}
          required
        />

        {showLocationFields && (
          <>
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
              hint="Opcional — solo se muestra si 'Ubicación pública' está activada abajo."
            />

            <LocationPicker
              lat={lat}
              lng={lng}
              onChange={(newLat, newLng) => {
                setLat(newLat);
                setLng(newLng);
              }}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Latitud"
                name="lat"
                type="number"
                step="any"
                value={lat ?? ""}
                onChange={(e) => setLat(e.target.value ? Number(e.target.value) : null)}
                hint="Se llena solo al hacer clic en el mapa"
              />
              <TextField
                label="Longitud"
                name="lng"
                type="number"
                step="any"
                value={lng ?? ""}
                onChange={(e) => setLng(e.target.value ? Number(e.target.value) : null)}
                hint="Se llena solo al hacer clic en el mapa"
              />
            </div>

            <CheckboxField
              name="locationPublic"
              label="Ubicación pública (dirección y mapa visibles para todos)"
              defaultChecked={defaultValues?.locationPublic ?? true}
              hint="Desactívala si el evento es en un lugar privado — el lugar en texto se sigue mostrando, sin dirección ni mapa."
            />
          </>
        )}
      </FormSection>

      <FormSection title="Participación">
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

        <CheckboxField
          name="requiresRegistration"
          label="Requiere inscripción"
          defaultChecked={requiresRegistration}
          onChange={(e) => setRequiresRegistration(e.target.checked)}
        />

        {requiresRegistration && (
          <>
            <TextField
              label="Enlace de inscripción"
              name="registrationUrl"
              type="url"
              placeholder="https://…"
              defaultValue={defaultValues?.registrationUrl ?? ""}
              hint="WhatsApp, Google Forms o cualquier URL — el botón se adapta solo al destino."
            />
            {state.fieldErrors?.registrationUrl && (
              <p className="-mt-3 text-xs text-danger">{state.fieldErrors.registrationUrl}</p>
            )}

            <SelectField
              label="Estado de inscripción"
              name="registrationStatus"
              placeholder="Sin especificar"
              options={registrationStatusOptions}
              defaultValue={defaultValues?.registrationStatus ?? "abiertas"}
            />
          </>
        )}

        <CheckboxField
          name="showCountdown"
          label="Mostrar cuenta regresiva"
          defaultChecked={defaultValues?.showCountdown ?? false}
          hint="Para eventos especiales (campamentos, conferencias) — se calcula sola desde la fecha."
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Costo"
            name="cost"
            defaultValue={defaultValues?.cost ?? ""}
            placeholder="Gratuito / $50.000 COP"
            hint="Opcional"
          />
          <TextField
            label="Edades"
            name="ageRange"
            defaultValue={defaultValues?.ageRange ?? ""}
            placeholder="13–18 años"
            hint="Opcional"
          />
        </div>

        <SelectField
          label="Estado"
          name="adminStatus"
          options={adminStatusOptions}
          defaultValue={defaultValues?.adminStatus ?? "activo"}
          hint="Próximo/Finalizado se calculan solos por fecha — aquí solo se marca si el evento está cancelado."
          required
        />

        <CheckboxField
          name="published"
          label="Publicado (visible en el sitio público)"
          defaultChecked={defaultValues?.published ?? false}
        />
      </FormSection>

      <FormSection
        title="Información adicional"
        description="Qué llevar, transporte, punto de encuentro, fecha límite de inscripción... lo que no aplique, simplemente no lo agregues."
      >
        <PracticalInfoEditor defaultItems={defaultValues?.practicalInfo ?? []} />
      </FormSection>

      <SubmitButton cancelHref="/admin/eventos">Guardar</SubmitButton>
    </form>
  );
}
