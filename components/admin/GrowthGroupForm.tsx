"use client";

import { useActionState, useState } from "react";
import { FormError } from "@/components/admin/FormError";
import { LocationPicker } from "@/components/admin/LocationPicker";
import { SubmitButton } from "@/components/admin/SubmitButton";
import { CheckboxField } from "@/components/ui/CheckboxField";
import { SelectField } from "@/components/ui/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField";
import { TextField } from "@/components/ui/TextField";
import { DAY_NAMES } from "@/lib/constants";
import type { ActionState } from "@/lib/form-errors";
import { slugify } from "@/lib/slugify";

interface Option {
  value: string;
  label: string;
}

interface GrowthGroupFormProps {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  teamMemberOptions: Option[];
  defaultValues?: {
    name: string;
    slug: string;
    groupType: string;
    description: string | null;
    city: string;
    locality: string | null;
    sector: string | null;
    latApprox: number | null;
    lngApprox: number | null;
    dayOfWeek: number;
    timeOfDay: string;
    leaderId: string | null;
    coleaderId: string | null;
    exactAddress: string | null;
    leaderPhonePrivate: string | null;
    internalNotes: string | null;
    active: boolean;
    locationPublic: boolean;
  };
}

const initialState: ActionState = {};
const dayOptions = DAY_NAMES.map((day, index) => ({ value: String(index), label: day }));

export function GrowthGroupForm({ action, teamMemberOptions, defaultValues }: GrowthGroupFormProps) {
  const [state, formAction] = useActionState(action, initialState);
  const [name, setName] = useState(defaultValues?.name ?? "");
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultValues));
  const [lat, setLat] = useState<number | null>(defaultValues?.latApprox ?? null);
  const [lng, setLng] = useState<number | null>(defaultValues?.lngApprox ?? null);

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <FormError message={state.error} />

      <h2 className="font-display text-lg font-semibold text-ink">Información pública</h2>
      <p className="-mt-3 text-xs text-ink-faint">
        Visible en el sitio — nunca incluye la dirección exacta.
      </p>

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
        hint={`Se usará como /grupos/${slug || "..."}`}
        required
      />
      {state.fieldErrors?.slug && (
        <p className="-mt-3 text-xs text-danger">{state.fieldErrors.slug}</p>
      )}

      <TextField
        label="Tipo de grupo"
        name="groupType"
        placeholder="Ej: Jóvenes, Matrimonios, Células familiares…"
        defaultValue={defaultValues?.groupType}
        required
      />

      <TextAreaField
        label="Descripción"
        name="description"
        defaultValue={defaultValues?.description ?? ""}
      />

      <div className="grid gap-5 sm:grid-cols-3">
        <TextField label="Ciudad" name="city" defaultValue={defaultValues?.city ?? "Bogotá"} required />
        <TextField label="Localidad" name="locality" defaultValue={defaultValues?.locality ?? ""} />
        <TextField label="Sector / barrio" name="sector" defaultValue={defaultValues?.sector ?? ""} />
      </div>

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
          label="Latitud aproximada"
          name="latApprox"
          type="number"
          step="any"
          value={lat ?? ""}
          onChange={(e) => setLat(e.target.value === "" ? null : Number(e.target.value))}
          hint="Del sector, no de la vivienda — o haz clic en el mapa arriba"
        />
        <TextField
          label="Longitud aproximada"
          name="lngApprox"
          type="number"
          step="any"
          value={lng ?? ""}
          onChange={(e) => setLng(e.target.value === "" ? null : Number(e.target.value))}
        />
      </div>

      <CheckboxField
        name="locationPublic"
        label="Mostrar ubicación exacta públicamente"
        defaultChecked={defaultValues?.locationPublic ?? true}
        hint="Desactiva esta opción para grupos que se reúnen en una vivienda particular. En ese caso, el sitio mostrará únicamente el sector o barrio, sin pin en el mapa."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Día"
          name="dayOfWeek"
          options={dayOptions}
          defaultValue={String(defaultValues?.dayOfWeek ?? 0)}
          required
        />
        <TextField
          label="Hora"
          name="timeOfDay"
          type="time"
          defaultValue={defaultValues?.timeOfDay}
          required
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Líder"
          name="leaderId"
          placeholder="Sin asignar"
          options={teamMemberOptions}
          defaultValue={defaultValues?.leaderId ?? ""}
        />
        <SelectField
          label="Colíder"
          name="coleaderId"
          placeholder="Sin asignar"
          options={teamMemberOptions}
          defaultValue={defaultValues?.coleaderId ?? ""}
        />
      </div>

      <CheckboxField
        name="active"
        label="Visible en el sitio público"
        defaultChecked={defaultValues?.active ?? true}
      />

      <h2 className="pt-2 font-display text-lg font-semibold text-ink">
        Información privada
      </h2>
      <p className="-mt-3 text-xs text-ink-faint">
        Solo visible dentro del panel — nunca se muestra en el sitio público.
      </p>

      <TextField
        label="Dirección exacta"
        name="exactAddress"
        defaultValue={defaultValues?.exactAddress ?? ""}
        hint="Se comparte manualmente al confirmar asistencia"
      />
      <TextField
        label="Teléfono personal del líder"
        name="leaderPhonePrivate"
        type="tel"
        defaultValue={defaultValues?.leaderPhonePrivate ?? ""}
      />
      <TextAreaField
        label="Notas internas"
        name="internalNotes"
        defaultValue={defaultValues?.internalNotes ?? ""}
      />

      <SubmitButton>Guardar</SubmitButton>
    </form>
  );
}
